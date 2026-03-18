import unittest
import json
import sys
import os


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from api.main import create_app
from api.database import engine, SessionLocal
from api.models import Base, Doctor
import uuid

class TestAuth(unittest.TestCase):
    def setUp(self):
        # 1. Използваме тестов контекст на Flask
        self.app = create_app()
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()

    def tearDown(self):
        self.app_context.pop()

    def test_read_root(self):
        """Проверка дали началната страница работи."""
        response = self.client.get('/')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], "Добре дошли в NeuroRisk Edu API (Flask Version)!")

    def test_doctor_registration_validation(self):
        """Проверка на валидацията при регистрация на лекар (грешна парола)."""
        payload = {
            "name": "Dr. Test",
            "email": "test@doctor.com",
            "admin_assigned_id": "ADM-001",
            "password": "password123",
            "confirm_password": "different_password",
            "specialization": "Neurology"
        }
        response = self.client.post('/auth/register/doctor', 
                                    data=json.dumps(payload),
                                    content_type='application/json')
        
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Паролите не съвпадат", data['detail'])

if __name__ == '__main__':
    unittest.main()
