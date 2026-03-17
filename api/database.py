from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# 1. URL за връзка с PostgreSQL базата данни
# Обикновено това се зарежда от .env файл
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/neurorisk")

# 2. Създаване на Engine (Двигателят на базата данни)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 3. SessionLocal - Фабрика за създаване на сесии (връзки)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Dependency, който ще използваме в API маршрутите
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
