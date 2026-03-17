from fastapi import FastAPI
from api.routes import auth

app = FastAPI(
    title="NeuroRisk Edu API",
    description="API за клиничен мониторинг на пациенти с епилепсия",
    version="1.0.0"
)

# 1. Включваме рутера за автентикация
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Добре дошли в NeuroRisk Edu API!"}
