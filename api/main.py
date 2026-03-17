from flask import Flask, jsonify
from api.routes.auth import auth_bp
from api.routes.patients import patients_bp
from api.routes.monitoring import monitoring_bp
from api.routes.notes import notes_bp

def create_app():
    app = Flask(__name__)
    
    # Конфигурация
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Регистрация на Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(patients_bp, url_prefix='/patients')
    app.register_blueprint(monitoring_bp, url_prefix='/monitoring')
    app.register_blueprint(notes_bp, url_prefix='/notes')

    @app.route('/')
    def index():
        return jsonify({"message": "Добре дошли в NeuroRisk Edu API (Flask Version)!"})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
