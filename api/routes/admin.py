from flask import Blueprint, request, jsonify
from api import schemas, models, database
from api.utils.auth import token_required, role_required
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import uuid

admin_bp = Blueprint('admin', __name__)

def log_activity(db: Session, user_id, user_role, action, details=None):
    new_log = models.ActivityLog(
        user_id=user_id,
        user_role=user_role,
        action=action,
        details=details
    )
    db.add(new_log)
    db.commit()

@admin_bp.route('/stats', methods=['GET'])
@token_required
@role_required('admin')
def get_stats(current_user):
    db = next(database.get_db())
    try:
        total_doctors = db.query(models.Doctor).count()
        total_patients = db.query(models.Patient).count()
        high_risk_alerts = db.query(models.Alert).filter(models.Alert.severity == 'HIGH').count()
        
        # Мок данни за графиката (в реалност биха били агрегирани по дата)
        analyses_over_time = [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "count": 10 + i*2}
            for i in range(7, 0, -1)
        ]
        
        recent_logs = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(10).all()
        
        stats = {
            "total_doctors": total_doctors,
            "total_patients": total_patients,
            "active_sessions": 5, # Мок
            "high_risk_alerts": high_risk_alerts,
            "analyses_over_time": analyses_over_time,
            "recent_activity": [schemas.ActivityLog.model_validate(log).model_dump() for log in recent_logs]
        }
        return jsonify(stats), 200
    finally:
        db.close()

@admin_bp.route('/doctors', methods=['GET'])
@token_required
@role_required('admin')
def get_doctors(current_user):
    db = next(database.get_db())
    try:
        status = request.args.get('status')
        query = db.query(models.Doctor)
        if status:
            query = query.filter(models.Doctor.status == status)
        
        doctors = query.all()
        return jsonify([schemas.Doctor.model_validate(d).model_dump() for d in doctors]), 200
    finally:
        db.close()

@admin_bp.route('/doctors/<doctor_id>', methods=['PATCH'])
@token_required
@role_required('admin')
def update_doctor_status(current_user, doctor_id):
    db = next(database.get_db())
    try:
        data = request.get_json()
        doctor = db.query(models.Doctor).filter(models.Doctor.id == uuid.UUID(doctor_id)).first()
        if not doctor:
            return jsonify({"detail": "Doctor not found"}), 404
        
        if 'status' in data:
            doctor.status = data['status']
            if data['status'] == 'ACTIVE':
                doctor.is_verified = True
            
            log_activity(db, current_user.id, 'admin', f"Changed doctor {doctor.email} status to {doctor.status}", f"Target ID: {doctor_id}")
            
        db.commit()
        return jsonify(schemas.Doctor.model_validate(doctor).model_dump()), 200
    finally:
        db.close()

@admin_bp.route('/alerts', methods=['GET'])
@token_required
@role_required('admin')
def get_all_alerts(current_user):
    db = next(database.get_db())
    try:
        severity = request.args.get('severity')
        query = db.query(models.Alert)
        if severity:
            query = query.filter(models.Alert.severity == severity)
        
        alerts = query.order_by(models.Alert.timestamp.desc()).all()
        return jsonify([schemas.Alert.model_validate(a).model_dump() for a in alerts]), 200
    finally:
        db.close()

@admin_bp.route('/patients', methods=['GET'])
@token_required
@role_required('admin')
def get_all_patients(current_user):
    db = next(database.get_db())
    try:
        query = db.query(models.Patient)
        patients = query.all()
        return jsonify([schemas.Patient.model_validate(p).model_dump() for p in patients]), 200
    finally:
        db.close()

@admin_bp.route('/logs', methods=['GET'])
@token_required
@role_required('admin')
def get_logs(current_user):
    db = next(database.get_db())
    try:
        logs = db.query(models.ActivityLog).order_by(models.ActivityLog.timestamp.desc()).limit(100).all()
        return jsonify([schemas.ActivityLog.model_validate(l).model_dump() for l in logs]), 200
    finally:
        db.close()
