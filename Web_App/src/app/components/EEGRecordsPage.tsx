import React, { useState } from "react";
import {
  Activity,
  Search,
  ChevronRight,
  MoreVertical,
  Calendar,
  Download,
  X,
  Zap,
  Waves,
  Shield,
  FileText,
  Brain,
  MessageSquare,
  Clock
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Link, useNavigate } from "react-router";
import { apiService, EEGRecord } from "../services/api";
import { User } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { computeFFT } from "../utils/dsp";

export const EEGRecordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [records, setRecords] = useState<EEGRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRecords = () => {
    setLoading(true);
    apiService.getEEGHistory("")
      .then(data => {
        setRecords(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAnalyze = async (recordId: string) => {
    setAnalyzing(recordId);
    try {
      const updated = await apiService.analyzeRecord(recordId);
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      toast.success("Анализът е завършен");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAnalyzing(null);
    }
  };

  const filteredRecords = records.filter(r => {
    const matchesSearch = (r.patient_name || r.patient_id)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "All" ||
      (riskFilter === "Critical" && r.risk_score > 75) ||
      (riskFilter === "Elevated" && r.risk_score > 40 && r.risk_score <= 75) ||
      (riskFilter === "Normal" && r.risk_score <= 40);
    return matchesSearch && matchesRisk;
  });

  const getRecordDetails = (record: EEGRecord) => {
    const signal = record.ai_metadata?.raw_signal || [];
    const timeData = signal.map((val: number, i: number) => ({ time: i, value: val }));
    const spectralData = computeFFT(signal);

    return { timeData, spectralData };
  };

  const getStatusBadge = (record: EEGRecord) => {
    if (!record.risk_status) return { text: "Не е анализиран", color: "bg-slate-100 text-slate-500 border-slate-200", icon: Clock };
    if (record.risk_score > 75) return { text: "Установен пристъп", color: "bg-red-50 text-red-600 border-red-100", icon: Activity };
    if (record.risk_score > 40) return { text: "Изисква внимание", color: "bg-amber-50 text-amber-700 border-amber-100", icon: Zap };
    return { text: "Чист запис", color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: Shield };
  };

  return (
    <div className="space-y-8 relative">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">ЕЕГ Записи</h1>
          <p className="text-slate-500 font-medium tracking-tight">Достъп до исторически ЕЕГ данни и резултати от ИИ анализ.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-5 h-5" />
          Групов експорт
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
          {["All", "Critical", "Elevated", "Normal"].map((f) => {
            const labelMap: Record<string, string> = {
              "All": "Всички",
              "Critical": "Критични",
              "Elevated": "Повишени",
              "Normal": "Нормални"
            };
            return (
              <button
                key={f}
                onClick={() => setRiskFilter(f)}
                className={clsx(
                  "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                  riskFilter === f ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {labelMap[f]}
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 md:max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Търсене по ID на пациент..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full">
        {/* RECORDS LIST */}
        <div className="space-y-4 transition-all duration-500 w-full">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Пациент / ID</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Дата и Час</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Статус</th>
                    <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredRecords.map((record, i) => {
                    const status = getStatusBadge(record);
                    return (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="transition-colors group cursor-pointer hover:bg-slate-50/50"
                        onClick={() => navigate(`/patients/${record.patient_id}`)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl border bg-slate-100 border-slate-200 flex items-center justify-center transition-all group-hover:bg-white group-hover:border-emerald-200">
                              <User className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                            </div>
                            <div>
                              <span className="text-sm font-bold text-slate-900 block group-hover:text-emerald-600 transition-colors">{record.patient_name || "Непознат пациент"}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{record.patient_id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-bold text-slate-900 block">{new Date(record.timestamp).toLocaleDateString()}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(record.timestamp).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={clsx(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                            status.color
                          )}>
                            <status.icon className="w-3 h-3" />
                            {status.text}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!record.risk_status && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAnalyze(record.id); }}
                                disabled={analyzing === record.id}
                                className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-all group/btn"
                              >
                                {analyzing === record.id ? (
                                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Brain className="w-4 h-4" />
                                )}
                              </button>
                            )}
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRecords.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-slate-900 font-black">Не са намерени записи</h3>
                  <p className="text-slate-500 text-sm">Опитайте да коригирате филтрите или термина за търсене.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
