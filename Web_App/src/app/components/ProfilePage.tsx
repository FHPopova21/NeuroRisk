import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Settings,
  LogOut,
  Key,
  Bell,
  Globe,
  HelpCircle,
  Stethoscope,
  ChevronRight,
  Plus
} from "lucide-react";
import { clsx } from "clsx";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patientCount, setPatientCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (user?.role === 'doctor' && user.id) {
        try {
          const patients = await apiService.getPatients(user.id);
          setPatientCount(patients.length);
        } catch (error) {
          console.error("Failed to fetch patient count", error);
        }
      }
    };
    fetchStats();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {user?.role === 'admin' ? "Admin Profile" : "Doctor Profile"}
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your professional identity and security settings.</p>
        </div>
        <Link
          to="/settings"
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
        >
          <Settings className="w-5 h-5" />
          General Settings
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: IDENTITY */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-slate-50 shadow-xl overflow-hidden bg-emerald-100">
                <img src="https://images.unsplash.com/photo-1645066928295-2506defde470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkb2N0b3IlMjBhdmF0YXIlMjBwb3J0cmFpdHxlbnwxfHx8fDE3Njk3NTg1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Doctor" className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all border-4 border-white">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-black text-slate-900">{user?.name || user?.username}</h2>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">
              {user?.role === 'admin' ? "System Administrator" : (user?.specialization || "Medical Staff")}
            </p>

            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100/50">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {user?.role === 'admin' ? "Root Access" : "Verified Instructor"}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6">
              {user?.role === 'admin' ? "System Analytics" : "Clinical Stats"}
            </h3>
            <div className="space-y-6">
              {user?.role === 'doctor' ? (
                <>
                  <StatRow label="Active Patients" value={patientCount !== null ? patientCount.toString() : "..."} />
                  <StatRow label="Monthly Analyses" value="12" />
                  <StatRow label="Student Reviews" value="5" />
                </>
              ) : (
                <>
                  <StatRow label="Total Users" value="24" />
                  <StatRow label="Active Today" value="8" />
                  <StatRow label="System Health" value="100%" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INFO & SETTINGS */}
        <div className="md:col-span-2 space-y-8">
          {/* PERSONAL INFO */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Information</h3>
            <div className="grid grid-cols-2 gap-8">
              <ProfileItem label="Display Name" value={user?.name || user?.username} icon={User} />
              <ProfileItem label="Email Address" value={user?.email || "No email provided"} icon={Mail} />
              {user?.role === 'doctor' && (
                <>
                  <ProfileItem label="Admin ID" value={user?.admin_assigned_id || "N/A"} icon={Stethoscope} />
                  <ProfileItem label="Specialization" value={user?.specialization || "Not specified"} icon={Globe} />
                </>
              )}
            </div>
          </div>

          {/* SECURITY & PREFERENCES */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Security</h3>
            </div>
            <div className="divide-y divide-slate-50">
              <SecurityAction label="Change Account Password" icon={Key} />
              <SecurityAction label="Configure Notifications" icon={Bell} />
              <SecurityAction label="Help & Support Center" icon={HelpCircle} />
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-8 hover:bg-red-50/30 transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Sign Out of Platform</h4>
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">End Session Now</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-red-300 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{label}</label>
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-emerald-600" />
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  </div>
);

const StatRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <span className="text-lg font-black text-emerald-400">{value}</span>
  </div>
);

const SecurityAction = ({ label, icon: Icon }: { label: string, icon: any }) => (
  <button className="w-full flex items-center justify-between p-8 hover:bg-slate-50 transition-all text-left group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-black text-slate-900">{label}</h4>
    </div>
    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-emerald-300 transition-colors" />
  </button>
);
