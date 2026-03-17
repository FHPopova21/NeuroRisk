from sqlalchemy.orm import Session
from api import models, schemas
from datetime import datetime

def create_eeg_record(db: Session, record_data: schemas.EEGRecordCreate):
    """
    Записва нов ЕЕГ анализ и автоматично проверява за висок риск.
    """
    # 1. Създаване на ЕЕГ записа
    new_record = models.EEGRecord(
        patient_id=record_data.patient_id,
        risk_score=record_data.risk_score,
        risk_status=record_data.risk_status,
        interpretation=record_data.interpretation,
        amplitude=record_data.amplitude,
        frequency=record_data.frequency,
        hjorth_activity=record_data.hjorth_activity,
        complexity=record_data.complexity,
        ai_metadata=record_data.ai_metadata
    )

    db.add(new_record)
    
    # 2. АВТОМАТИЧНА ЛОГИКА ЗА АЛАРМИ
    # Ако рискът е HIGH или резултатът е над 80, генерираме аларма
    if record_data.risk_status == "HIGH" or record_data.risk_score >= 80:
        create_alert(
            db=db,
            patient_id=record_data.patient_id,
            message=f"ВНИМАНИЕ: Засечен е висок риск от епилептична активност ({record_data.risk_score}%).",
            severity="CRITICAL",
            source="AI_ENGINE",
            alert_type="seizure_risk"
        )

    db.commit()
    db.refresh(new_record)
    return new_record

def create_alert(db: Session, patient_id: str, message: str, severity: str, source: str, alert_type: str):
    """
    Помощна функция за генериране на системна аларма.
    """
    new_alert = models.Alert(
        patient_id=patient_id,
        message=message,
        severity=severity,
        source=source,
        type=alert_type,
        is_read=False
    )
    db.add(new_alert)
    return new_alert

def get_patient_history(db: Session, patient_id: str, limit: int = 50):
    """
    Връща историята на ЕЕГ записите за конкретен пациент.
    """
    return db.query(models.EEGRecord)\
             .filter(models.EEGRecord.patient_id == patient_id)\
             .order_by(models.EEGRecord.timestamp.desc())\
             .limit(limit)\
             .all()

def get_active_alerts(db: Session, patient_id: str = None):
    """
    Връща непрочетените аларми.
    """
    query = db.query(models.Alert).filter(models.Alert.is_read == False)
    if patient_id:
        query = query.filter(models.Alert.patient_id == patient_id)
    return query.order_by(models.Alert.timestamp.desc()).all()
