import React from "react";
import { 
  Users, 
  Smartphone, 
  AlertCircle, 
  Activity, 
  Search, 
  Bell, 
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  User,
  Shield,
  TrendingUp
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { Link } from "react-router";
import { apiService, Patient, EEGRecord } from "../services/api";
import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";

export const DashboardHome: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [history, setHistory] = useState<EEGRecord[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getPatients(),
      apiService.getEEGHistory(""),
      apiService.getAlerts()
    ]).then(([p, h, a]) => {
      setPatients(p);
      setHistory(h);
      setAlerts(a);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    // Determine each patient's current risk by looking at their latest EEG record
    const patientLatestStatus = patients.map(p => {
      const patientHistory = history.filter(h => h.patient_id === p.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return patientHistory[0]?.risk_status || p.status || "INACTIVE";
    });

    const highRiskCount = patientLatestStatus.filter(s => s === "HIGH").length;

    return [
      { label: "Total Patients", value: patients.length.toString(), icon: Users, color: "bg-emerald-100 text-emerald-700", trend: "Live" },
      { label: "Patients with App", value: patients.filter(p => p.is_active).length.toString(), icon: Smartphone, color: "bg-blue-100 text-blue-700", trend: "Live" },
      { label: "High Risk Patients", value: highRiskCount.toString(), icon: AlertCircle, color: "bg-orange-100 text-orange-700", trend: "Live" },
      { label: "Total Recordings", value: history.length.toString(), icon: Activity, color: "bg-purple-100 text-purple-700", trend: "Live" },
    ];
  }, [patients, history]);

  const recentAnalyses = useMemo(() => history.slice(0, 5), [history]);
  const highRiskAlerts = useMemo(() => alerts.slice(0, 3), [alerts]);

  const riskData = useMemo(() => {
    const patientLatestStatus = patients.map(p => {
      const patientHistory = history.filter(h => h.patient_id === p.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return patientHistory[0]?.risk_status || p.status || "INACTIVE";
    });

    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, INACTIVE: 0 };
    patientLatestStatus.forEach(status => {
      if (status === "HIGH") counts.HIGH++;
      else if (status === "MEDIUM") counts.MEDIUM++;
      else if (status === "LOW") counts.LOW++;
      else counts.INACTIVE++;
    });

    return [
      { name: "High Risk", value: counts.HIGH, color: "#f97316" },
      { name: "Medium Risk", value: counts.MEDIUM, color: "#f59e0b" },
      { name: "Low Risk", value: counts.LOW, color: "#10b981" },
    ];
  }, [patients, history]);

  const activityData = useMemo(() => {
    // Group records by day for the last 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return days.map(day => ({
      name: new Date(day).toLocaleDateString(undefined, { weekday: 'short' }),
      count: history.filter(r => {
        const rDay = new Date(r.timestamp).toISOString().split('T')[0];
        return rDay === day;
      }).length
    }));
  }, [history]);

  const activePatientsCount = useMemo(() => patients.filter(p => p.is_active).length, [patients]);

  return (
    <div className="space-y-8">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Clinical Dashboard</h1>
          <p className="text-slate-500 font-medium">{new Date().toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-64 transition-all"
            />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 relative">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
          </button>
          <Link to="/profile" className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center border border-emerald-200 shadow-sm overflow-hidden">
             <User className="w-6 h-6 text-emerald-600" />
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={clsx("p-3 rounded-2xl", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={clsx(
                "text-xs font-bold px-2 py-1 rounded-lg",
                stat.trend.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
              )}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Patient Risk Distribution</h3>
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Weekly Activity Trends</h3>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* RECENT ANALYSES TABLE */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Recent EEG Analyses</h3>
            <button className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Risk Level</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Time</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{analysis.patient_name || analysis.patient_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border",
                        analysis.risk_status === "HIGH" ? "bg-orange-50 text-orange-600 border-orange-100" :
                        analysis.risk_status === "MEDIUM" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {analysis.risk_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{new Date(analysis.timestamp).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={clsx(
                          "w-1.5 h-1.5 rounded-full",
                          analysis.risk_status === "HIGH" ? "bg-orange-500 animate-pulse" : "bg-emerald-500"
                        )} />
                        <span className="text-sm font-bold text-slate-700">{analysis.risk_status === "HIGH" ? "Urgent Review" : "Healthy"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/patients/${analysis.patient_id}`} className="p-1.5 text-slate-300 hover:text-emerald-600 transition-colors block">
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ALERTS PANEL */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Critical Alerts</h3>
            <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">{highRiskAlerts.length} NEW</span>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {highRiskAlerts.map((alert) => (
              <div key={alert.id} className="relative pl-6 border-l-2 border-orange-500 py-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black text-slate-900">{alert.patient_name || alert.patient_id}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">{alert.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">{alert.risk_score}% Risk Score</span>
                  <Link to={`/patients/${alert.patient_id}`} className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline">View Case</Link>
                </div>
              </div>
            ))}
            
            <div className="bg-slate-50 rounded-2xl p-6 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">System Status</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">All Systems Operational</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">AI analysis models are processing data from {activePatientsCount} active patient monitors.</p>
            </div>
          </div>
          <div className="p-4 border-t border-slate-50">
            <button className="w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-colors">
              Go to Alerts Center
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
