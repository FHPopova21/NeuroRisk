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
