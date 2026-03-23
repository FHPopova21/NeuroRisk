import jwt
import datetime
import os
from functools import wraps
from flask import request, jsonify, current_app
from api import models, database

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-prod")

def generate_token(user_id, role):
    """
    Генерира JWT токен, който важи 24 часа.
    """
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': str(user_id),
        'role': role
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'detail': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            db = next(database.get_db())
            
            # В зависимост от ролята търсим в различна таблица
            if data['role'] == 'admin':
                current_user = db.query(models.Admin).filter(models.Admin.id == data['sub']).first()
            elif data['role'] == 'doctor':
                current_user = db.query(models.Doctor).filter(models.Doctor.id == data['sub']).first()
            else:
                current_user = db.query(models.Patient).filter(models.Patient.id == data['sub']).first()
                
            db.close()
            if not current_user:
                return jsonify({'detail': 'User not found!'}), 401
                
        except Exception as e:
            return jsonify({'detail': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)

    return decorated

def role_required(required_role):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            # Проверяваме ролята. Лекарят има атрибут 'specialization', Пациентът има 'patient_id'
            # Можем да добавим изрично поле role в моделите или да проверяваме тип
            if hasattr(current_user, 'username'):
                actual_role = 'admin'
            elif hasattr(current_user, 'specialization'):
                actual_role = 'doctor'
            else:
                actual_role = 'patient'
            
            if actual_role != required_role:
                return jsonify({'detail': 'Access denied: insufficient permissions!'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
