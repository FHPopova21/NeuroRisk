from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import monitoring
from api.utils.auth import token_required, role_required
from pydantic import ValidationError
from uuid import UUID

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
        record = db.query(models.EEGRecord).filter(models.EEGRecord.id == UUID(record_id)).first()
        if not record:
            return jsonify({"detail": "Записът не е намерен"}), 404
            
        # Извикваме AI сервиза за анализ
        updated_record = monitoring.analyze_with_lstm(db, record)
        return jsonify(schemas.EEGRecord.model_validate(updated_record).model_dump()), 200
    except Exception as e:
        return jsonify({"detail": str(e)}), 400
    finally:
        db.close()
