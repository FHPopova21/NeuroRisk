from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import notes
from pydantic import ValidationError

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/', methods=['POST'])
def add_note():
    """
    Ендпойнт за добавяне на медицинска бележка.
    """
    data = request.get_json()
    doctor_id = request.args.get('doctor_id') # Демо: взимаме от URL

    if not doctor_id:
        return jsonify({"detail": "Липсва doctor_id"}), 400

    try:
        note_in = schemas.MedicalNoteCreate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        new_note = notes.create_note(db=db, note_data=note_in, doctor_id=doctor_id)
        return jsonify(schemas.MedicalNote.from_attributes(new_note).dict()), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@notes_bp.route('/<patient_id>', methods=['GET'])
def get_notes(patient_id):
    """
    Връща списък с всички бележки за пациента.
    """
    db = next(database.get_db())
    try:
        all_notes = notes.get_patient_notes(db=db, patient_id=patient_id)
        return jsonify([schemas.MedicalNote.from_attributes(n).dict() for n in all_notes]), 200
    finally:
        db.close()
