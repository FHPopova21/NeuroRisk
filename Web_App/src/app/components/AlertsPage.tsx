import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Search, 
  ChevronRight, 
  MoreVertical, 
  AlertCircle, 
  Clock, 
  Activity,
  ArrowRight,
  User,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { clsx } from "clsx";
import { motion } from "motion/react";
import { Link } from "react-router";
import { apiService } from "../services/api";
import { useAuth } from "../context/AuthContext";


export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const data = isAdmin
          ? await apiService.getAdminAlerts()
          : await apiService.getAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("Failed to load alerts", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [isAdmin]);

  const handleDismiss = async (alertId: string) => {
    try {
      await apiService.dismissAlert(alertId);
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success("Alert dismissed securely.");
    } catch (error) {
      toast.error("Failed to dismiss alert.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-2xl border border-orange-200 text-orange-600 shadow-lg shadow-orange-100">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {isAdmin ? "Global System Alerts" : "Critical Alerts"}
            </h1>
            <p className="text-slate-500 font-medium tracking-tight">
              {isAdmin 
                ? "Monitoring all clinical warnings across the entire system network." 
                : "Real-time clinical warnings detected by the AI analysis system."}
            </p>
          </div>
        </div>
        <button className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors">
          Clear All Notifications
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter alerts by patient or condition..." 
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
        />
      </div>

      {/* ALERT LIST */}
      <div className="space-y-4">
        {alerts.filter(alert => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            (alert.patient_name || "").toLowerCase().includes(query) ||
            (alert.message || "").toLowerCase().includes(query) ||
            (alert.risk_status || "").toLowerCase().includes(query)
          );
        }).map((alert, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group hover:border-orange-200 transition-all"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 border-2 border-white shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                 <User className="w-8 h-8 text-slate-300" />
              </div>
              <div className="px-3 py-1 bg-orange-50 rounded-xl border border-orange-100">
                <span className="text-xs font-black text-orange-600 uppercase tracking-widest">{alert.risk_score}% Risk</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Patient: {alert.patient_name || alert.patient_id}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {alert.message}
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Link 
                  to={`/patients/${alert.patient_id}`}
                  className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2"
                >
                  View Patient Analysis <ArrowRight className="w-3 h-3" />
                </Link>
                <button 
                  onClick={() => handleDismiss(alert.id)}
                  className="px-6 py-3 bg-white text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-100 hover:bg-slate-50 transition-all"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-center justify-center p-6 bg-orange-50/30 rounded-[2rem] border border-orange-100/50">
               <AlertCircle className="w-8 h-8 text-orange-500 mb-2 opacity-40" />
               <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.15em] text-center">Urgent<br/>Review</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200 text-center">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">No more alerts for today</p>
        <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">View Alert History Archive</button>
      </div>
    </div>
  );
};
