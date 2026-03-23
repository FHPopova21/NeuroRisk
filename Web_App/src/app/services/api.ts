const API_BASE_URL = "http://localhost:5000/api";

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
  interpretation: string;
  amplitude: number | null;
  frequency: number | null;
  hjorth_activity: number | null;
  hjorth_mobility: number | null;
  hjorth_complexity: number | null;
  rms: number | null;
  zcr: number | null;
  envelope_max: number | null;
  deriv1_std: number | null;
  deriv2_std: number | null;
  ai_metadata: any;
}

export interface Patient {
  id: string;
  doctor_id: string | null;
  patient_id: string;
  name: string;
  email: string;
  birth_date: string | null;
  gender: string | null;
  medical_history: string | null;
  is_active: boolean;
  status: string;
  created_at: string;
}

export const apiService = {
  // Patients
  async getPatients(doctorId?: string): Promise<Patient[]> {
    const url = doctorId ? `${API_BASE_URL}/patients/doctor/${doctorId}` : `${API_BASE_URL}/patients/`; // Fallback to all if no doctor provided for demo
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch patients");
    return response.json();
  },

  async getPatient(id: string): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/patients/${id}`);
    if (!response.ok) throw new Error("Failed to fetch patient details");
    return response.json();
  },

  // EEG Monitoring
  async getEEGHistory(patientId: string): Promise<EEGRecord[]> {
    const url = patientId 
      ? `${API_BASE_URL}/monitoring/history/${patientId}`
      : `${API_BASE_URL}/monitoring/history`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch EEG history");
    return response.json();
  },

  async getAlerts(patientId?: string): Promise<any[]> {
    const url = patientId 
      ? `${API_BASE_URL}/monitoring/alerts?patient_id=${patientId}` 
      : `${API_BASE_URL}/monitoring/alerts`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return response.json();
  },

  async getMedicalNotes(patientId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/monitoring/notes/${patientId}`);
    if (!response.ok) throw new Error("Failed to fetch notes");
    return response.json();
  },

  // Auth
  async login(email: string, password: string): Promise<{ token: string, user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }
    return response.json();
  },

  async getMe(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch current user");
    return response.json();
  },

  async registerDoctor(data: any): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/register/doctor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }
    return response.json();
  },

  // Admin
  async getAdminStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch admin stats");
    return response.json();
  },

  async getAdminDoctors(status?: string): Promise<any[]> {
    const url = status ? `${API_BASE_URL}/admin/doctors?status=${status}` : `${API_BASE_URL}/admin/doctors`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch doctors");
    return response.json();
  },

  async getAdminPatients(): Promise<Patient[]> {
    const response = await fetch(`${API_BASE_URL}/admin/patients`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch all patients");
    return response.json();
  },

  async updateDoctorStatus(id: string, status: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/admin/doctors/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error("Failed to update doctor status");
    return response.json();
  },

  async getAdminAlerts(severity?: string): Promise<any[]> {
    const url = severity ? `${API_BASE_URL}/admin/alerts?severity=${severity}` : `${API_BASE_URL}/admin/alerts`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch all alerts");
    return response.json();
  },

  async getAdminLogs(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/logs`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch activity logs");
    return response.json();
  }
};
