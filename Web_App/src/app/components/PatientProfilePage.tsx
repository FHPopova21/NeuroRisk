import React, { useState, useMemo, useEffect, useRef } from "react";
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
  Calendar
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
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

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        apiService.getPatient(id),
        apiService.getEEGHistory(id)
      ]).then(([p, history]) => {
        setPatient(p);
        setEegHistory(history);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching patient data:", err);
        setLoading(false);
      });
    }
  }, [id]);

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

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestRecord = eegHistory[0] || null;

  // Static chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      time: i,
      ch1: Math.sin(i * 0.4) * 40 + Math.random() * 20 - 10,
      ch2: Math.cos(i * 0.3) * 30 + Math.random() * 15 - 7,
    }));
  }, []);

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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient ID: #NR-00{id}384</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Record Active</span>
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
                <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-sm font-bold text-emerald-700 block">Connected</span>
                    <span className="text-[10px] font-bold text-emerald-600/60 uppercase">Syncing Live</span>
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
            <button className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              View All Notes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-3 space-y-8">
          {/* TABS */}
          <div className="flex items-center gap-6 border-b border-slate-200">
            <TabButton active={activeTab === "eeg"} onClick={() => setActiveTab("eeg")} label="EEG Monitoring" icon={Activity} />
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="Analysis History" icon={Clock} />
            <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} label="Medical Notes" icon={FileText} />
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[500px]"
          >
            {activeTab === "eeg" && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  {/* EEG CHART */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Real-time Stream Feed</h3>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Channel 01</span>
                        <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Channel 02</span>
                      </div>
                    </div>
                    <div className="h-[300px] p-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <Line type="monotone" dataKey="ch1" stroke="#10b981" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="ch2" stroke="#6366f1" strokeWidth={1.5} dot={false} opacity={0.4} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ANALYSIS RESULT */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                        <Brain className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Latest AI Interpretation</h4>
                        <p className="text-xs text-slate-500">
                          {latestRecord ? `Analysis completed at ${new Date(latestRecord.timestamp).toLocaleTimeString()}` : "No analysis available"}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                      {latestRecord?.interpretation || "Няма налични данни за този пациент за автоматичен анализ. Моля, стартирайте нов запис."}
                    </p>
                    {analysisError && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold">
                        Error: {analysisError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {latestRecord ? (
                        <>
                          <AnalysisStat label="Hjorth Act" value={latestRecord.hjorth_activity?.toFixed(2) || "0"} status="Normal" />
                          <AnalysisStat label="Mobility" value={latestRecord.hjorth_mobility?.toFixed(2) || "0"} status="Normal" />
                          <AnalysisStat label="Complexity" value={latestRecord.hjorth_complexity?.toFixed(2) || "0"} status="Normal" />
                          <AnalysisStat label="RMS" value={latestRecord.rms?.toFixed(2) || "0"} status="Normal" />
                          <AnalysisStat label="ZCR" value={latestRecord.zcr?.toFixed(4) || "0"} status="Normal" />
                          <AnalysisStat label="Peak Amp" value={latestRecord.envelope_max?.toFixed(1) || "0"} status="Normal" />
                          <AnalysisStat label="Deriv1 SD" value={latestRecord.deriv1_std?.toFixed(2) || "0"} status="Normal" />
                          <AnalysisStat label="Deriv2 SD" value={latestRecord.deriv2_std?.toFixed(2) || "0"} status="Normal" />
                        </>
                      ) : (
                        <div className="col-span-4 py-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                          Waiting for data...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 sticky top-8">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 text-center">Live Risk Score</h3>
                    <RiskGauge score={latestRecord?.risk_score || 0} />
                    
                    <div className="mt-12 space-y-4">
                      <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                        <h4 className="text-xs font-black text-orange-900 mb-2 uppercase tracking-widest flex items-center gap-2">
                          <Zap className="w-3 h-3" /> Urgent Action
                        </h4>
                        <p className="text-[11px] text-orange-800 leading-relaxed">
                          Patient is showing markers consistent with high risk. Contact patient or review livestream.
                        </p>
                      </div>
                      <button className="w-full py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
                        Notify Patient
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
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
                          <button className="px-4 py-2 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                          <h4 className="text-sm font-black text-slate-900">{note.author}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{note.date}</p>
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
