from flask import Blueprint, request, jsonify
from api import schemas, database, models
from api.services import monitoring
from api.utils.auth import token_required, role_required
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
from api import models

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
    # Проверяваме дали е пациент (по липса на атрибут username/specialization или по роля)
    if hasattr(current_user, 'specialization') or hasattr(current_user, 'username'):
        return jsonify({"detail": "Само пациенти могат да изпращат heartbeat"}), 403
        
    db = next(database.get_db())
    try:
        from uuid import UUID
        # Тъй като current_user е самият обект от базата в Flask версията ни
        patient = db.query(models.Patient).filter(models.Patient.id == current_user.id).first()
        if patient:
            patient.status = "ACTIVE"
            patient.last_active = datetime.now() # Обновяваме времето на последна активност
            db.commit()
        return jsonify({"status": "received"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()
        db.close()

@monitoring_bp.route('/signal', methods=['POST'])
@token_required
def signal_doctor(current_user):
    """
    Позволява на пациента ръчно да сигнализира на своя лекар (Mobile App).
    Генерира критична аларма.
    """
    if current_user.get('role') != 'patient':
        return jsonify({"detail": "Само пациенти могат да сигнализират"}), 403

    data = request.get_json()
    message = data.get('message', 'Пациент изисква внимание!')
    
    db = next(database.get_db())
    try:
        # Генериране на аларма
        from uuid import UUID
        new_alert = models.Alert(
            patient_id=UUID(current_user['id']),
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
