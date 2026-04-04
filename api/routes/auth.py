from flask import Blueprint, request, jsonify
from api.database import schemas, database, models
from api.services import auth
from api.utils.jwt_helpers import generate_token, token_required
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

@auth_bp.route('/activate', methods=['POST'])
def activate_patient():
    """
    Активира пациентски профил чрез токен и задава парола.
    """
    data = request.get_json()
    token = data.get('token')
    password = data.get('password')
    
    if not token or not password:
        return jsonify({"detail": "Липсват токен или парола!"}), 400
        
    print(f"--- ACTIVATE DEBUG ---")
    print(f"Token: {token}")
    print(f"Password provided: {'Yes' if password else 'No'}")
        
    db = next(database.get_db())
    try:
        # Търсим пациент, на който token съвпада с activation_token ИЛИ с patient_id (за улеснение)
        patient = db.query(models.Patient).filter(
            (models.Patient.activation_token == token) | (models.Patient.patient_id == token)
        ).first()
        
        if not patient:
            return jsonify({"detail": "Невалиден или вече активиран акаунт!"}), 400
            
        if patient.is_active and patient.password_hash:
             return jsonify({"detail": "Този профил вече е активиран!"}), 400

        # Хешираме паролата и активираме
        patient.password_hash = auth.hash_password(password)
        patient.is_active = True
        patient.status = "ACTIVE"
        patient.activation_token = None # Изчистваме токена
        
        db.commit()
        return jsonify({"detail": "Профилът е активиран успешно!"}), 200
    except Exception as e:
        db.rollback()
        print(f"ACTIVATE ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
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
        # ПРОВЕРКА: Ако пациентът не е активен, връщаме само основното му инфо без да гърмим
        user_data = schemas.Patient.model_validate(current_user).model_dump()
        user_data['is_active'] = getattr(current_user, 'is_active', True)
        
        db = next(database.get_db())
        latest_record = db.query(models.EEGRecord).filter(models.EEGRecord.patient_id == current_user.id).order_by(models.EEGRecord.timestamp.desc()).first()
        total_records = db.query(models.EEGRecord).filter(models.EEGRecord.patient_id == current_user.id).count()
        
        user_data['status'] = current_user.status or "LOW"
        user_data['risk_score'] = latest_record.risk_score if latest_record else 0
        user_data['total_records'] = total_records
        
        print(f"DEBUG: Patient {current_user.id} ({current_user.name})")
        print(f"DEBUG: Latest record: {latest_record.id if latest_record else 'None'}")
        print(f"DEBUG: Risk Score: {user_data['risk_score']}")
        
        # Добавяме информация за лекаря
        if current_user.doctor:
            user_data['doctor_name'] = current_user.doctor.name
            user_data['doctor_specialization'] = current_user.doctor.specialization
        
        db.close()
        
    user_data['role'] = role
    
    # Добавяме и флага is_active за мобилното приложение
    user_data['is_active'] = getattr(current_user, 'is_active', True)
    
    return jsonify(user_data), 200

@auth_bp.route('/set-password', methods=['POST'])
@token_required
def set_password(current_user):
    """
    Позволява на логнат потребител (пациент) да си заложи парола след първо влизане.
    """
    data = request.get_json()
    new_password = data.get('password')
    
    if not new_password:
        return jsonify({"detail": "Липсва нова парола!"}), 400
        
    db = next(database.get_db())
    try:
        current_user.password_hash = auth.hash_password(new_password)
        current_user.is_active = True # Вече е активен
        db.commit()
        return jsonify({"detail": "Паролата е променена успешно!"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()
