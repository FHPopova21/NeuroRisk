const API_BASE_URL = "http://localhost:5000/api";

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
    const response = await fetch(url);
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
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch EEG history");
    return response.json();
  },

  async getAlerts(patientId?: string): Promise<any[]> {
    const url = patientId 
      ? `${API_BASE_URL}/monitoring/alerts?patient_id=${patientId}` 
      : `${API_BASE_URL}/monitoring/alerts`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch alerts");
    return response.json();
  },

  async getMedicalNotes(patientId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/monitoring/notes/${patientId}`);
    if (!response.ok) throw new Error("Failed to fetch notes");
    return response.json();
  }
};
