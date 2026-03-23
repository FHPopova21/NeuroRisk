from sqlalchemy.orm import Session
from api import models, schemas
from datetime import datetime
import numpy as np

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
        hjorth_mobility=record_data.hjorth_mobility,
        hjorth_complexity=record_data.hjorth_complexity,
        rms=record_data.rms,
        zcr=record_data.zcr,
        envelope_max=record_data.envelope_max,
        deriv1_std=record_data.deriv1_std,
        deriv2_std=record_data.deriv2_std,
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

def calculate_signal_features(signal):
    """
    Извлича разширени характеристики от ЕЕГ сигнала:
    - Hjorth (Activity, Mobility, Complexity)
    - RMS (Root Mean Square)
    - ZCR (Zero Crossing Rate)
    - Envelope Max (Peak amplitude)
    - Deriv1_Std, Deriv2_Std (SD of derivatives)
    """
    x = np.array(signal)
    n = len(x)
    
    # 1. Hjorth Parameters
    activity = np.var(x)
    diff1 = np.diff(x)
    var_diff1 = np.var(diff1)
    mobility = np.sqrt(var_diff1 / activity) if activity > 0 else 0
    
    diff2 = np.diff(diff1)
    var_diff2 = np.var(diff2)
    mobility_diff1 = np.sqrt(var_diff2 / var_diff1) if var_diff1 > 0 else 0
    complexity = mobility_diff1 / mobility if mobility > 0 else 0
    
    # 2. RMS
    rms = np.sqrt(np.mean(x**2))
    
    # 3. ZCR
    zcr = np.sum(np.diff(np.sign(x)) != 0) / (2 * n)
    
    # 4. Envelope Max
    envelope_max = np.max(np.abs(x))
    
    # 5. Deriv Stds
    deriv1_std = np.std(diff1)
    deriv2_std = np.std(diff2)
    
    return {
        "hjorth_activity": float(activity),
        "hjorth_mobility": float(mobility),
        "hjorth_complexity": float(complexity),
        "rms": float(rms),
        "zcr": float(zcr),
        "envelope_max": float(envelope_max),
        "deriv1_std": float(deriv1_std),
        "deriv2_std": float(deriv2_std)
    }

def process_eeg_signal(db: Session, signal_data: schemas.EEGSignalIn):
    """
    Основна функция за обработка на суров ЕЕГ сигнал с разширени характеристики.
    """
    features = calculate_signal_features(signal_data.signal)
    
    # Обновена евристика за риск (примерен модел)
    risk_score = 0
    if features["hjorth_activity"] > 500: risk_score += 25
    if features["rms"] > 150: risk_score += 25
    if features["deriv1_std"] > 100: risk_score += 25
    if features["hjorth_complexity"] < 1.0 or features["hjorth_complexity"] > 5.0: risk_score += 25
    
    risk_score = min(100, risk_score)
    
    if risk_score > 70:
        risk_status = "HIGH"
    elif risk_score > 35:
        risk_status = "MEDIUM"
    else:
        risk_status = "LOW"

    # Определяне на интерпретация
    interpretation = "Нормална мозъчна активност."
    if risk_status == "HIGH":
        interpretation = "Засечена е аномална активност с висока енергия и променливост."
    elif risk_status == "MEDIUM":
        interpretation = "Наблюдава се повишена амплитуда и леки отклонения в честотния спектър."

    eeg_create = schemas.EEGRecordCreate(
        patient_id=signal_data.patient_id,
        risk_score=risk_score,
        risk_status=risk_status,
        interpretation=interpretation,
        amplitude=float(np.mean(np.abs(signal_data.signal))),
        frequency=None,
        hjorth_activity=features["hjorth_activity"],
        hjorth_mobility=features["hjorth_mobility"],
        hjorth_complexity=features["hjorth_complexity"],
        rms=features["rms"],
        zcr=features["zcr"],
        envelope_max=features["envelope_max"],
        deriv1_std=features["deriv1_std"],
        deriv2_std=features["deriv2_std"],
        ai_metadata={
            "sampling_rate": signal_data.sampling_rate,
            "signal_length": len(signal_data.signal)
        }
    )
    
    return create_eeg_record(db, eeg_create)

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
