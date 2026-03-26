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
  X,
  Microscope,
  UploadCloud,
  FileCheck,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useParams } from "react-router";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { clsx } from "clsx";
import { apiService, Patient, EEGRecord, LabAnalysis } from "../services/api";

// Risk Gauge Component (extracted from AnalysisPage)
const RiskGauge = ({ score }: { score: number }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  let color = "#10b981"; // Green
  let text = "Нисък риск";
  if (normalizedScore >= 40) { color = "#eab308"; text = "Среден риск"; }
  if (normalizedScore > 75) { color = "#f97316"; text = "Висок риск"; }

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
  const [activeTab, setActiveTab] = useState<"eeg" | "history" | "notes" | "lab">("eeg");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [eegHistory, setEegHistory] = useState<EEGRecord[]>([]);
  const [medicalNotes, setMedicalNotes] = useState<any[]>([]);
  const [labAnalyses, setLabAnalyses] = useState<LabAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<EEGRecord | null>(null);
  const [doctorNote, setDoctorNote] = useState("");
  const [updating, setUpdating] = useState(false);
  
  // Lab upload state
  const [labFile, setLabFile] = useState<File | null>(null);
  const [labNotes, setLabNotes] = useState("");
  const [uploadingLab, setUploadingLab] = useState(false);

  // New Note State
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  // EEG Analysis File Selection
  const [selectedLabAnalysis, setSelectedLabAnalysis] = useState<string>("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    // Each record is 23s long. 
    // To show periodicity and spikes better, we increase resolution from 100 to 1000 points
    // Recharts handles ~1000 points well.
    const displayPoints = signal.length > 1000 ? signal.filter((_: number, i: number) => i % Math.ceil(signal.length / 1000) === 0) : signal;

    const timeData = displayPoints.map((val: number, i: number) => ({ 
      time: (i / Math.max(1, displayPoints.length - 1)) * 23, 
      value: val 
    }));
    
    const isHighRisk = record.risk_score > 75;
    const isMediumRisk = record.risk_score > 40;
    
    const spectralData = record.ai_metadata?.spectral_data || Array.from({ length: 60 }, (_, i) => {
      const freq = i + 1;
      let power = Math.random() * -1; // Base noise (log scale floor)
      
      if (isHighRisk) {
        // High risk: Broadband noise, spiking in Theta/Beta
        if (freq > 4 && freq < 8) power += Math.random() * 2 + 1; // Theta
        if (freq > 15 && freq < 30) power += Math.random() * 3 + 2; // Beta
        if (freq >= 30) power += Math.random() * 2 + 1; // Gamma
      } else if (isMediumRisk) {
        // Medium risk: Some elevated noise in Theta/Alpha
        if (freq >= 4 && freq <= 13) power += Math.random() * 1.5;
      } else {
        // Normal: Dominant Alpha rhythm (8-13Hz)
        if (freq >= 8 && freq <= 13) power += Math.random() * 1.5;
        // Delta baseline
        if (freq < 4) power += Math.random() * 0.5;
      }
      
      return { freq, power };
    });

    return { timeData, spectralData };
  };

  const selectedRecordData = useMemo(() => getRecordDetails(selectedHistoryRecord || latestRecord), [selectedHistoryRecord, latestRecord]);

  useEffect(() => {
    if (patient) {
      try {
        const stored = localStorage.getItem('recently_viewed_patients');
        let recent = stored ? JSON.parse(stored) : [];
        recent = recent.filter((p: any) => p.id !== patient.id);
        recent.unshift({ id: patient.id, name: patient.name, timestamp: new Date().toISOString() });
        if (recent.length > 5) recent = recent.slice(0, 5);
        localStorage.setItem('recently_viewed_patients', JSON.stringify(recent));
      } catch (e) {
        console.error("Failed to save recently viewed", e);
      }
    }
  }, [patient]);

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
      
      // Also sync it to Global Medical Notes if there is any content, so it appears everywhere
      if (doctorNote && doctorNote.trim() !== "") {
        const globalNoteStr = `[Клиничен анализ - Запис ${recordToUpdate.id.slice(0,6)}]: ${doctorNote}`;
        const newGlobalNote = await apiService.createMedicalNote(id!, globalNoteStr);
        setMedicalNotes(prev => [newGlobalNote, ...prev]);
      }
      
      toast.success("Записът е обновен успешно");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedLabAnalysis && !eegHistory[0]) return;
    
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      if (selectedLabAnalysis) {
        const newRecord = await apiService.analyzeLabFile(selectedLabAnalysis);
        setEegHistory(prev => [newRecord, ...prev]);
        setSelectedHistoryRecord(newRecord); // Auto-select the newly analyzed record
        setSelectedLabAnalysis(""); // Reset selection
        toast.success("Анализът на файла приключи!");
      } else {
        const updatedRecord = await apiService.analyzeRecord(eegHistory[0].id);
        // Update history with the new analyzed record
        setEegHistory(prev => [updatedRecord, ...prev.slice(1)]);
        toast.success("Записът е преанализиран!");
      }
    } catch (err: any) {
      setAnalysisError(err.message);
      toast.error(err.message || "Неуспешен анализ");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [patientData, historyData, notesData, labData] = await Promise.all([
          apiService.getPatient(id),
          apiService.getEEGHistory(id),
          apiService.getMedicalNotes(id),
          apiService.getLabAnalyses(id)
        ]);
        setPatient(patientData);
        setEegHistory(historyData);
        setMedicalNotes(notesData);
        setLabAnalyses(labData);
        if (historyData.length > 0) {
          setDoctorNote(historyData[0].doctor_note || "");
        }
      } catch (err: any) {
        toast.error("Грешка при зареждане на данните за пациента");
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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Пациент ID: #NR-{patient.id.slice(0, 6)}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">
                  {patient.is_active ? "Свързан" : "Прекъснат"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === "eeg" && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-3 w-72 justify-between"
              >
                <span className="truncate">
                  {selectedLabAnalysis 
                    ? labAnalyses.find(l => l.id === selectedLabAnalysis)?.file_name 
                    : "- Изберете източник за анализ -"}
                </span>
                <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
              </button>
              
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto hide-scrollbar py-2">
                      <button
                        onClick={() => { setSelectedLabAnalysis(""); setIsDropdownOpen(false); }}
                        className="w-full text-left px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100"
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                          - Стандартен стрийм на живо -
                        </span>
                      </button>
                      {labAnalyses.map(lab => (
                        <button
                          key={lab.id}
                          onClick={() => { setSelectedLabAnalysis(lab.id); setIsDropdownOpen(false); }}
                          className={clsx(
                            "w-full text-left px-5 py-3 transition-colors flex flex-col gap-1 border-b border-slate-50 last:border-0",
                            selectedLabAnalysis === lab.id ? "bg-emerald-50/50" : "hover:bg-slate-50"
                          )}
                        >
                          <span className={clsx(
                            "text-sm font-bold",
                            selectedLabAnalysis === lab.id ? "text-emerald-700" : "text-slate-700"
                          )}>
                            {lab.file_name}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Качен: {new Date(lab.timestamp).toLocaleDateString()}
                          </span>
                        </button>
                      ))}
                      {labAnalyses.length === 0 && (
                        <div className="px-5 py-4 text-xs font-medium text-slate-400 text-center">
                          Няма качени валидни файлове за лабораторен анализ все още.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          <button 
            onClick={handleAnalyze}
            disabled={analyzing || (!eegHistory.length && !selectedLabAnalysis)}
            className={clsx(
              "px-6 py-3 font-bold text-sm rounded-2xl transition-all shadow-lg",
              analyzing || (!eegHistory.length && !selectedLabAnalysis)
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
            )}
          >
            {analyzing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Анализиране...
              </div>
            ) : "Анализирай запис"}
          </button>
        </div>
      </div>

      <div className="w-full">
        {/* MAIN CONTENT */}
        <div className="w-full space-y-8">
          {/* TABS */}
          <div className="flex flex-wrap items-center gap-6 border-b border-slate-200">
            <TabButton active={activeTab === "eeg"} onClick={() => { setActiveTab("eeg"); setSelectedHistoryRecord(null); }} label="ЕЕГ Мониторинг" icon={Activity} />
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} label="История на анализите" icon={Clock} />
            <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")} label="Медицинско досие" icon={FileText} />
            <TabButton active={activeTab === "lab"} onClick={() => setActiveTab("lab")} label="Лабораторен анализ" icon={Microscope} />
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
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Анализ на ИИ (На живо)</h4>
                      <div className={clsx(
                        "text-2xl font-black",
                        latestRecord.risk_score > 75 ? "text-red-600" : latestRecord.risk_score > 40 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {latestRecord.risk_score > 75 ? "Установен пристъп" : latestRecord.risk_score > 40 ? "Изисква внимание" : "Здрав"}
                        <span className="text-sm font-bold opacity-60 ml-2">({latestRecord.risk_score}% Сигурност)</span>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-6 py-3 rounded-2xl border text-sm font-black uppercase tracking-wider",
                      latestRecord.risk_score > 75 ? "bg-red-50 text-red-700 border-red-100" : latestRecord.risk_score > 40 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {latestRecord.risk_status} Риск
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
                        )}>Времева област: Основен сигнал</h4>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Активен анализ на живо</span>
                        </div>
                      </div>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedRecordData.timeData.length > 0 ? selectedRecordData.timeData : chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={latestRecord?.risk_score > 75 ? "#fee2e2" : "#e2e8f0"} />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} µV`} width={60} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: any) => [`${Number(value).toFixed(2)} µV`, 'Напрежение']}
                              labelFormatter={() => 'Симулиран поток (Време)'}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke={
                                latestRecord?.risk_score > 75 ? "#ef4444" : // RED (Ictal)
                                latestRecord?.risk_score > 40 ? "#f59e0b" : // ORANGE (Interictal)
                                "#10b981" // GREEN (Healthy)
                              } 
                              strokeWidth={1.5} 
                              dot={false} 
                              isAnimationActive={false}
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
                          Честотна област: Спектрална плътност (0-50Hz)
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FFT апроксимация</span>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={selectedRecordData.spectralData}>
                            <defs>
                              <linearGradient id="colorPowerLive" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={latestRecord?.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={latestRecord?.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="freq" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}Hz`} domain={[0, 60]} />
                            <YAxis 
                              tick={{fontSize: 10, fill: '#64748b'}} 
                              axisLine={false} 
                              tickLine={false} 
                              tickFormatter={(val) => Number.isInteger(Number(val)) ? `10^${val}` : ""} 
                              domain={[-3, 5]}
                              width={40} 
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              formatter={(value: any) => [`${Number(value).toFixed(2)} µV²/Hz`, 'Мощност']}
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
                    label="Енергия (RMS)" 
                    value={`${latestRecord?.rms?.toFixed(2) || "0.00"} µV`} 
                    icon={Zap} 
                    color="blue"
                  />
                  <ProCard 
                    label="Спектър (Подвижност)" 
                    value={latestRecord?.hjorth_mobility?.toFixed(3) || "0.000"} 
                    icon={Waves} 
                    color="purple"
                  />
                  <ProCard 
                    label="Комплексност" 
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
                      <h3 className="font-black text-slate-900">Клинични наблюдения на живо</h3>
                    </div>
                    <div className="space-y-4">
                      <textarea
                        value={doctorNote}
                        onChange={(e) => setDoctorNote(e.target.value)}
                        placeholder="Въведете клинични наблюдения за този конкретен запис..."
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
                          {latestRecord.doctor_validation === "VALIDATED" ? "Диагнозата е потвърдена" : "Потвърди диагноза"}
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
                          {latestRecord.doctor_validation === "FALSE_ALARM" ? "Маркирано като фалшива аларма" : "Фалшива аларма"}
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
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Дата на анализ</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ниво на риск</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Статус</th>
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
                            Преглед на детайли
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
                      <h2 className="text-lg font-black text-slate-900 leading-tight">Детайли за записа</h2>
                      <p className="text-xs text-slate-400 font-medium">Запис ID: {selectedHistoryRecord.id.slice(0, 8)}... • Пациент: {patient.name}</p>
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
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Анализ на ИИ</h4>
                      <div className={clsx(
                        "text-2xl font-black",
                        selectedHistoryRecord.risk_score > 75 ? "text-red-600" : selectedHistoryRecord.risk_score > 40 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {selectedHistoryRecord.risk_score > 75 ? "Установен пристъп" : selectedHistoryRecord.risk_score > 40 ? "Изисква внимание" : "Здрав"}
                        <span className="text-sm font-bold opacity-60 ml-2">({selectedHistoryRecord.risk_score}% Сигурност)</span>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-6 py-3 rounded-2xl border text-sm font-black uppercase tracking-wider",
                      selectedHistoryRecord.risk_score > 75 ? "bg-red-50 text-red-700 border-red-100" : selectedHistoryRecord.risk_score > 40 ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    )}>
                      {selectedHistoryRecord.risk_status} Риск
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
                          )}>Времева област: Историческа вълна</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(selectedHistoryRecord.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="h-[400px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={selectedRecordData.timeData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={selectedHistoryRecord.risk_score > 75 ? "#fee2e2" : "#e2e8f0"} />
                              <XAxis dataKey="time" hide />
                              <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val} µV`} width={60} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${Number(value).toFixed(2)} µV`, 'Напрежение']}
                                labelFormatter={() => 'Времеви запис'}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke={
                                  selectedHistoryRecord.risk_score > 75 ? "#ef4444" : // RED
                                  selectedHistoryRecord.risk_score > 40 ? "#f59e0b" : // ORANGE
                                  "#10b981" // GREEN
                                } 
                                strokeWidth={1.5} 
                                dot={false} 
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Frequency Domain */}
                      <div className="pt-4 border-t border-slate-200/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Честотна област: Спектрална плътност (0-50Hz)
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">FFT</span>
                        </div>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={selectedRecordData.spectralData}>
                              <defs>
                                <linearGradient id="colorPowerHist" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={selectedHistoryRecord.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={selectedHistoryRecord.risk_score > 75 ? "#ef4444" : "#8b5cf6"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="freq" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}Hz`} domain={[0, 60]} />
                            <YAxis 
                              tick={{fontSize: 10, fill: '#64748b'}} 
                              axisLine={false} 
                              tickLine={false} 
                              tickFormatter={(val) => Number.isInteger(Number(val)) ? `10^${val}` : ""} 
                              domain={[-3, 5]}
                              width={40} 
                            />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${Number(value).toFixed(2)} µV²/Hz`, 'Мощност']}
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
                      label="Енергия (RMS)" 
                      value={`${selectedHistoryRecord.rms?.toFixed(2) || "0.00"} µV`} 
                      icon={Zap} 
                      color="blue"
                    />
                    <ProCard 
                      label="Спектър (Подвижност)" 
                      value={selectedHistoryRecord.hjorth_mobility?.toFixed(3) || "0.000"} 
                      icon={Waves} 
                      color="purple"
                    />
                    <ProCard 
                      label="Комплексност" 
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
                      <h3 className="font-black text-slate-900">Клиничен контролен център</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Клинични бележки на лекаря</label>
                        <textarea
                          value={doctorNote}
                          onChange={(e) => setDoctorNote(e.target.value)}
                          placeholder="Въведете вашите наблюдения или диагностични коментари тук..."
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
                          {selectedHistoryRecord.doctor_validation === "VALIDATED" ? "Диагнозата е потвърдена" : "Потвърди диагноза"}
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
                          {selectedHistoryRecord.doctor_validation === "FALSE_ALARM" ? "Маркирано като фалшива аларма" : "Фалшива аларма"}
                        </button>
                        {selectedHistoryRecord.doctor_validation === "PENDING" && doctorNote !== selectedHistoryRecord.doctor_note && (
                           <button
                             onClick={() => handleUpdateRecord("PENDING")}
                             disabled={updating}
                             className="w-full md:w-auto py-4 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                           >
                             Запази клинични наблюдения
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
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">История на медицинското досие</h3>
                  <button 
                    onClick={() => setIsAddingNote(!isAddingNote)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                  >
                    {isAddingNote ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} 
                    {isAddingNote ? "Отказ" : "Добави медицинска бележка"}
                  </button>
                </div>

                {isAddingNote && (
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-6">
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Въведете нови медицински наблюдения тук..."
                      className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none mb-4"
                    />
                    <div className="flex justify-end">
                      <button
                        disabled={savingNote || !newNoteContent.trim()}
                        onClick={async () => {
                          setSavingNote(true);
                          try {
                            const newGlobalNote = await apiService.createMedicalNote(id!, newNoteContent);
                            setMedicalNotes(prev => [newGlobalNote, ...prev]);
                            setNewNoteContent("");
                            setIsAddingNote(false);
                            toast.success("Медицинската бележка е добавена!");
                          } catch (err: any) {
                            toast.error(err.message || "Неуспешно добавяне на бележка");
                          } finally {
                            setSavingNote(false);
                          }
                        }}
                        className={clsx(
                          "px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
                          savingNote || !newNoteContent.trim() ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                        )}
                      >
                        {savingNote ? "Запазване..." : "Запази бележка"}
                      </button>
                    </div>
                  </div>
                )}

                {medicalNotes.map((note: any) => (
                  <div key={note.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 group hover:border-emerald-100 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{note.doctor_id ? `Д-р ${note.doctor_id.slice(0, 5)}` : "Доктор"}</h4>
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

            {activeTab === "lab" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* UPLOAD FORM */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                    <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-emerald-600" />
                      Качи нов анализ
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Файл (TXT, CSV)</label>
                        <input
                          type="file"
                          accept=".txt,.csv"
                          onChange={(e) => setLabFile(e.target.files ? e.target.files[0] : null)}
                          className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all border border-slate-200 rounded-xl p-2 focus:ring-4 focus:ring-emerald-500/10 cursor-pointer"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Клинични бележки (Опционално)</label>
                        <textarea
                          value={labNotes}
                          onChange={(e) => setLabNotes(e.target.value)}
                          placeholder="напр. ЯМР показва структурни нормалности..."
                          className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none"
                        />
                      </div>
                      
                      <button
                        onClick={async () => {
                          if (!labFile) {
                            toast.error("Моля, изберете файл за качване.");
                            return;
                          }
                          setUploadingLab(true);
                          try {
                            const newAnalysis = await apiService.uploadLabAnalysis(id!, labFile, labNotes);
                            setLabAnalyses([newAnalysis, ...labAnalyses]);
                            setLabFile(null);
                            setLabNotes("");
                            toast.success("Лабораторният анализ е качен успешно");
                          } catch (err: any) {
                            toast.error(err.message || "Неуспешно качване на файл");
                          } finally {
                            setUploadingLab(false);
                          }
                        }}
                        disabled={uploadingLab || !labFile}
                        className={clsx(
                          "w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md mt-4 flex justify-center items-center gap-2",
                          uploadingLab || !labFile 
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200"
                        )}
                      >
                        {uploadingLab ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Качване...
                          </div>
                        ) : "Потвърди качването"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* RESULTS LIST */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">История на лабораторията</h3>
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-wider">
                      {labAnalyses.length} Документи
                    </span>
                  </div>
                  
                  {labAnalyses.length === 0 ? (
                    <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-[2rem] p-12 text-center">
                      <Microscope className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-50" />
                      <h4 className="text-slate-500 font-black mb-1">Няма налични лабораторни резултати</h4>
                      <p className="text-xs text-slate-400 font-medium">Качете външни оценки тук.</p>
                    </div>
                  ) : (
                    labAnalyses.map((lab: LabAnalysis) => (
                      <div key={lab.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-slate-900 break-words">{lab.file_name}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {new Date(lab.timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex gap-2 mb-2">
                            <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-widest border border-slate-200">
                              {lab.file_type.split('/').pop() || 'Unknown'}
                            </span>
                          </div>

                          {lab.notes && (
                            <p className="text-xs text-slate-600 font-medium italic bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed mt-2">
                              "{lab.notes}"
                            </p>
                          )}
                          
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <a 
                              href={`http://127.0.0.1:5000${lab.file_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center justify-center px-6 py-2 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-100 transition-colors"
                            >
                              View Document
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
            <h3 className="font-black text-slate-900 leading-tight">Диагностична логика на ИИ (SHAP)</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Локално обяснение: Принос на характеристиките</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {data.map((item, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
              <span className="text-slate-500">{item.feature}</span>
              <span className={clsx(item.impact > 0 ? "text-orange-600" : "text-emerald-600")}>
                {item.impact > 0 ? "+" : ""}{item.impact.toFixed(1)}% Влияние
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
        * Положителното влияние (оранжево) увеличава риска; отрицателното (зелено) го намалява.
      </p>
    </div>
  );
};

const LabResultsTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
      <div className="p-8 pb-4 border-b border-slate-50">
        <h3 className="font-black text-slate-900">Клинични измервания</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Формат на медицински лабораторни резултати</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Биомаркер</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Стойност на пациента</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Референтни граници</th>
              <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Статус</th>
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
                    {item.status === "High" ? "Висок" : item.status === "Low" ? "Нисък" : item.status === "Normal" ? "Нормален" : item.status}
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
