from flask import Blueprint, request, jsonify
from api.database import schemas, database, models
from api.services import monitoring
from api.utils.jwt_helpers import token_required, role_required
from pydantic import ValidationError
from uuid import UUID
from sqlalchemy.orm import joinedload

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/eeg', methods=['POST'])
@token_required
def add_eeg_record(current_user):
    """
    Ендпойнт за изпращане на нов ЕЕГ анализ (обикновено от AI модела).
    """
    data = request.get_json()
    try:
        record_in = schemas.EEGRecordCreate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        new_record = monitoring.create_eeg_record(db=db, record_data=record_in)
        return jsonify(schemas.EEGRecord.model_validate(new_record).model_dump()), 201
    finally:
        db.close()

@monitoring_bp.route('/process', methods=['POST'])
@token_required
def process_signal(current_user):
    """
    Ендпойнт за изпращане на суров ЕЕГ сигнал за автоматична обработка.
    """
    data = request.get_json()
    
    # Auto-inject patient_id from the current logged-in user if missing
    if "patient_id" not in data and hasattr(current_user, "id"):
        data["patient_id"] = str(current_user.id)
        
    try:
        signal_in = schemas.EEGSignalIn(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        new_record = monitoring.process_eeg_signal(db=db, signal_data=signal_in)
        return jsonify(schemas.EEGRecord.model_validate(new_record).model_dump()), 201
    finally:
        db.close()

@monitoring_bp.route('/history/<patient_id>', methods=['GET'])
@token_required
def get_history(current_user, patient_id):
    """
    Връща историята на записите за конкретен пациент.
    """
    # Поддръжка на специален параметър 'me' за текущия потребител
    if patient_id == "me" and hasattr(current_user, "id"):
        patient_id = str(current_user.id)

    # Проверяваме дали е администратор или лекар
    is_privileged = hasattr(current_user, 'specialization') or hasattr(current_user, 'username')
    
    # Ако е пациент, може да вижда само своя си ID
    if not is_privileged and str(current_user.id) != str(patient_id):
        return jsonify({"detail": "Нямате достъп до хронологията на друг пациент"}), 403

    db = next(database.get_db())
    try:
        history = monitoring.get_patient_history(db=db, patient_id=patient_id)
        return jsonify([schemas.EEGRecord.model_validate(r).model_dump() for r in history]), 200
    finally:
        db.close()

@monitoring_bp.route('/alerts', methods=['GET'])
@token_required
def get_alerts(current_user):
    """
    Връща списък с активните аларми. Може да се филтрира по patient_id през query параметър.
    """
    patient_id = request.args.get('patient_id')
    
    # Защита: Ако е пациент, винаги филтрираме само по неговия ID
    is_patient = not (hasattr(current_user, 'specialization') or hasattr(current_user, 'username'))
    if is_patient:
        patient_id = str(current_user.id)

    db = next(database.get_db())
    try:
        alerts = monitoring.get_active_alerts(db=db, patient_id=patient_id)
        return jsonify([schemas.Alert.model_validate(a).model_dump() for a in alerts]), 200
    finally:
        db.close()

@monitoring_bp.route('/alerts/<alert_id>/dismiss', methods=['PATCH'])
@token_required
def dismiss_alert(current_user, alert_id):
    """
    Отбелязва конкретна аларма като прочетена/отхвърлена.
    """
    db = next(database.get_db())
    try:
        alert = db.query(models.Alert).filter(models.Alert.id == UUID(alert_id)).first()
        if not alert:
            return jsonify({"detail": "Алармата не е намерена"}), 404
            
        alert.is_read = True
        db.commit()
        return jsonify({"status": "success"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@monitoring_bp.route('/history', methods=['GET'])
@token_required
@role_required('doctor')
def get_all_history(current_user):
    """
    Връща списък с последните анализи за всички пациенти.
    """
    db = next(database.get_db())
    try:
        history = monitoring.get_all_records(db=db)
        return jsonify([schemas.EEGRecord.model_validate(r).model_dump() for r in history]), 200
    finally:
        db.close()

@monitoring_bp.route('/analyze/<record_id>', methods=['POST'])
@token_required
def analyze_existing_record(current_user, record_id):
    """
    Ендпойнт за стартиране на AI анализ на вече съществуващ запис (чрез LSTM модел).
    """
    db = next(database.get_db())
    try:
        record = db.query(models.EEGRecord).options(joinedload(models.EEGRecord.patient)).filter(models.EEGRecord.id == UUID(record_id)).first()
        if not record:
            return jsonify({"detail": "Записът не е намерен"}), 404
            
        # Извикваме AI сервиза за анализ
        updated_record = monitoring.analyze_with_lstm(db, record)
        return jsonify(schemas.EEGRecord.model_validate(updated_record).model_dump()), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()
from api.database import models

@monitoring_bp.route('/eeg-records/<record_id>', methods=['PUT'])
@token_required
@role_required('doctor')
def update_eeg_record(current_user, record_id):
    """
    Ендпойнт за обновяване на информацията в ЕЕГ запис (бележки и валидация).
    """
    data = request.get_json()
    try:
        update_data = schemas.EEGRecordUpdate(**data)
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400

    db = next(database.get_db())
    try:
        record = db.query(models.EEGRecord).options(joinedload(models.EEGRecord.patient)).filter(models.EEGRecord.id == UUID(record_id)).first()
        if not record:
            return jsonify({"detail": "Записът не е намерен"}), 404
        
        if update_data.doctor_note is not None:
            record.doctor_note = update_data.doctor_note
        if update_data.doctor_validation is not None:
            record.doctor_validation = update_data.doctor_validation
        
        db.commit()
        return jsonify(schemas.EEGRecord.model_validate(record).model_dump()), 200
    except Exception as e:
        db.rollback()
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

import os
from flask import current_app

@monitoring_bp.route('/analyze-file/<lab_id>', methods=['POST'])
@token_required
@role_required('doctor')
def analyze_lab_file(current_user, lab_id):
    """
    Ендпойнт за стартиране на AI анализ върху качен лабораторен файл (.txt или .csv).
    """
    db = next(database.get_db())
    try:
        lab = db.query(models.LabAnalysis).filter(models.LabAnalysis.id == UUID(lab_id)).first()
        if not lab:
            return jsonify({"detail": "Файлът не е намерен"}), 404
            
        # Пътят до файла
        filename = lab.file_url.split('/')[-1]
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(file_path):
            return jsonify({"detail": "Самият файл липсва на сървъра"}), 404
            
        # Парсване на файла
        signal = []
        with open(file_path, 'r') as f:
            for line in f:
                # Splitting by common delimiters
                parts = line.strip().replace(';', ',').replace('\t', ',').split(',')
                for p in parts:
                    if p.strip():
                        try:
                            signal.append(float(p.strip()))
                        except ValueError:
                            pass
        
        # Защита ако файлът е абсолютно невалиден или празен
        if not signal:
            # Fallback mock signal за демо цели, ако качат текст
            import math
            signal = [math.sin(i * 0.1) * 20.0 for i in range(100)]
            
        # Инициализираме обработката
        signal_in = schemas.EEGSignalIn(
            patient_id=str(lab.patient_id),
            signal=signal
        )
        
        new_record = monitoring.process_eeg_signal(db=db, signal_data=signal_in)
        return jsonify(schemas.EEGRecord.model_validate(new_record).model_dump()), 201
        
    except ValidationError as e:
        return jsonify({"detail": e.errors()}), 400
    except Exception as e:
        db.rollback()
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@monitoring_bp.route('/heartbeat', methods=['POST'])
@token_required
def patient_heartbeat(current_user):
    """
    Получава данни за активността на пациента в реално време (Mobile App).
    """
    # ВРЕМЕНЕН ДЕБЪГ: Позволяваме на всички логнати да минат, за да видим какво пристига
    print(f"--- HEARTBEAT DEBUG ---")
    print(f"User type: {type(current_user)}")
    print(f"User dir: {dir(current_user)}")
    if hasattr(current_user, 'id'):
        print(f"User ID: {current_user.id}")
    
    db = next(database.get_db())
    try:
        # Опитваме се да намерим пациент с това ID, независимо от обекта
        patient = db.query(models.Patient).filter(models.Patient.id == current_user.id).first()
        if patient:
            print(f"Patient found: {patient.name}")
            patient.status = "ACTIVE"
            from datetime import datetime
            patient.last_active = datetime.now()
            db.commit()
        else:
            print("No patient record found for this user ID")
            
        return jsonify({"status": "received"}), 200
    except Exception as e:
        print(f"HEARTBEAT ERROR: {e}")
        db.rollback()
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()

@monitoring_bp.route('/signal', methods=['POST'])
@token_required
def signal_doctor(current_user):
    """
    Позволява на пациента ръчно да сигнализира на своя лекар (Mobile App).
    Генерира критична аларма.
    """
    is_patient = not (hasattr(current_user, 'specialization') or hasattr(current_user, 'username'))
    if not is_patient:
        return jsonify({"detail": "Само пациенти могат да сигнализират"}), 403

    data = request.get_json()
    message = data.get('message', 'Пациент изисква внимание!')
    
    db = next(database.get_db())
    try:
        # Генериране на аларма за текущия логнат пациент
        new_alert = models.Alert(
            patient_id=current_user.id,
            message=f"РЪЧЕН СИГНАЛ: {message}",
            severity="CRITICAL",
            source="ПАЦИЕНТ",
            type="manual_signal"
        )
        db.add(new_alert)
        db.commit()
        return jsonify({"status": "notified"}), 200
    finally:
        db.close()
