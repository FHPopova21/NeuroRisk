from flask import Blueprint, request, jsonify
from api.database import schemas, database
from api.services import patients
from api.utils.jwt_helpers import token_required, role_required
from pydantic import ValidationError

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['POST'])
@token_required
@role_required('doctor')
def register_new_patient(current_user):
    """
    Ендпойнт за създаване на нов пациент от лекар.
    """
    data = request.get_json()
    doctor_id = current_user.id

    if not doctor_id:
        return jsonify({"detail": "Липсва doctor_id"}), 400

    try:
        patient_create = schemas.PatientCreate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        new_patient, token = patients.create_patient(db=db, patient_data=patient_create, doctor_id=doctor_id)
        
        response_data = schemas.Patient.model_validate(new_patient).model_dump()
        response_data["activation_token"] = token
        return jsonify(response_data), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@patients_bp.route('/', methods=['GET'])
@token_required
@role_required('doctor')
def get_my_patients(current_user):
    """
    Връща списък с пациенти за текущо логнатия лекар.
    """
    db = next(database.get_db())
    try:
        doctor_id = current_user.id
        results = patients.get_patients_by_doctor(db=db, doctor_id=doctor_id)
        return jsonify([schemas.Patient.model_validate(p).model_dump() for p in results]), 200
    finally:
        db.close()

@patients_bp.route('/<patient_id>', methods=['GET'])
@token_required
def get_patient_details(current_user, patient_id):
    """
    Връща детайли за конкретен пациент.
    """
    db = next(database.get_db())
    try:
        patient = patients.get_patient_by_id(db=db, patient_id=patient_id)
        if not patient:
            return jsonify({"detail": "Пациентът не е намерен"}), 404
        return jsonify(schemas.Patient.model_validate(patient).model_dump()), 200
    finally:
        db.close()

@patients_bp.route('/doctor/<doctor_id>', methods=['GET'])
@token_required
@role_required('doctor')
def get_doctor_patients(current_user, doctor_id):
    """
    Връща списък с пациенти за конкретен лекар.
    """
    db = next(database.get_db())
    try:
        results = patients.get_patients_by_doctor(db=db, doctor_id=doctor_id)
        return jsonify([schemas.Patient.model_validate(p).model_dump() for p in results]), 200
    finally:
        db.close()

import os
from flask import current_app
from werkzeug.utils import secure_filename
import uuid

ALLOWED_EXTENSIONS = {'txt', 'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@patients_bp.route('/<patient_id>/lab-analysis', methods=['POST'])
@token_required
@role_required('doctor')
def upload_lab_analysis(current_user, patient_id):
    """
    Качване на лабораторен анализ (файл) за даден пациент.
    """
    if 'file' not in request.files:
        return jsonify({"detail": "Няма прикачен файл"}), 400
        
    file = request.files['file']
    notes = request.form.get('notes', '')
    
    if file.filename == '':
        return jsonify({"detail": "Не е избран файл"}), 400
        
    if file and allowed_file(file.filename):
        original_filename = secure_filename(file.filename)
        # Генериране на уникално име за предпазване от презаписване
        unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
        
        upload_folder = current_app.config['UPLOAD_FOLDER']
        file_path = os.path.join(upload_folder, unique_filename)
        
        file.save(file_path)
        
        # Запис в базата данни
        file_url = f"/api/uploads/lab_results/{unique_filename}"
        
        db = next(database.get_db())
        try:
            analysis = patients.create_lab_analysis(
                db=db,
                patient_id=patient_id,
                doctor_id=current_user.id,
                file_url=file_url,
                file_name=original_filename,
                file_type=file.content_type,
                notes=notes
            )
            # Връщаме базови данни (нямаме Pydantic схема за LabAnalysis все още, създаваме речник)
            return jsonify({
                "id": str(analysis.id),
                "file_name": analysis.file_name,
                "file_url": analysis.file_url,
                "file_type": analysis.file_type,
                "notes": analysis.notes,
                "timestamp": analysis.timestamp.isoformat() if analysis.timestamp else None
            }), 201
        finally:
            db.close()
            
    return jsonify({"detail": "Неразрешен тип файл. Позволени: TXT, CSV"}), 400

@patients_bp.route('/<patient_id>/lab-analyses', methods=['GET'])
@token_required
def get_lab_analyses(current_user, patient_id):
    """
    Връща всички лабораторни анализи за даден пациент.
    """
    db = next(database.get_db())
    try:
        results = patients.get_lab_analyses_by_patient(db=db, patient_id=patient_id)
        
        data = []
        for r in results:
            data.append({
                "id": str(r.id),
                "file_name": r.file_name,
                "file_url": r.file_url,
                "file_type": r.file_type,
                "notes": r.notes,
                "timestamp": r.timestamp.isoformat() if r.timestamp else None
            })
        return jsonify(data), 200
    finally:
        db.close()

@patients_bp.route('/<patient_id>/notes', methods=['POST'])
@token_required
@role_required('doctor')
def add_medical_note(current_user, patient_id):
    """
    Ендпойнт за добавяне на медицинска бележка.
    """
    data = request.get_json()
    if not data or not data.get('content'):
        return jsonify({"detail": "Липсва съдържание"}), 400
        
    db = next(database.get_db())
    try:
        note = patients.create_medical_note(
            db=db, 
            patient_id=patient_id, 
            doctor_id=current_user.id, 
            content=data['content']
        )
        return jsonify({
            "id": str(note.id),
            "patient_id": str(note.patient_id),
            "doctor_id": str(note.doctor_id),
            "content": note.content,
            "timestamp": note.timestamp.isoformat() if note.timestamp else None
        }), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()


# ── Notes routes (merged from routes/notes.py) ──────────────────────────────

@patients_bp.route('/notes', methods=['GET'])
@token_required
@role_required('doctor')
def get_doctor_notes(current_user):
    """Връща всички бележки, написани от текущия лекар."""
    db = next(database.get_db())
    try:
        all_notes = patients.get_doctor_notes(db, current_user.id)
        return jsonify([schemas.MedicalNote.model_validate(n).model_dump() for n in all_notes]), 200
    finally:
        db.close()

@patients_bp.route('/notes/latest', methods=['GET'])
@token_required
def get_latest_note(current_user):
    """Връща най-новата бележка за текущо логнатия пациент."""
    from api.database import models as m
    is_patient = not (hasattr(current_user, 'specialization') or hasattr(current_user, 'username'))
    if not is_patient:
        return jsonify({"detail": "Само за пациенти"}), 403
    db = next(database.get_db())
    try:
        latest = db.query(m.MedicalNote)\
            .filter(m.MedicalNote.patient_id == current_user.id)\
            .order_by(m.MedicalNote.timestamp.desc()).first()
        if not latest:
            return jsonify(None), 200
        return jsonify(schemas.MedicalNote.model_validate(latest).model_dump()), 200
    finally:
        db.close()

@patients_bp.route('/notes/record/<record_id>', methods=['PUT'])
@token_required
@role_required('doctor')
def update_record_note(current_user, record_id):
    """Обновява бележката към конкретен ЕЕГ запис."""
    data = request.get_json()
    db = next(database.get_db())
    try:
        updated = patients.update_eeg_record_note(db, record_id, data.get('note', ''))
        if not updated:
            return jsonify({"detail": "Записът не е намерен"}), 404
        return jsonify(schemas.EEGRecord.model_validate(updated).model_dump()), 200
    finally:
        db.close()
