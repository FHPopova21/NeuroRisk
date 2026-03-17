from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import auth
from pydantic import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register/doctor', methods=['POST'])
def register_doctor():
    """
    Ендпойнт за регистрация на нов лекар (Flask версия).
    """
    data = request.get_json()
    
    # Ръчна валидация с Pydantic схемата ни
    try:
        doctor_create = schemas.DoctorCreate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    # Вземаме сесия към базата
    db = next(database.get_db())
    
    try:
        new_doctor = auth.create_doctor(db=db, doctor_data=doctor_create)
        # Превръщаме обекта в речник за JSON отговор
        return jsonify(schemas.Doctor.from_orm(new_doctor).dict()), 201
    except Exception as e:
        # Тук хващаме грешките от сервиза (като съществуващ имейл)
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()
