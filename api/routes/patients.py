from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import patients
from pydantic import ValidationError

patients_bp = Blueprint('patients', __name__)

@patients_bp.route('/', methods=['POST'])
def register_new_patient():
    """
    Ендпойнт за създаване на нов пациент от лекар.
    """
    data = request.get_json()
    doctor_id = request.args.get('doctor_id') # Вземаме от URL параметри за демото

    if not doctor_id:
        return jsonify({"detail": "Липсва doctor_id"}), 400

    try:
        patient_create = schemas.PatientCreate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        new_patient, token = patients.create_patient(db=db, patient_data=patient_create, doctor_id=doctor_id)
        
        response_data = schemas.Patient.from_orm(new_patient).dict()
        response_data["activation_token"] = token
        return jsonify(response_data), 201
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
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
        return jsonify(schemas.Patient.from_orm(patient).dict()), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@patients_bp.route('/<patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    """
    Връща детайли за конкретен пациент.
    """
    db = next(database.get_db())
    try:
        patient = patients.get_patient_by_id(db=db, patient_id=patient_id)
        if not patient:
            return jsonify({"detail": "Пациентът не е намерен"}), 404
        return jsonify(schemas.Patient.from_orm(patient).dict()), 200
    finally:
        db.close()

@patients_bp.route('/doctor/<doctor_id>', methods=['GET'])
def get_doctor_patients(doctor_id):
    """
    Връща списък с пациенти за конкретен лекар.
    """
    db = next(database.get_db())
    try:
        results = patients.get_patients_by_doctor(db=db, doctor_id=doctor_id)
        return jsonify([schemas.Patient.from_orm(p).dict() for p in results]), 200
    finally:
        db.close()
