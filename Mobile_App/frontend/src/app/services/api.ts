const API_BASE_URL = "http://127.0.0.1:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export interface EEGRecord {
  id: string;
  patient_id: string;
  timestamp: string;
  risk_score: number;
  risk_status: string;
  interpretation?: string;
  amplitude?: number | null;
  frequency?: number | null;
  ai_metadata?: any;
}

export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  email: string;
  status: string;
  risk_score?: number;
  total_records?: number;
  doctor_name?: string;
  doctor_specialization?: string;
  is_active: boolean;
  last_active?: string;
  created_at: string;
}

export const apiService = {
  // Auth
  async login(loginId: string, password: string): Promise<{ token: string, user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginId, password })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Влизането неуспешно");
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  },

  async getMe(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Неуспешно извличане на потребител");
    return response.json();
  },

  async activatePatient(token: string, password: string, confirmPassword: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/patients/activate/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, confirm_password: confirmPassword })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Активацията неуспешна");
    }
    return response.json();
  },

  // Patient Data
  async getMyProfile(): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Неуспешно зареждане на профил");
    const user = await response.json();
    // Assuming backend returns patient data if user is a patient
    return user;
  },

  async getMyHistory(): Promise<EEGRecord[]> {
    const response = await fetch(`${API_BASE_URL}/monitoring/history/me`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Неуспешно зареждане на историята");
    return response.json();
  },

  async getLatestNote(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/notes/latest`, { headers: getHeaders() });
    if (!response.ok) return null;
    return response.json();
  },

  // Signaling & Monitoring
  async signalDoctor(message: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitoring/signal`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!response.ok) throw new Error("Неуспешно изпращане на сигнал");
    return response.json();
  },

  async processSignal(signal: number[]): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitoring/process`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ signal })
    });
    if (!response.ok) throw new Error("Грешка при обработка на сигнала");
    return response.json();
  },

  async sendHeartbeat(metrics: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitoring/heartbeat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(metrics)
    });
    return response.ok;
  },

  async setPassword(password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/set-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ password })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Грешка при задаване на паролата");
    }
    return response.json();
  }
};
