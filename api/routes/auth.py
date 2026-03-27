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
        return jsonify(schemas.Doctor.model_validate(new_doctor).model_dump()), 201
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
            user_data = schemas.Admin.model_validate(user).model_dump()
        elif role == 'doctor':
            user_data = schemas.Doctor.model_validate(user).model_dump()
        else: # patient
            user_data = schemas.Patient.model_validate(user).model_dump()
            
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
    if hasattr(current_user, 'username'):
        role = 'admin'
        user_data = schemas.Admin.model_validate(current_user).model_dump()
    elif hasattr(current_user, 'specialization'):
        role = 'doctor'
        user_data = schemas.Doctor.model_validate(current_user).model_dump()
    else:
        role = 'patient'
        user_data = schemas.Patient.model_validate(current_user).model_dump()
        # Добавяме клиничен статус и последен риск за пациента
        db = next(database.get_db())
        latest_record = db.query(models.EEGRecord).filter(models.EEGRecord.patient_id == current_user.id).order_by(models.EEGRecord.timestamp.desc()).first()
        total_records = db.query(models.EEGRecord).filter(models.EEGRecord.patient_id == current_user.id).count()
        
        user_data['status'] = current_user.status or "LOW"
        user_data['risk_score'] = latest_record.risk_score if latest_record else 0
        user_data['total_records'] = total_records
        
        # Добавяме информация за лекаря
        if current_user.doctor:
            user_data['doctor_name'] = current_user.doctor.name
            user_data['doctor_specialization'] = current_user.doctor.specialization
        
        db.close()
        
    user_data['role'] = role
    return jsonify(user_data), 200
