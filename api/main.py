import os
import sys
from flask import Flask, jsonify

from flask_cors import CORS

from api.routes.auth import auth_bp
from api.routes.patients import patients_bp
from api.routes.monitoring import monitoring_bp
from api.routes.notes import notes_bp
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
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    
    # Конфигурация
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Регистрация на Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patients_bp, url_prefix='/api/patients')
    app.register_blueprint(monitoring_bp, url_prefix='/api/monitoring')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/')
    def index():
        return jsonify({"message": "Добре дошли в NeuroRisk Edu API (Flask Version)!"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
