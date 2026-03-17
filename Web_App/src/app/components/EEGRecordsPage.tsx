import React, { useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Calendar, 
  Brain,
  Download,
  FilterIcon
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { Link } from "react-router";

const initialRecords = [
  { id: 1, patient: "Sarah Jenkins", date: "Mar 17, 2026", time: "10:24 AM", risk: 92, status: "Critical", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: 2, patient: "Robert Wilson", date: "Mar 17, 2026", time: "09:15 AM", risk: 12, status: "Normal", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { id: 3, patient: "Emily Davis", date: "Mar 16, 2026", time: "04:30 PM", risk: 88, status: "Critical", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { id: 4, patient: "Maria Garcia", date: "Mar 16, 2026", time: "02:45 PM", risk: 45, status: "Elevated", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { id: 5, patient: "James Miller", date: "Mar 15, 2026", time: "11:00 AM", risk: 8, status: "Normal", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { id: 6, patient: "Michael Thompson", date: "Mar 14, 2026", time: "08:30 AM", risk: 15, status: "Normal", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
  { id: 7, patient: "Linda Moore", date: "Mar 13, 2026", time: "01:20 PM", risk: 52, status: "Elevated", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop" },
  { id: 8, patient: "William Taylor", date: "Mar 12, 2026", time: "10:00 AM", risk: 10, status: "Normal", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop" },
];

export const EEGRecordsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const filteredRecords = initialRecords.filter(r => {
    const matchesSearch = r.patient.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "All" || 
      (riskFilter === "Critical" && r.risk > 75) ||
      (riskFilter === "Elevated" && r.risk > 40 && r.risk <= 75) ||
      (riskFilter === "Normal" && r.risk <= 40);
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">EEG Records</h1>
          <p className="text-slate-500 font-medium tracking-tight">Access historical EEG data and AI analysis results for all patients.</p>
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
            placeholder="Search by patient name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-colors">
          <Calendar className="w-4 h-4" />
          Date Range
        </button>
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
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                        <img src={record.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 block">{record.patient}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-slate-900 block">{record.date}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{record.time}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={clsx(
                            "h-full rounded-full transition-all",
                            record.risk > 75 ? "bg-orange-500" : record.risk > 40 ? "bg-amber-500" : "bg-emerald-500"
                          )}
                          style={{ width: `${record.risk}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-slate-700">{record.risk}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={clsx(
                      "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border",
                      record.status === "Critical" ? "bg-orange-50 text-orange-600 border-orange-100" :
                      record.status === "Elevated" ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-emerald-50 text-emerald-600 border-emerald-100"
                    )}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        to={`/patients/${record.id}`}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all rounded-xl border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100"
                      >
                        <Activity className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
