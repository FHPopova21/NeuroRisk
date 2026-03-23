-- NeuroRisk Edu: Начален SQL скрипт за инициализация на базата данни

-- 1. Разширение за генериране на UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Таблица за Администратори
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблица за Лекари
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_assigned_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    specialization VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Таблица за Пациенти (с активационен поток)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    birth_date DATE,
    gender VARCHAR(20),
    medical_history TEXT,
    activation_token VARCHAR(100),
    token_expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MONITORING')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Таблица за ЕЕГ Записи (Time-series)
CREATE TABLE eeg_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    risk_score INT CHECK (risk_score BETWEEN 0 AND 100),
    risk_status VARCHAR(20) CHECK (risk_status IN ('LOW', 'MEDIUM', 'HIGH')),
    interpretation TEXT,
    amplitude FLOAT,
    frequency FLOAT,
    hjorth_activity FLOAT,
    hjorth_mobility FLOAT,
    hjorth_complexity FLOAT,
    rms FLOAT,
    zcr FLOAT,
    envelope_max FLOAT,
    deriv1_std FLOAT,
    deriv2_std FLOAT,
    ai_metadata JSONB -- Гъвкаво съхранение на метаданни
);

-- 6. Таблица за Аларми
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    message TEXT NOT NULL,
    severity VARCHAR(20),
    source VARCHAR(50), -- напр. 'AI', 'system'
    type VARCHAR(50),   -- напр. 'seizure_risk', 'anomaly'
    is_read BOOLEAN DEFAULT FALSE
);

-- 7. Таблица за Медицински Бележки
CREATE TABLE medical_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    content TEXT NOT NULL
);

-- 8. Индекси за производителност
-- Композитен индекс за бързо търсене на записи от конкретен пациент по време
CREATE INDEX idx_eeg_patient_timestamp ON eeg_records(patient_id, timestamp);
CREATE INDEX idx_alerts_patient_timestamp ON alerts(patient_id, timestamp);
CREATE INDEX idx_notes_patient_timestamp ON medical_notes(patient_id, timestamp);
