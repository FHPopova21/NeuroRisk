from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import notes
from api.utils.auth import token_required, role_required
from pydantic import ValidationError
from uuid import UUID

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/', methods=['POST'])
@token_required
@role_required('doctor')
def create_note(current_user):
    """
    Създава нова медицинска бележка от лекаря.
    """
    data = request.get_json()
    try:
        note_in = schemas.MedicalNoteCreate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        new_note = notes.create_medical_note(db, note_in, current_user.id)
        return jsonify(schemas.MedicalNote.model_validate(new_note).model_dump()), 201
    finally:
        db.close()

@notes_bp.route('/', methods=['GET'])
@token_required
@role_required('doctor')
def get_notes(current_user):
    """
    Връща списък с бележките, написани от текущия лекар.
    """
    db = next(database.get_db())
    try:
        all_notes = notes.get_doctor_notes(db, current_user.id)
        return jsonify([schemas.MedicalNote.model_validate(n).model_dump() for n in all_notes]), 200
    finally:
        db.close()

@notes_bp.route('/latest', methods=['GET'])
@token_required
def get_latest_note(current_user):
    """
    Връща най-новата медицинска бележка за текущия логнат пациент.
    """
    # Защита: Само пациенти могат да ползват този ендпойнт за себе си
    is_patient = not (hasattr(current_user, 'specialization') or hasattr(current_user, 'username'))
    if not is_patient:
        return jsonify({"detail": "Този ендпойнт е само за пациенти"}), 403

    db = next(database.get_db())
    try:
        from api import models
        latest_note = db.query(models.MedicalNote)\
            .filter(models.MedicalNote.patient_id == current_user.id)\
            .order_by(models.MedicalNote.timestamp.desc())\
            .first()
        
        if not latest_note:
            return jsonify(None), 200
            
        return jsonify(schemas.MedicalNote.model_validate(latest_note).model_dump()), 200
    finally:
        db.close()

@notes_bp.route('/patient/<patient_id>', methods=['GET'])
@token_required
def get_patient_notes(current_user, patient_id):
    """
    Връща бележките за конкретен пациент.
    """
    db = next(database.get_db())
    try:
        all_notes = notes.get_patient_notes(db, patient_id)
        return jsonify([schemas.MedicalNote.model_validate(n).model_dump() for n in all_notes]), 200
    finally:
        db.close()

@notes_bp.route('/record/<record_id>', methods=['PUT'])
@token_required
@role_required('doctor')
def update_record_note(current_user, record_id):
    """
    Обновява бележката към конкретен ЕЕГ запис.
    """
    data = request.get_json()
    note_content = data.get('note', '')
    
    db = next(database.get_db())
    try:
        updated_record = notes.update_eeg_record_note(db, record_id, note_content)
        if not updated_record:
            return jsonify({"detail": "Записът не е намерен"}), 404
        return jsonify(schemas.EEGRecord.model_validate(updated_record).model_dump()), 200
    finally:
        db.close()
