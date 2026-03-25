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
  hjorth_activity?: number | null;
  hjorth_mobility?: number | null;
  hjorth_complexity?: number | null;
  rms?: number | null;
  zcr?: number | null;
  envelope_max?: number | null;
  deriv1_std?: number | null;
  deriv2_std?: number | null;
  doctor_note?: string;
  doctor_validation?: string;
  patient_name?: string;
  ai_metadata?: any;
}

export interface MedicalNote {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id?: string;
  content: string;
  timestamp: string;
}

export interface LabAnalysis {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  notes?: string | null;
  timestamp: string;
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
    const response = await fetch(`${API_BASE_URL}/patients/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch patient details");
    return response.json();
  },

  async createPatient(data: any): Promise<Patient> {
    const response = await fetch(`${API_BASE_URL}/patients/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create patient");
    }
    return response.json();
  },

  // --- MEDICAL NOTES ---
  async getMedicalNotes(patientId?: string): Promise<MedicalNote[]> {
    const url = patientId ? `${API_BASE_URL}/notes/?patient_id=${patientId}` : `${API_BASE_URL}/notes/`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch medical notes");
    return response.json();
  },

  async createMedicalNote(patientId: string, content: string): Promise<MedicalNote> {
    const response = await fetch(`${API_BASE_URL}/notes/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ patient_id: patientId, content })
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to create medical note");
    }
    return response.json();
  },

  // --- LAB ANALYSES ---
  async getLabAnalyses(patientId: string): Promise<LabAnalysis[]> {
    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/lab-analyses`, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch lab analyses");
    return response.json();
  },

  async uploadLabAnalysis(patientId: string, file: File, notes: string = ""): Promise<LabAnalysis> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("notes", notes);

    // NOTE: Do not set Content-Type for FormData, browser sets it automatically with the boundary
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/patients/${patientId}/lab-analysis`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to upload lab analysis");
    }
    return response.json();
  },

  async updateEEGRecord(recordId: string, data: { doctor_note?: string, doctor_validation?: string }): Promise<EEGRecord> {
    const response = await fetch(`${API_BASE_URL}/monitoring/eeg-records/${recordId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to update EEG record");
    }
    return response.json();
  },

  // EEG Monitoring
  async getEEGHistory(patientId: string): Promise<EEGRecord[]> {
    const url = patientId 
      ? `${API_BASE_URL}/monitoring/history/${patientId}`
      : `${API_BASE_URL}/monitoring/history`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to load history");
    return response.json();
  },

  async analyzeRecord(recordId: string): Promise<EEGRecord> {
    const response = await fetch(`${API_BASE_URL}/monitoring/analyze/${recordId}`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Analysis failed");
    }
    return response.json();
  },

  async analyzeLabFile(labId: string): Promise<EEGRecord> {
    const response = await fetch(`${API_BASE_URL}/monitoring/analyze-file/${labId}`, {
      method: "POST",
      headers: getHeaders()
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "File Analysis failed");
    }
    return response.json();
  },

  async getAlerts(patientId?: string): Promise<any[]> {
    const url = patientId 
      ? `${API_BASE_URL}/monitoring/alerts?patient_id=${patientId}` 
      : `${API_BASE_URL}/monitoring/alerts`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error("Failed to fetch alerts");
    const data = await response.json();
    return data;
  },

  async dismissAlert(alertId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitoring/alerts/${alertId}/dismiss`, {
      method: "PATCH",
      headers: getHeaders()
    });
    if (!response.ok) throw new Error("Failed to dismiss alert");
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
