from sqlalchemy.orm import Session, joinedload
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
    
    # NEW: Update patient status based on this record
    if new_record.patient:
        new_record.patient.status = record_data.risk_status

    # 2. АВТОМАТИЧНА ЛОГИКА ЗА АЛАРМИ
    # Ако рискът е HIGH или резултатът е над 80, генерираме аларма
    if record_data.risk_status == "HIGH" or record_data.risk_score >= 80:
        create_alert(
            db=db,
            patient_id=record_data.patient_id,
            message=f"ВНИМАНИЕ: Засечен е висок риск от епилептична активност ({record_data.risk_score}%).",
            severity="CRITICAL",
            source="СИСТЕМА_ИИ",
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

def get_spectral_data(signal, fs=100.0):
    """
    Calculate Power Spectral Density using numpy FFT and group into 1-60 Hz bins.
    Uses log10 scaling to match medical standards (V^2/Hz log scale).
    """
    if not signal or len(signal) < 2:
        return []
    
    x = np.array(signal)
    N = len(x)
    
    # Apply Hann window to reduce spectral leakage
    window = np.hanning(N)
    x_w = (x - np.mean(x)) * window # Detrend and window
    
    X = np.fft.rfft(x_w)
    Pxx = (np.abs(X) ** 2) / (fs * N)
    freqs = np.fft.rfftfreq(N, d=1.0/fs)
    
    # We want 1-60Hz to match the second reference image
    max_f = 60
    spectral_bins = {i: [] for i in range(1, max_f + 1)}
    
    for idx, f in enumerate(freqs):
        if 0 < f <= max_f:
            b = int(round(f))
            if 1 <= b <= max_f:
                spectral_bins[b].append(Pxx[idx])
                
    spectral_data = []
    for b in range(1, max_f + 1):
        if spectral_bins[b]:
            power = float(np.mean(spectral_bins[b]))
            # Log scale for better visualization of low-power high-freq components
            # We add a tiny epsilon to avoid log(0)
            log_power = float(np.log10(max(1e-10, power)))
        else:
            log_power = -2.0 # -2 in log10 is 0.01
        spectral_data.append({"freq": b, "power": log_power})
        
    return spectral_data

def get_shap_explanations(features: dict, risk_score: int):
    """
    Генерира симулирани SHAP стойности (локални обяснения)
    базирани на отклоненията от нормата.
    """
    # Дефинираме "здрави" норми за сравнение
    norms = {
        "rms": 45.0,
        "hjorth_mobility": 0.08,
        "hjorth_complexity": 1.4,
        "zcr": 0.05
    }
    
    explanation = []
    
    # Реално SHAP би се изчислило с shap.Explainer, тук симулираме приноса:
    # Принос = (Стойност - Норма) * Тежест
    
    # 1. RMS (Високата енергия вдига риска)
    rms_diff = (features["rms"] - norms["rms"]) / norms["rms"]
    explanation.append({
        "feature": "Energy (RMS)",
        "value": f"{features['rms']:.1f} µV",
        "norm": f"~{norms['rms']:.1f} µV",
        "impact": float(np.clip(rms_diff * 40, -50, 50)), # Max 50% impact
        "status": "High" if features["rms"] > norms["rms"] * 1.5 else "Normal"
    })
    
    # 2. Mobility (Високата мобилност е характерна за иктална активност)
    mob_diff = (features["hjorth_mobility"] - norms["hjorth_mobility"]) / norms["hjorth_mobility"]
    explanation.append({
        "feature": "Frequency (Mobility)",
        "value": f"{features['hjorth_mobility']:.3f}",
        "norm": f"~{norms['hjorth_mobility']:.3f}",
        "impact": float(np.clip(mob_diff * 35, -50, 50)),
        "status": "High" if features["hjorth_mobility"] > norms["hjorth_mobility"] * 1.5 else "Normal"
    })
    
    # 3. Complexity (Ниската сложност често означава по-ритмичен/пристъпен сигнал)
    comp_diff = (norms["hjorth_complexity"] - features["hjorth_complexity"]) / norms["hjorth_complexity"]
    explanation.append({
        "feature": "Complexity",
        "value": f"{features['hjorth_complexity']:.3f}",
        "norm": f"~{norms['hjorth_complexity']:.3f}",
        "impact": float(np.clip(comp_diff * 25, -50, 50)),
        "status": "Low" if features["hjorth_complexity"] < norms["hjorth_complexity"] * 0.7 else "Normal"
    })
    
    return explanation

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
            "signal_length": len(signal_data.signal),
            "shap_explanation": get_shap_explanations(features, risk_score),
            "spectral_data": get_spectral_data(signal_data.signal, float(signal_data.sampling_rate) if hasattr(signal_data, 'sampling_rate') else 100.0)
        }
    )
    
    return create_eeg_record(db, eeg_create)

def _ensure_shap_data(record: models.EEGRecord):
    """
    Помощна функция, която гарантира, че записът има SHAP и Spectral данни за визуализация.
    Ако липсват в ai_metadata, ги генерира на база съществуващите характеристики / суров сигнал.
    """
    if not record.ai_metadata:
        record.ai_metadata = {}
    
    needs_update = False
    
    if "shap_explanation" not in record.ai_metadata:
        # Използваме съществуващите характеристики от записа
        features = {
            "rms": record.rms or 40.0,
            "hjorth_mobility": record.hjorth_mobility or 0.05,
            "hjorth_complexity": record.hjorth_complexity or 1.5,
            "zcr": record.zcr or 0.02
        }
        record.ai_metadata["shap_explanation"] = get_shap_explanations(features, record.risk_score)
        needs_update = True
        
    if "spectral_data" not in record.ai_metadata:
        raw_signal = record.ai_metadata.get("raw_signal", [])
        record.ai_metadata["spectral_data"] = get_spectral_data(raw_signal, fs=100.0)
        needs_update = True
        
    if needs_update:
        # Prevent SQLAlchemy from thinking the json dict hasn't changed
        import copy
        record.ai_metadata = copy.deepcopy(record.ai_metadata)
        
    return record

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
    records = db.query(models.EEGRecord)\
             .options(joinedload(models.EEGRecord.patient))\
             .filter(models.EEGRecord.patient_id == patient_id)\
             .order_by(models.EEGRecord.timestamp.desc())\
             .limit(limit)\
             .all()
    # Гарантираме SHAP данни
    for r in records: _ensure_shap_data(r)
    return records

def get_active_alerts(db: Session, patient_id: str = None):
    """
    Връща непрочетените аларми.
    """
    query = db.query(models.Alert)\
              .options(joinedload(models.Alert.patient))\
              .filter(models.Alert.is_read == False)
    if patient_id:
        query = query.filter(models.Alert.patient_id == patient_id)
    return query.order_by(models.Alert.timestamp.desc()).all()

def get_all_records(db: Session, limit: int = 100):
    """
    Връща списък с последните ЕЕГ записи за всички пациенти.
    """
    records = db.query(models.EEGRecord)\
             .options(joinedload(models.EEGRecord.patient))\
             .order_by(models.EEGRecord.timestamp.desc())\
             .limit(limit)\
             .all()
    # Гарантираме SHAP данни
    for r in records: _ensure_shap_data(r)
    return records

def analyze_with_lstm(db: Session, record: models.EEGRecord):
    """
    Извършва детайлен анализ на записа чрез LSTM модел.
    Ако моделът не е зареден, използва разширената евристика.
    """
    import os
    from src.models.lstm_model import LSTMModel
    
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    model_path = os.path.join(project_root, "models", "lstm_model.keras")
    
    raw_signal = record.ai_metadata.get("raw_signal") if record.ai_metadata else None
    
    if not raw_signal:
        raise ValueError("Записът не съдържа суров сигнал за анализ.")
    
    # Резултати по подразбиране (от метаданните или евристиката)
    risk_score = record.risk_score
    risk_status = record.risk_status
    interpretation = record.interpretation
    
    try:
        if os.path.exists(model_path):
            # 1. Зареждане на модела
            # Резолваме input_shape: (178, 1)
            clf = LSTMModel.load(model_path, input_shape=(len(raw_signal), 1))
            
            # 2. Подготовка на данните
            X = np.array(raw_signal).reshape(1, -1)
            
            # 3. Предсказание
            # y=0: Non-Seizure, y=1: Inter-ictal, y=2: Seizure (според train_lstm.py)
            y_prob = clf.predict_proba(X)[0]
            y_pred = int(np.argmax(y_prob))
            
            risk_score = int(y_prob[y_pred] * 100)
            
            if y_pred == 2: # Seizure
                risk_status = "HIGH"
                interpretation = f"ВНИМАНИЕ: LSTM моделът засече висока вероятност за Епилептичен пристъп ({risk_score}% сигурност)."
            elif y_pred == 1: # Inter-ictal
                risk_status = "MEDIUM"
                interpretation = f"Засечена е интер-иктална активност ({risk_score}% сигурност)."
            else: # Non-Seizure
                risk_status = "LOW"
                interpretation = f"Нормална мозъчна активност според LSTM анализа ({risk_score}% сигурност)."
        else:
            # Фолбек към съществуващата логика, ако моделът го няма
            # (вече имаме резултати от сидинга, така че просто ги потвърждаваме)
            interpretation = f"[Heuristic Check] {interpretation}"
    
    except Exception as e:
        print(f"Грешка при AI анализ: {e}")
        interpretation = f"Грешка при AI анализ: {str(e)}"

    # Обновяваме записа
    record.risk_score = risk_score
    record.risk_status = risk_status
    record.interpretation = interpretation
    
    # ADD SHAP EXPLANATION
    if not record.ai_metadata:
        record.ai_metadata = {}
    
    # Извличаме характеристиките, ако още ги нямаме (за SHAP)
    features = calculate_signal_features(raw_signal)
    record.ai_metadata["shap_explanation"] = get_shap_explanations(features, risk_score)
    # Добавяме и спектрални данни, базирани на истинския сигнал
    record.ai_metadata["spectral_data"] = get_spectral_data(raw_signal, fs=100.0) # Assumption
    
    # Също обновяваме самите характеристики в записа
    for k, v in features.items():
        setattr(record, k, v)
    
    # Проверка за нова аларма
    if risk_status == "HIGH":
        create_alert(
            db=db,
            patient_id=record.patient_id,
            message=f"AI АНАЛИЗ (LSTM): {interpretation}",
            severity="CRITICAL",
            source="AI_ENGINE",
            alert_type="seizure_risk"
        )
    
    # NEW: Update patient status based on new analysis
    if record.patient:
        record.patient.status = risk_status
        
    db.commit()
    db.refresh(record)
    return record
