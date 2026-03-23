from flask import Blueprint, request, jsonify
from api import schemas, database
from api.services import monitoring
from pydantic import ValidationError
from uuid import UUID

monitoring_bp = Blueprint('monitoring', __name__)

@monitoring_bp.route('/eeg', methods=['POST'])
def add_eeg_record():
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
        return jsonify(schemas.EEGRecord.from_attributes(new_record).dict()), 201
    finally:
        db.close()

@monitoring_bp.route('/process', methods=['POST'])
def process_signal():
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
        return jsonify(schemas.EEGRecord.from_attributes(new_record).dict()), 201
    finally:
        db.close()

@monitoring_bp.route('/history/<patient_id>', methods=['GET'])
def get_history(patient_id):
    """
    Връща историята на записите за конкретен пациент.
    """
    db = next(database.get_db())
    try:
        history = monitoring.get_patient_history(db=db, patient_id=patient_id)
        return jsonify([schemas.EEGRecord.from_attributes(r).dict() for r in history]), 200
    finally:
        db.close()

@monitoring_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """
    Връща списък с активните аларми. Може да се филтрира по patient_id през query параметър.
    """
    patient_id = request.args.get('patient_id')
    db = next(database.get_db())
    try:
        alerts = monitoring.get_active_alerts(db=db, patient_id=patient_id)
        return jsonify([schemas.Alert.from_attributes(a).dict() for a in alerts]), 200
    finally:
        db.close()

@monitoring_bp.route('/history', methods=['GET'])
def get_all_history():
    """
    Връща списък с последните анализи за всички пациенти.
    """
    db = next(database.get_db())
    try:
        history = monitoring.get_all_records(db=db)
        return jsonify([schemas.EEGRecord.from_attributes(r).dict() for r in history]), 200
    finally:
        db.close()
