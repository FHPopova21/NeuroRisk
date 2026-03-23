import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Users, Activity, AlertTriangle, CheckCircle, 
  ArrowUpRight, Clock, Shield
} from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getAdminStats();
        setStats(data);
      } catch (error) {
        toast.error("Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading stats...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500 mt-1">Global monitoring & administrative control</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
          <Shield className="w-4 h-4" />
          Admin Verified Session
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Doctors", value: stats.total_doctors, icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Total Patients", value: stats.total_patients, icon: Activity, color: "bg-emerald-50 text-emerald-600" },
          { label: "Active Sessions", value: stats.active_sessions, icon: CheckCircle, color: "bg-purple-50 text-purple-600" },
          { label: "High Risk Alerts", value: stats.high_risk_alerts, icon: AlertTriangle, color: "bg-rose-50 text-rose-600" },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                Live <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
            <p className="text-slate-500 text-sm mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">Analyses Over Time</h2>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-2 py-1 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-4">
            {stats.analyses_over_time.map((day: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.count / 20) * 100}%` }}
                  className="w-full bg-emerald-100 border-x border-t border-emerald-200 rounded-t-lg relative group cursor-pointer"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count}
                  </div>
                </motion.div>
                <span className="text-[10px] font-medium text-slate-400 transform -rotate-45 md:rotate-0">
                  {day.date.split('-').slice(1).join('/')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Recent Logs</h2>
            <ArrowUpRight className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-6">
            {stats.recent_activity.map((log: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.user_role === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-tight">{log.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${log.user_role === 'admin' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {log.user_role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
