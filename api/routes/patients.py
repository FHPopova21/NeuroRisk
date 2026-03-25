from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import patients
from api.utils.auth import token_required, role_required
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

@patients_bp.route('/activate/<token>', methods=['POST'])
def activate_account(token):
    """
    Ендпойнт за активация на пациентски акаунт.
    """
    data = request.get_json()
    try:
        activation_data = schemas.PatientActivate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        patient = patients.activate_patient(db=db, token=token, activation_data=activation_data)
        return jsonify(schemas.Patient.model_validate(patient).model_dump()), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
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
