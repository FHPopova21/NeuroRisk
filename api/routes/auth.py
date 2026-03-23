from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import auth
from api.utils.auth import generate_token, token_required
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

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Ендпойнт за вход в системата. Връща JWT токен.
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"detail": "Липсват имейл или парола!"}), 400
        
    db = next(database.get_db())
    try:
        user, role = auth.authenticate_user(db, email, password)
        if not user:
            return jsonify({"detail": "Невалидни данни за вход!"}), 401
            
        # 3. Генерираме JWT токен
        token = generate_token(user.id, role)
        
        # 4. Определяме кой модел да се ползва за респонса спрямо ролята
        if role == 'admin':
            user_data = schemas.Admin.from_orm(user).dict()
        elif role == 'doctor':
            user_data = schemas.Doctor.from_orm(user).dict()
        else: # patient
            user_data = schemas.Patient.from_orm(user).dict()
            
        user_data['role'] = role
        
        return jsonify({
            "token": token,
            "user": user_data
        }), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """
    Връща текущо логнатия потребител.
    """
    role = 'doctor' if hasattr(current_user, 'specialization') else 'patient'
    user_data = schemas.Doctor.from_orm(current_user).dict() if role == 'doctor' else schemas.Patient.from_orm(current_user).dict()
    user_data['role'] = role
    return jsonify(user_data), 200
