import os
import sys
from flask import Flask, jsonify, request

from flask_cors import CORS

from api.routes.auth import auth_bp
from api.routes.patients import patients_bp
from api.routes.monitoring import monitoring_bp
from api.routes.admin import admin_bp
from api.models import Base
from api.database import engine

# Добавяне на основната директория към пътя за импортиране
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if base_dir not in sys.path:
    sys.path.append(base_dir)

def create_app():

    # Създаване на таблиците, ако не съществуват
    Base.metadata.create_all(bind=engine)
    
    app = Flask(__name__)
    CORS(app, resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }}, supports_credentials=True)

    @app.before_request
    def log_request_info():
        print(f"--- INCOMING REQUEST ---")
        print(f"Method: {request.method}")
        print(f"Path: {request.path}")
        print(f"Headers: {dict(request.headers)}")
        print(f"------------------------")

    
    # Конфигурация
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Конфигурация за качване на файлове
    UPLOAD_FOLDER = os.path.join(base_dir, 'uploads', 'lab_results')
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    
    # Регистрация на Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(monitoring_bp, url_prefix='/api/monitoring')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/')
    def index():
        return jsonify({"message": "Добре дошли в NeuroRisk Edu API (Flask Version)!"})

    from flask import send_from_directory
    @app.route('/api/uploads/lab_results/<filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
