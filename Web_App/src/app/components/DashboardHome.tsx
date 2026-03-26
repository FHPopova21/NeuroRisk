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
  TrendingUp,
  HeartPulse,
  ArrowRight,
  Plus,
  FileText,
  Filter
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
  const [patientFilter, setPatientFilter] = useState<"ALL" | "ACTIVE" | "MANUAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [alertTab, setAlertTab] = useState<"CRITICAL" | "UNREAD" | "ALL">("CRITICAL");

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
      { label: "Общо пациенти", value: patients.length.toString(), icon: Users, color: "bg-emerald-100 text-emerald-700", trend: "На живо" },
      { label: "Активни приложения", value: patients.filter(p => p.is_active).length.toString(), icon: Smartphone, color: "bg-blue-100 text-blue-700", trend: "На живо" },
      { label: "Пациенти с висок риск", value: highRiskCount.toString(), icon: AlertCircle, color: "bg-orange-100 text-orange-700", trend: "На живо" },
      { label: "Общо записи", value: history.length.toString(), icon: Activity, color: "bg-purple-100 text-purple-700", trend: "На живо" },
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
      { name: "Висок риск", value: counts.HIGH, color: "#f97316" },
      { name: "Среден риск", value: counts.MEDIUM, color: "#f59e0b" },
      { name: "Нисък риск", value: counts.LOW, color: "#10b981" },
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

  const priorityPatients = useMemo(() => {
    return patients
      .map(p => {
        const pHistory = history.filter(h => h.patient_id === p.id)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const latest = pHistory[0];
        return {
          ...p,
          latestRecord: latest,
          risk: latest?.risk_score || 0,
          riskStatus: latest?.risk_status || p.status || "INACTIVE"
        };
      })
      .filter(p => p.riskStatus === "HIGH" || p.risk >= 40)
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5);
  }, [patients, history]);

  return (
    <div className="space-y-8">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Клинично табло</h1>
          <p className="text-slate-500 font-medium">{new Date().toLocaleDateString('bg-BG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center group">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Търсене по ID, име или статус..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none w-72 transition-all shadow-sm"
            />
          </div>
          <Link to="/alerts" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 relative">
            <Bell className="w-5 h-5 text-slate-600" />
            {highRiskAlerts.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </Link>
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

      {/* PRIORITY PATIENTS (HIGH RISK) */}
      {priorityPatients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" /> Приоритетни пациенти
            </h3>
            <span className="text-[10px] bg-red-100 text-red-600 font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Изисква незабавен преглед</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 snap-x hide-scrollbar">
            {priorityPatients.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())).map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="min-w-[280px] max-w-[280px] snap-start bg-gradient-to-br from-red-50 to-orange-50/30 p-5 rounded-[2rem] border border-red-100 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.15)] relative overflow-hidden group cursor-pointer"
                onClick={() => window.location.href = `/patients/${p.id}`}
              >
                {/* Background animated pulse */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-400 opacity-20 blur-3xl animate-pulse rounded-full" />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm border border-red-100 font-black uppercase text-xs">
                      {p.name.substring(0, 2)}
                    </div>
                    <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-md shadow-red-200">
                      {p.risk}% РИСК
                    </div>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm mb-1 truncate">{p.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-red-500/80 mb-4">
                    <span>ID: #{p.id.slice(0, 6)}</span>
                    <span className="w-1 h-1 bg-red-300 rounded-full" />
                    <span>{p.latestRecord ? new Date(p.latestRecord.timestamp).toLocaleTimeString() : 'Няма данни'}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-red-200/50">
                    <span className="text-[10px] font-black tracking-widest text-red-600 uppercase">Преглед на случай</span>
                    <ArrowRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* CHARTS SECTION */}
      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Разпределение на риска</h3>
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

        {/* AI INSIGHTS PANEL */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50/30 p-8 rounded-[2.5rem] border border-indigo-100 shadow-[0_4px_20px_-4px_rgba(99,102,241,0.1)] space-y-6 flex flex-col relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-400 opacity-10 blur-3xl rounded-full" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-indigo-950 uppercase tracking-widest text-xs">Изкуствен интелект</h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Автоматизиран анализ</p>
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <p className="text-sm font-medium text-slate-700 leading-relaxed italic border-l-2 border-indigo-300 pl-4 bg-white/50 py-3 rounded-r-xl">
              "Системата отчита общ <span className="text-indigo-600 font-bold">14% спад</span> в средната епилептиформена активност при наблюдаваните пациенти тази седмица."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-[92%]" />
              </div>
              <span className="text-xs font-black text-indigo-600">92%</span>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 text-right">Ниво на сигурност</p>
          </div>
          <div className="pt-4 border-t border-indigo-200/50 relative z-10">
            <button className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white text-indigo-600 font-black text-xs uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-shadow">
              Преглед на аналитичен доклад
            </button>
          </div>
        </motion.div>
      </div>

      {/* LIVE MONITORING STRIP */}
      <div className="w-full bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl overflow-hidden relative group cursor-pointer transition-transform hover:scale-[1.01]">
        <div className="absolute inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-20 flex flex-col p-4 justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Трансмисия на живо</span>
          </div>
          <h4 className="font-black text-white text-sm">Stefan Zhelyazkov</h4>
        </div>
        {/* Animated wave mock */}
        <div className="h-24 w-full pl-64 relative overflow-hidden flex items-center">
          <svg
            className="absolute h-16 w-[200%] text-emerald-500/50 stroke-current animate-[slide_10s_linear_infinite]"
            style={{ strokeWidth: 1.5, fill: 'none', strokeLinecap: 'round' }}
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path d="M0,50 Q25,20 50,50 T100,50 Q125,80 150,50 T200,50 Q225,20 250,50 T300,50 Q325,80 350,50 T400,50 Q425,20 450,50 T500,50 Q525,80 550,50 T600,50 Q625,20 650,50 T700,50 Q725,80 750,50 T800,50 Q825,20 850,50 T900,50 Q925,80 950,50 T1000,50" />
          </svg>
          <svg
            className="absolute h-16 w-[200%] text-emerald-500/30 stroke-current animate-[slide_8s_linear_infinite]"
            style={{ strokeWidth: 1, fill: 'none', strokeLinecap: 'round', animationDelay: '-4s' }}
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path d="M0,50 Q40,10 80,50 T160,50 Q200,90 240,50 T320,50 Q360,10 400,50 T480,50 Q520,90 560,50 T640,50 Q680,10 720,50 T800,50 Q840,90 880,50 T960,50 Q1000,10 1040,50" />
          </svg>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* RECENT ANALYSES TABLE */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs min-w-max">Списък с пациенти</h3>
            {/* PATIENT STATUS TABS */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto hide-scrollbar">
              {(["ALL", "ACTIVE", "MANUAL"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setPatientFilter(tab)}
                  className={clsx(
                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    patientFilter === tab
                      ? "bg-white text-emerald-700 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab === "ALL" ? "Всички пациенти" : tab === "ACTIVE" ? "Приложение" : "Ръчни записи"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Пациент</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ниво на риск</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Време</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Статус</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentAnalyses.filter(analysis => {
                   const pInfo = patients.find(p => p.id === analysis.patient_id);
                   const matchesFilter = patientFilter === "ALL"
                     ? true
                     : patientFilter === "ACTIVE"
                       ? pInfo?.is_active
                       : !pInfo?.is_active;

                   const queryStr = searchQuery.toLowerCase();
                   const matchesSearch = queryStr === ""
                     ? true
                     : (analysis.patient_name?.toLowerCase().includes(queryStr) ||
                        analysis.patient_id.toLowerCase().includes(queryStr) ||
                        analysis.risk_status.toLowerCase().includes(queryStr));

                   return matchesFilter && matchesSearch;
                }).map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-50/50 transition-colors group relative">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">{analysis.patient_name || analysis.patient_id}</span>
                      </div>

                      {/* PATIENT DETAIL PREVIEW (HOVER) */}
                      <div className="hidden group-hover:block absolute left-48 top-4 z-50 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Скорошен контекст</span>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-slate-50 p-2 rounded-lg text-xs italic text-slate-600 font-medium">
                            {analysis.doctor_note ? `"${analysis.doctor_note.substring(0, 60)}..."` : "Няма скорошни лекарски бележки."}
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Последен риск: <span className="text-slate-700">{analysis.risk_score}%</span></span>
                            <span className={clsx("px-1.5 py-0.5 rounded", analysis.risk_status === "HIGH" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>{analysis.risk_status}</span>
                          </div>
                        </div>
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
                        <span className="text-sm font-bold text-slate-700">{analysis.risk_status === "HIGH" ? "Спешен преглед" : "Здрав"}</span>
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
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-full lg:col-span-1">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="flex gap-1 bg-slate-50 p-1 rounded-xl w-full justify-between">
               {(["CRITICAL", "UNREAD", "ALL"] as const).map(tab => (
                 <button
                   key={tab}
                   onClick={() => setAlertTab(tab)}
                   className={clsx(
                     "px-3 py-2 text-[9px] font-black flex-1 uppercase tracking-widest rounded-lg transition-all",
                     alertTab === tab
                       ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                       : "text-slate-400 hover:text-slate-600"
                   )}
                 >
                   {tab === "CRITICAL" ? "КРИТИЧНИ" : tab === "UNREAD" ? "НЕПРОЧЕТЕНИ" : "ВСИЧКИ"}
                 </button>
               ))}
            </div>
          </div>
          <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[500px]">
            {alerts
              .filter(a => alertTab === "CRITICAL" ? a.risk_score > 75 : alertTab === "UNREAD" ? !a.is_read : true)
              .slice(0, 5)
              .map((alert) => (
              <div key={alert.id} className={clsx("relative pl-5 border-l-2 py-1", alert.risk_score > 75 ? "border-orange-500" : alert.risk_score > 40 ? "border-amber-400" : "border-emerald-400")}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black text-slate-900 truncate pr-2">{alert.patient_name || alert.patient_id.slice(0,8)}</h4>
                  <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2 leading-relaxed line-clamp-2">{alert.message}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={clsx("text-[9px] font-black px-2 py-0.5 rounded-md", alert.risk_score > 75 ? "text-orange-700 bg-orange-50" : alert.risk_score > 40 ? "text-amber-700 bg-amber-50" : "text-emerald-700 bg-emerald-50")}>
                    {alert.risk_score}% Ниво на риск
                  </span>
                  <Link to={`/patients/${alert.patient_id}`} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">Преглед на случай</Link>
                </div>
              </div>
            ))}

            <div className="bg-slate-50 rounded-2xl p-6 mt-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Системен статус</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Всички системи функционират</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Моделите за изкуствен интелект обработват данни от {activePatientsCount} активни монитора.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
