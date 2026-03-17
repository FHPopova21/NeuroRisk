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
  Brain
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarProps {
  currentView: string;
  userRole: "student" | "doctor";
  onChangeView: (view: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "patients", label: "Patients", icon: Users, path: "/patients" },
    { id: "eeg-records", label: "EEG Records", icon: Activity, path: "/eeg-records" },
    { id: "alerts", label: "Alerts", icon: Bell, path: "/alerts" },
    { id: "notes", label: "Medical Notes", icon: FileEdit, path: "/notes" },
  ];

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
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <Link 
          to="/profile"
          className={clsx(
            "flex items-center gap-3 p-2 rounded-xl mb-3 transition-colors",
            currentPath === "/profile" ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white/80"
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden border border-emerald-200 shadow-sm">
             <img src="https://images.unsplash.com/photo-1645066928295-2506defde470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkb2N0b3IlMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk3NTg1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              Dr. Alex Silva
            </p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Lead Neurologist
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
