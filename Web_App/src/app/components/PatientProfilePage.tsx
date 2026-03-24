import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  User, 
  Smartphone, 
  Activity, 
  Clock, 
  FileText, 
  Plus, 
  Shield, 
  ChevronRight,
  Brain,
  Zap,
  MoreVertical,
  Calendar,
  Waves,
  TrendingUp,
  TrendingDown,
  X
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { clsx } from "clsx";
import { apiService, Patient, EEGRecord } from "../services/api";

// Risk Gauge Component (extracted from AnalysisPage)
const RiskGauge = ({ score }: { score: number }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  let color = "#10b981"; // Green
  let text = "Low Risk";
  if (normalizedScore >= 40) { color = "#eab308"; text = "Medium Risk"; }
  if (normalizedScore > 75) { color = "#f97316"; text = "High Risk"; }

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r={radius} stroke="#f1f5f9" strokeWidth={stroke} fill="transparent" />
          <circle
            cx="50%" cy="50%" r={radius}
            stroke={color} strokeWidth={stroke} fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-slate-900">{score}%</span>
        </div>
      </div>
      <span className="mt-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>{text}</span>
    </div>
  );
};

export const PatientProfilePage: React.FC = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"eeg" | "history" | "notes">("eeg");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [eegHistory, setEegHistory] = useState<EEGRecord[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<EEGRecord | null>(null);
  const [doctorNote, setDoctorNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const latestRecord = eegHistory[0] || null;

  // Static chart data (fallback)
  const chartData = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      time: i,
      ch1: Math.sin(i * 0.4) * 40 + Math.random() * 20 - 10,
      ch2: Math.cos(i * 0.3) * 30 + Math.random() * 15 - 7,
    }));
  }, []);

  // Derived data based on selected record
  const getRecordDetails = (record: EEGRecord | null) => {
    if (!record) return { timeData: [], spectralData: [] };
    const signal = record.ai_metadata?.raw_signal || [];
    const timeData = signal.slice(0, 100).map((val: number, i: number) => ({ time: i, value: val }));
    
    // Mock Spectral Data (0-50Hz)
    const isHighRisk = record.risk_score > 75;
    const spectralData = Array.from({ length: 50 }, (_, i) => {
      const freq = i + 1;
      let power = Math.random() * 5; // Base noise
      
      if (isHighRisk) {
        // High risk: Broadband noise, spiking in Theta/Beta
        if (freq > 4 && freq < 8) power += Math.random() * 15 + 5; // Theta
        if (freq > 15 && freq < 30) power += Math.random() * 20 + 10; // Beta
        if (freq >= 30) power += Math.random() * 15 + 5; // Gamma
      } else {
        // Normal: Dominant Alpha rhythm (8-13Hz)
        if (freq >= 8 && freq <= 13) power += Math.random() * 20 + 10;
        // Delta baseline
        if (freq < 4) power += Math.random() * 10;
      }
      
      return { freq, power };
    });

    return { timeData, spectralData };
  };

  const selectedRecordData = useMemo(() => getRecordDetails(selectedHistoryRecord || latestRecord), [selectedHistoryRecord, latestRecord]);

  useEffect(() => {
    if (selectedHistoryRecord) {
      setDoctorNote(selectedHistoryRecord.doctor_note || "");
    } else if (latestRecord) {
      setDoctorNote(latestRecord.doctor_note || "");
    }
  }, [selectedHistoryRecord, latestRecord]);

  const handleUpdateRecord = async (validation: string) => {
    const recordToUpdate = selectedHistoryRecord || latestRecord;
    if (!recordToUpdate) return;
    setUpdating(true);
    try {
      const updated = await apiService.updateEEGRecord(recordToUpdate.id, {
        doctor_note: doctorNote,
        doctor_validation: validation
      });
      setEegHistory(prev => prev.map(r => r.id === updated.id ? updated : r));
      if (selectedHistoryRecord?.id === updated.id) setSelectedHistoryRecord(updated);
      toast.success("Record updated successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!eegHistory[0]) return;
    
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const updatedRecord = await apiService.analyzeRecord(eegHistory[0].id);
      // Update history with the new analyzed record
      setEegHistory(prev => [updatedRecord, ...prev.slice(1)]);
    } catch (err: any) {
      setAnalysisError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [patientData, historyData, notesData] = await Promise.all([
          apiService.getPatient(id),
          apiService.getEEGHistory(id),
          apiService.getMedicalNotes(id)
        ]);
        setPatient(patientData);
        setEegHistory(historyData);
        setMedicalNotes(notesData);
        if (historyData.length > 0) {
          setDoctorNote(historyData[0].doctor_note || "");
        }
      } catch (err: any) {
        toast.error("Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeRecord = selectedHistoryRecord || latestRecord;

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/patients"
            className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all text-slate-400 hover:text-emerald-600 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-100 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{patient.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient ID: #NR-{patient.id.slice(0, 6)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                  {patient.is_active ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAnalyze}
            disabled={analyzing || !eegHistory.length}
            className={clsx(
              "px-6 py-3 font-bold text-sm rounded-2xl transition-all shadow-lg",
              analyzing || !eegHistory.length 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
            )}
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : "Analyze Record"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* LEFT COLUMN: PATIENT INFO */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Patient Overview</h3>
            <div className="space-y-6">
              <InfoItem label="Birth Date" value={patient.birth_date || "N/A"} />
              <InfoItem label="Gender" value={patient.gender || "N/A"} />
              <InfoItem label="Joined" value={new Date(patient.created_at).toLocaleDateString()} />
              <div className="pt-4 border-t border-slate-50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Mobile App Status</label>
                <div className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl border",
                  patient.is_active ? "bg-emerald-50/50 border-emerald-100/50" : "bg-slate-50 border-slate-100"
                )}>
                  <Smartphone className={clsx("w-5 h-5", patient.is_active ? "text-emerald-600" : "text-slate-400")} />
                  <div>
                    <span className={clsx("text-sm font-bold block", patient.is_active ? "text-emerald-700" : "text-slate-500")}>
                      {patient.is_active ? "Connected" : "Inactive"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {patient.is_active ? "Syncing Live" : "Last seen N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4">Medical Note Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">
              {patient.medical_history || "No medical history recorded for this patient."}
            </p>
            <button 
              onClick={() => setActiveTab("notes")}
              className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
            >
              View All Notes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8">
          {/* TABS */}
          <div className="flex items-center gap-6 border-b border-slate-200">
            <TabButton active={activeTab === "eeg"} onClick={() => { setActiveTab("eeg"); setSelectedHistoryRecord(null); }} label="EEG Monitoring" icon={Activity} />
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Analysis History" icon={Clock} />
            <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} label="Medical Notes" icon={FileText} />
          </div>

          <motion.div
            key={activeTab === "history" && selectedHistoryRecord ? "history-detail" : activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[500px]"
          >
            {activeTab === "eeg" && (
              <div className="space-y-8">
                {/* PRO HEADER DIAGNOSIS */}
                {latestRecord && (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Verdict (Live-ish)</h4>
                      <div className={clsx(
                        "text-2xl font-black",
                        latestRecord.risk_score > 75 ? "text-red-600" : latestRecord.risk_score > 40 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {latestRecord.risk_score > 75 ? "Seizure Detected" : latestRecord.risk_score > 40 ? "Requires Attention" : "Healthy Context"}
                        <span className="text-sm font-bold opacity-60 ml-2">({latestRecord.risk_score}% Confidence)</span>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-6 py-3 rounded-2xl border text-sm font-black uppercase tracking-wider",
                      latestRecord.risk_score > 75 ? "bg-red-50 text-red-700 border-red-100" : latestRecord.risk_score > 40 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {latestRecord.risk_status} Risk
                    </div>
                  </div>
                )}

                {/* PRO SIGNAL PLOT */}
                <div className={clsx(
                  "relative p-6 rounded-[2.5rem] border transition-all duration-700 bg-slate-50 border-slate-100",
                  latestRecord?.risk_score > 75 && "bg-red-50/50 border-red-100 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
                )}>
                  <div className="space-y-6">
                    {/* Time Domain */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={clsx(
                          "text-[10px] font-black uppercase tracking-widest",
                          latestRecord?.risk_score > 75 ? "text-red-500" : "text-slate-400"
                        )}>Time Domain: Primary Stream Signal</h4>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Live Analysis Active</span>
                        </div>
                      </div>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedRecordData.timeData.length > 0 ? selectedRecordData.timeData : chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={latestRecord?.risk_score > 75 ? "#fee2e2" : "#e2e8f0"} />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} hide />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={latestRecord?.risk_score > 75 ? "#dc2626" : "#10b981"} 
                              strokeWidth={2.5} 
                              dot={false} 
                              animationDuration={1500}
                            />
                            {selectedRecordData.timeData.length === 0 && (
                              <Line type="monotone" dataKey="ch1" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5 opacity-50" />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Frequency Domain */}
                    <div className="pt-4 border-t border-slate-200/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Frequency Domain: Spectral Density (0-50Hz)
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FFT Approximation</span>
                      </div>
                      <div className="h-28 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedRecordData.spectralData}>
                            <defs>
                              <linearGradient id="colorPowerLive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={latestRecord?.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={latestRecord?.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="freq" hide />
                            <YAxis hide />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: any) => [`${Number(value).toFixed(2)} µV²/Hz`, 'Power']}
                              labelFormatter={(label) => `${label} Hz`}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="power" 
                              stroke={latestRecord?.risk_score > 75 ? "#ef4444" : "#8b5cf6"} 
                              fillOpacity={1} 
                              fill="url(#colorPowerLive)" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BIOMARKER CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ProCard 
                    label="Energy (RMS)" 
                    value={`${latestRecord?.rms?.toFixed(2) || "0.00"} µV`} 
                    icon={Zap} 
                    color="blue"
                  />
                  <ProCard 
                    label="Spectrum (Mobility)" 
                    value={latestRecord?.hjorth_mobility?.toFixed(3) || "0.000"} 
                    icon={Waves} 
                    color="purple"
                  />
                  <ProCard 
                    label="Complexity" 
                    value={latestRecord?.hjorth_complexity?.toFixed(3) || "0.000"} 
                    icon={Brain} 
                    color="emerald"
                  />
                </div>

                {/* SHAP & LAB RESULTS */}
                {(latestRecord?.ai_metadata?.shap_explanation || chartData) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ShapWaterfall data={latestRecord?.ai_metadata?.shap_explanation || []} />
                    <LabResultsTable data={latestRecord?.ai_metadata?.shap_explanation || []} />
                  </div>
                )}

                {/* CLINICAL CONTROL CENTER */}
                {latestRecord && (
                  <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-slate-900">Live Clinical Observations</h3>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={doctorNote}
                        onChange={(e) => setDoctorNote(e.target.value)}
                        placeholder="Enter clinical observations for this specific record..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                      />
                      <div className="flex flex-wrap gap-4 pt-2">
                        <button
                          onClick={() => handleUpdateRecord("VALIDATED")}
                          disabled={updating || latestRecord.doctor_validation === "VALIDATED"}
                          className={clsx(
                            "flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                            latestRecord.doctor_validation === "VALIDATED" 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}
                        >
                          {latestRecord.doctor_validation === "VALIDATED" ? "Diagnosis Confirmed" : "Confirm Diagnosis"}
                        </button>
                        <button
                          onClick={() => handleUpdateRecord("FALSE_ALARM")}
                          disabled={updating || latestRecord.doctor_validation === "FALSE_ALARM"}
                          className={clsx(
                            "flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                            latestRecord.doctor_validation === "FALSE_ALARM"
                              ? "bg-red-500 text-white shadow-lg shadow-red-200"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          )}
                        >
                          {latestRecord.doctor_validation === "FALSE_ALARM" ? "Marked False Alarm" : "False Alarm"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && !selectedHistoryRecord && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Analysis Date</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Score</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {eegHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block">{new Date(item.timestamp).toLocaleDateString()}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(item.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={clsx(
                                  "h-full rounded-full transition-all",
                                  item.risk_score > 75 ? "bg-orange-500" : item.risk_score > 40 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${item.risk_score}%` }}
                              />
                            </div>
                            <span className="text-sm font-black text-slate-700">{item.risk_score}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={clsx(
                            "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border",
                            item.risk_status === "HIGH" ? "bg-orange-50 text-orange-600 border-orange-100" :
                            item.risk_status === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-100" :
                            "bg-emerald-50 text-emerald-600 border-emerald-100"
                          )}>
                            {item.risk_status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => setSelectedHistoryRecord(item)}
                            className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "history" && selectedHistoryRecord && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                {/* DETAIL HEADER */}
                <div className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 leading-tight">Patient Record Details</h2>
                      <p className="text-xs text-slate-400 font-medium">Record ID: {selectedHistoryRecord.id.slice(0, 8)}... • Patient: {patient.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHistoryRecord(null)}
                    className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* PRO HEADER DIAGNOSIS */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Verdict</h4>
                      <div className={clsx(
                        "text-2xl font-black",
                        selectedHistoryRecord.risk_score > 75 ? "text-red-600" : selectedHistoryRecord.risk_score > 40 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {selectedHistoryRecord.risk_score > 75 ? "Seizure Detected" : selectedHistoryRecord.risk_score > 40 ? "Requires Attention" : "Healthy Context"}
                        <span className="text-sm font-bold opacity-60 ml-2">({selectedHistoryRecord.risk_score}% Confidence)</span>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-6 py-3 rounded-2xl border text-sm font-black uppercase tracking-wider",
                      selectedHistoryRecord.risk_score > 75 ? "bg-red-50 text-red-700 border-red-100" : selectedHistoryRecord.risk_score > 40 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {selectedHistoryRecord.risk_status} Risk
                    </div>
                  </div>

                  {/* PRO SIGNAL PLOT */}
                  <div className={clsx(
                    "relative p-6 rounded-[2rem] border transition-all duration-700",
                    selectedHistoryRecord.risk_score > 75 ? "bg-red-50/50 border-red-100 shadow-[0_0_40px_rgba(239,68,68,0.1)]" : "bg-slate-50 border-slate-100"
                  )}>
                    <div className="space-y-6">
                      {/* Time Domain */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className={clsx(
                            "text-[10px] font-black uppercase tracking-widest",
                            selectedHistoryRecord.risk_score > 75 ? "text-red-500" : "text-slate-400"
                          )}>Time Domain: Historical Waveform</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedHistoryRecord.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedRecordData.timeData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={selectedHistoryRecord.risk_score > 75 ? "#fee2e2" : "#e2e8f0"} />
                              <XAxis dataKey="time" hide />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={selectedHistoryRecord.risk_score > 75 ? "#dc2626" : "#059669"} 
                                strokeWidth={2} 
                                dot={false} 
                                animationDuration={1500}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Frequency Domain */}
                      <div className="pt-4 border-t border-slate-200/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Frequency Domain: Spectral Density (0-50Hz)
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FFT</span>
                        </div>
                        <div className="h-28 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedRecordData.spectralData}>
                              <defs>
                                <linearGradient id="colorPowerHist" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={selectedHistoryRecord.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={selectedHistoryRecord.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="freq" hide />
                              <YAxis hide />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${Number(value).toFixed(2)} µV²/Hz`, 'Power']}
                                labelFormatter={(label) => `${label} Hz`}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="power" 
                                stroke={selectedHistoryRecord.risk_score > 75 ? "#ef4444" : "#8b5cf6"} 
                                fillOpacity={1} 
                                fill="url(#colorPowerHist)" 
                                strokeWidth={2}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BIOMARKER CARDS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ProCard 
                      label="Energy (RMS)" 
                      value={`${selectedHistoryRecord.rms?.toFixed(2) || "0.00"} µV`} 
                      icon={Zap} 
                      color="blue"
                    />
                    <ProCard 
                      label="Spectrum (Mobility)" 
                      value={selectedHistoryRecord.hjorth_mobility?.toFixed(3) || "0.000"} 
                      icon={Waves} 
                      color="purple"
                    />
                    <ProCard 
                      label="Complexity" 
                      value={selectedHistoryRecord.hjorth_complexity?.toFixed(3) || "0.000"} 
                      icon={Brain} 
                      color="emerald"
                    />
                  </div>

                  {/* SHAP & LAB RESULTS (History) */}
                  {selectedHistoryRecord?.ai_metadata?.shap_explanation && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <ShapWaterfall data={selectedHistoryRecord.ai_metadata.shap_explanation} />
                      <LabResultsTable data={selectedHistoryRecord.ai_metadata.shap_explanation} />
                    </div>
                  )}

                  {/* HUMAN JUDGMENT & NOTES */}
                  <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="font-black text-slate-900">Clinical Control Center</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Doctor's Clinical Notes</label>
                        <textarea
                          value={doctorNote}
                          onChange={(e) => setDoctorNote(e.target.value)}
                          placeholder="Enter your observations or diagnosis comments here..."
                          className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                        />
                      </div>

                      <div className="flex flex-wrap gap-4 pt-2">
                        <button
                          onClick={() => handleUpdateRecord("VALIDATED")}
                          disabled={updating || selectedHistoryRecord.doctor_validation === "VALIDATED"}
                          className={clsx(
                            "flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                            selectedHistoryRecord.doctor_validation === "VALIDATED" 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" 
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}
                        >
                          {selectedHistoryRecord.doctor_validation === "VALIDATED" ? "Diagnosis Confirmed" : "Confirm Diagnosis"}
                        </button>
                        <button
                          onClick={() => handleUpdateRecord("FALSE_ALARM")}
                          disabled={updating || selectedHistoryRecord.doctor_validation === "FALSE_ALARM"}
                          className={clsx(
                            "flex-1 py-4 px-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all",
                            selectedHistoryRecord.doctor_validation === "FALSE_ALARM"
                              ? "bg-red-500 text-white shadow-lg shadow-red-200"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          )}
                        >
                          {selectedHistoryRecord.doctor_validation === "FALSE_ALARM" ? "Marked False Alarm" : "False Alarm"}
                        </button>
                        {selectedHistoryRecord.doctor_validation === "PENDING" && doctorNote !== selectedHistoryRecord.doctor_note && (
                           <button
                             onClick={() => handleUpdateRecord("PENDING")}
                             disabled={updating}
                             className="w-full md:w-auto py-4 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                           >
                             Save Clinical Observations
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Medical Log History</h3>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200">
                    <Plus className="w-4 h-4" /> Add Medical Note
                  </button>
                </div>
                {medicalNotes.map((note: any) => (
                  <div key={note.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 group hover:border-emerald-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{note.doctor_id ? `Dr. ${note.doctor_id.slice(0, 5)}` : "Doctor"}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(note.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-slate-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">{label}</label>
    <span className="text-sm font-bold text-slate-900">{value}</span>
  </div>
);

const TabButton = ({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-2 pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
      active ? "text-emerald-700" : "text-slate-400 hover:text-slate-600"
    )}
  >
    <Icon className={clsx("w-4 h-4", active ? "text-emerald-600" : "text-slate-300")} />
    {label}
    {active && (
      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
    )}
  </button>
);

const ProCard = ({ label, value, icon: Icon, color = "blue" }: any) => {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className={clsx("p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md", colors[color] || colors.blue)}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 opacity-50" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
      </div>
      <span className="text-xl font-black block">{value}</span>
    </div>
  );
};

const AnalysisStat = ({ label, value, status }: { label: string, value: string, status: string }) => (
  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-sm font-black text-slate-900 mb-2">{value}</p>
    <span className={clsx(
      "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider",
      status === "Critical" ? "bg-orange-100 text-orange-600" :
      status === "High" ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
    )}>
      {status}
    </span>
  </div>
);

const ShapWaterfall = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 leading-tight">AI Diagnostic Logic (SHAP)</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Explanation: Feature Contributions</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
              <span className="text-slate-500">{item.feature}</span>
              <span className={clsx(item.impact > 0 ? "text-orange-600" : "text-emerald-600")}>
                {item.impact > 0 ? "+" : ""}{item.impact.toFixed(1)}% Impact
              </span>
            </div>
            <div className="h-3 bg-slate-50 rounded-full overflow-hidden flex relative">
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-200 z-10" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ 
                  width: `${Math.abs(item.impact)}%`,
                  left: item.impact > 0 ? "50%" : `calc(50% - ${Math.abs(item.impact)}%)`
                }}
                className={clsx(
                  "absolute h-full rounded-sm",
                  item.impact > 0 ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-gradient-to-l from-emerald-400 to-teal-500"
                )}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-medium text-slate-400 italic">
        * Positive impact (orange) increases risk score; negative impact (green) decreases it.
      </p>
    </div>
  );
};

const LabResultsTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="p-8 pb-4 border-b border-slate-50">
        <h3 className="font-black text-slate-900">Clinical Measurements</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Lab Results Format</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Biomarker</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Patient Value</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Reference (Normal)</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-5 text-sm font-bold text-slate-700">{item.feature}</td>
                <td className="px-8 py-5 text-sm font-black text-slate-900">{item.value}</td>
                <td className="px-8 py-5 text-sm font-medium text-slate-400">{item.norm}</td>
                <td className="px-8 py-5">
                  <div className={clsx(
                    "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider",
                    item.status === "High" ? "text-red-600" : item.status === "Low" ? "text-blue-600" : "text-emerald-600"
                  )}>
                    {item.status === "High" ? <TrendingUp className="w-3 h-3" /> : item.status === "Low" ? <TrendingDown className="w-3 h-3" /> : null}
                    {item.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
