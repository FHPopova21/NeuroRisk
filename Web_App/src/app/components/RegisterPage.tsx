import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Mail, Lock, User, Hash, Stethoscope, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { apiService } from "../services/api";

export const RegisterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'doctor' | 'patient'>('doctor');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    admin_assigned_id: "",
    specialization: "",
    patient_id: "" // За пациентите
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error("Паролите не съвпадат");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'doctor') {
        await apiService.registerDoctor(formData);
        toast.success("Успешна регистрация на лекар! Вече можете да влезете.");
      } else {
        // Използваме /activate, който не изисква имеил/парола за вход предварително
        await apiService.activatePatient(formData.patient_id, formData.password);
        toast.success("Вашият профил е активиран успешно! Можете да влезете.");
      }
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Неуспешна регистрация");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-emerald-900/5 p-8 border border-emerald-100"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 hover:bg-emerald-200 transition-colors shadow-sm cursor-pointer hover:-translate-y-0.5">
            <Activity className="w-8 h-8 text-emerald-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {activeTab === 'doctor' ? "Регистрация на лекар" : "Активация на пациент"}
          </h1>
          
          {/* Tab Switcher */}
          <div className="flex w-full bg-slate-100 p-1 rounded-xl mt-6">
            <button 
              onClick={() => setActiveTab('doctor')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'doctor' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Лекар
            </button>
            <button 
              onClick={() => setActiveTab('patient')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'patient' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Пациент
            </button>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {activeTab === 'doctor' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Име и фамилия</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Д-р Иван Иванов" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Имейл адрес</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="doctor@neurorisk.edu" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Служебен ID</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="admin_assigned_id" type="text" value={formData.admin_assigned_id} onChange={handleChange} placeholder="ID-123" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Специализация</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="specialization" type="text" value={formData.specialization} onChange={handleChange} placeholder="Неврология" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Пациентски ID</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    name="patient_id" 
                    type="text" 
                    value={formData.patient_id} 
                    onChange={handleChange} 
                    placeholder="напр. LAC-010216" 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" 
                    required 
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Въведете идентификатора, предоставен от Вашия лекар.</p>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Парола</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Потвърждение</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} placeholder="••••••••" className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all" required />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 mt-4"
          >
            {loading ? "Обработка..." : (activeTab === 'doctor' ? "Регистрирайте се" : "Активирай профил")}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Вече имате акаунт?{" "}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
              Вход
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
