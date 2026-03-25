import React from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Activity,
  Bell,
  FileEdit,
  User,
  LogOut,
  PlusCircle,
  Brain,
  ShieldCheck,
  History,
  Settings,
  X
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  currentView: string;
  userRole: "admin" | "doctor" | "student";
  isOpen: boolean;
  onChangeView: (view: string) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, onLogout, onClose }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuth();

  const doctorMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "patients", label: "Patients", icon: Users, path: "/patients" },
    { id: "eeg-records", label: "EEG Records", icon: Activity, path: "/eeg-records" },
    { id: "alerts", label: "Alerts", icon: Bell, path: "/alerts" },
    { id: "notes", label: "Medical Notes", icon: FileEdit, path: "/notes" },
  ];

  const adminMenuItems = [
    { id: "admin-dashboard", label: "System Overview", icon: LayoutDashboard, path: "/admin/dashboard" },
    { id: "manage-doctors", label: "Doctors Management", icon: ShieldCheck, path: "/admin/doctors" },
    { id: "monitor-patients", label: "Patients Monitor", icon: Users, path: "/admin/patients" },
    { id: "monitor-alerts", label: "Global Alerts", icon: Bell, path: "/admin/alerts" },
    { id: "activity-logs", label: "Activity Logs", icon: History, path: "/admin/logs" },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : doctorMenuItems;

  return (
    <>
      <aside className={clsx(
        "bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-3 text-emerald-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
              <Brain className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-white">NeuroRisk</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">EEG Risk Monitoring</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white p-2 -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4 px-3">
          Clinical Menu
        </div>
        {menuItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== "/dashboard" && currentPath.startsWith(item.path));
          return (
            <Link
              key={item.id}
              to={item.path}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                isActive
                  ? "bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
              {item.label}
            </Link>
          );
        })}

        {userRole === 'doctor' && (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-8 mb-4 px-3">
              Management
            </div>
            <Link
              to="/patients/add"
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                currentPath === "/patients/add"
                  ? "bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <PlusCircle className={clsx("w-5 h-5", currentPath === "/patients/add" ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300")} />
              Add Patient
            </Link>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-8 mb-4 px-3">
              Settings
            </div>
            <Link
              to="/admin/settings"
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                currentPath === "/admin/settings"
                  ? "bg-blue-500/10 text-blue-400 shadow-sm border border-blue-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <Settings className={clsx("w-5 h-5", currentPath === "/admin/settings" ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
              System Settings
            </Link>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <Link
          to="/profile"
          className={clsx(
            "flex items-center gap-3 p-2 rounded-xl mb-3 transition-colors",
            currentPath === "/profile" ? "bg-slate-800 shadow-sm ring-1 ring-slate-700" : "hover:bg-slate-800/80"
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">
              {user?.name || user?.username || "Admin User"}
            </p>
            <p className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider">
              {userRole === 'admin' ? "System Administrator" : (user?.specialization || "Medical Staff")}
            </p>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 text-sm font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
      </aside>
    </>
  );
};
