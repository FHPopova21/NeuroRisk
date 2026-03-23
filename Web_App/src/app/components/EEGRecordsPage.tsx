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
  MessageSquare
} from "lucide-react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
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
  const [selectedRecord, setSelectedRecord] = useState<EEGRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    apiService.getEEGHistory("")
      .then(data => {
        setRecords(data);
        setLoading(false);
      });
  }, []);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.patient_id?.toLowerCase().includes(searchTerm.toLowerCase());
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

  return (
    <div className="space-y-8 relative">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">EEG Records</h1>
          <p className="text-slate-500 font-medium tracking-tight">Access historical EEG data and AI analysis results.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-bold text-sm rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
          <Download className="w-5 h-5" />
          Batch Export
        </button>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl">
          {["All", "Critical", "Elevated", "Normal"].map((f) => (
            <button
              key={f}
              onClick={() => setRiskFilter(f)}
              className={clsx(
                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                riskFilter === f ? "bg-white text-emerald-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 md:max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* RECORDS TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date & Time</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Score</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => setSelectedRecord(record)}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-400" />
                      </div>
                        <span className="text-sm font-bold text-slate-900 block">{record.patient_name || record.patient_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 block">{new Date(record.timestamp).toLocaleDateString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(record.timestamp).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={clsx(
                            "h-full rounded-full transition-all",
                            record.risk_score > 75 ? "bg-orange-500" : record.risk_score > 40 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${record.risk_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-slate-700">{record.risk_score}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border",
                      record.risk_status === "HIGH" ? "bg-orange-50 text-orange-600 border-orange-100" :
                        record.risk_status === "MEDIUM" ? "bg-amber-50 text-amber-700 border-amber-100" :
                          "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {record.risk_status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all rounded-xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100">
                        <Activity className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-slate-900 font-black">No records found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your filters or search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL/DRAWER */}
      <AnimatePresence>
        {selectedRecord && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8"
              onClick={() => setSelectedRecord(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white w-full max-w-6xl max-h-full overflow-y-auto rounded-[3rem] shadow-2xl relative"
                key={selectedRecord.id}
                onClick={(e) => e.stopPropagation()}
              >
                {/* MODAL HEADER */}
                <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex items-center justify-between z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 leading-tight">EEG Record Details</h2>
                      <p className="text-sm text-slate-400 font-medium">Record ID: {selectedRecord.id.slice(0, 8)}... • Patient: {selectedRecord.patient_name || selectedRecord.patient_id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-3 hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all border border-transparent hover:border-slate-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* TOP STATS GRID */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                          <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Score</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className={clsx(
                          "text-4xl font-black",
                          selectedRecord.risk_score > 75 ? "text-orange-600" : selectedRecord.risk_score > 40 ? "text-amber-600" : "text-emerald-600"
                        )}>{selectedRecord.risk_score}%</span>
                        <span className="text-sm font-bold text-slate-400 mb-1">Probability</span>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hjorth Activity</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900">{selectedRecord.hjorth_activity?.toFixed(1) || "0.0"}</span>
                        <span className="text-sm font-bold text-slate-400 mb-1">μV²</span>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                          <Waves className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RMS Amplitude</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-black text-slate-900">{selectedRecord.rms?.toFixed(1) || "0.0"}</span>
                        <span className="text-sm font-bold text-slate-400 mb-1">μV</span>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                          <Shield className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Status</span>
                      </div>
                      <div className="pt-1">
                        <span className={clsx(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                          selectedRecord.risk_status === "HIGH" ? "bg-orange-100 text-orange-700" :
                            selectedRecord.risk_status === "MEDIUM" ? "bg-amber-100 text-amber-700" :
                              "bg-emerald-100 text-emerald-700"
                        )}>{selectedRecord.risk_status}</span>
                      </div>
                    </div>
                  </div>

                  {/* CHARTS SECTION */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* TIME DOMAIN CHART */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Time Domain Visualization</h3>
                          <p className="text-xs text-slate-400 font-medium">Waveform representation of raw EEG signal (μV / Sample)</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                          <Activity className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={getRecordDetails(selectedRecord).timeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis domain={['auto', 'auto']} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                              labelStyle={{ display: 'none' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#059669"
                              strokeWidth={1.5}
                              dot={false}
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* FREQUENCY DOMAIN CHART */}
                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-lg font-black text-slate-900">Spectral Domain Analysis</h3>
                          <p className="text-xs text-slate-400 font-medium">Power spectral density via FFT decomposition</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100">
                          <Brain className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={getRecordDetails(selectedRecord).spectralData}>
                            <defs>
                              <linearGradient id="colorMag" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="frequency" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area
                              type="monotone"
                              dataKey="magnitude"
                              stroke="#3b82f6"
                              fillOpacity={1}
                              fill="url(#colorMag)"
                              animationDuration={2000}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* DOCTOR NOTES */}
                  <div className="bg-white rounded-[3rem] border border-slate-100 p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor's Clinical Notes</h4>
                    </div>
                    <textarea
                      className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm resize-none"
                      rows={4}
                      placeholder="Add clinical observations for this specific recording..."
                      defaultValue={selectedRecord.doctor_note || ""}
                      onBlur={async (e) => {
                        try {
                          await apiService.updateEEGRecordNote(selectedRecord.id, e.target.value);
                          toast.success("Note updated");
                        } catch (err) {
                          toast.error("Failed to update note");
                        }
                      }}
                    />
                  </div>

                  {/* AI INTERPRETATION & FULL FEATURES */}
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                          <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">AI Clinical Interpretation</h3>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-slate-600 leading-relaxed italic">"{selectedRecord.interpretation}"</p>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[3rem] text-white">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6">Feature Metrics</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Complexity", value: selectedRecord.hjorth_complexity?.toFixed(3) },
                          { label: "Mobility", value: selectedRecord.hjorth_mobility?.toFixed(3) },
                          { label: "Zero Crossing", value: selectedRecord.zcr?.toFixed(4) },
                          { label: "Envelope Max", value: selectedRecord.envelope_max?.toFixed(1) },
                          { label: "Deriv1 SD", value: selectedRecord.deriv1_std?.toFixed(2) }
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-xs font-bold text-slate-400">{item.label}</span>
                            <span className="text-sm font-black font-mono">{item.value || "0.000"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
