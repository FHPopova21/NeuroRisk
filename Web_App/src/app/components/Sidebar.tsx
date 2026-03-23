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
  Settings
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  currentView: string;
  userRole: "admin" | "doctor" | "student";
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, onLogout }) => {
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 text-emerald-700">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <Brain className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight tracking-tight">NeuroRisk</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/60">Educational Platform</span>
        </div>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4 px-3">
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
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
              )}
            >
              <item.icon className={clsx("w-5 h-5 transition-colors", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500")} />
              {item.label}
            </Link>
          );
        })}

        {userRole === 'doctor' && (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-8 mb-4 px-3">
              Management
            </div>
            <Link
              to="/patients/add"
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                currentPath === "/patients/add"
                  ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
              )}
            >
              <PlusCircle className={clsx("w-5 h-5", currentPath === "/patients/add" ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500")} />
              Add Patient
            </Link>
          </>
        )}

        {userRole === 'admin' && (
          <>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-8 mb-4 px-3">
              Settings
            </div>
            <Link
              to="/admin/settings"
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                currentPath === "/admin/settings"
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              <Settings className={clsx("w-5 h-5", currentPath === "/admin/settings" ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} />
              System Settings
            </Link>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Link
          to="/profile"
          className={clsx(
            "flex items-center gap-3 p-2 rounded-xl mb-3 transition-colors",
            currentPath === "/profile" ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white/80"
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.name || user?.username || "Admin User"}
            </p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              {userRole === 'admin' ? "System Administrator" : (user?.specialization || "Medical Staff")}
            </p>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
