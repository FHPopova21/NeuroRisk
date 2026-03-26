import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      try {
        const loggedUser = await login(email, password);
        toast.success("Успешен вход");
        
        if (loggedUser.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } catch (error: any) {
        toast.error(error.message || "Неуспешен вход");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Моля, попълнете всички полета");
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-emerald-900/5 p-8 border border-emerald-100"
      >
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 hover:bg-emerald-200 transition-colors shadow-sm cursor-pointer hover:-translate-y-0.5">
            <Activity className="w-8 h-8 text-emerald-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Добре дошли отново</h1>
          <p className="text-slate-500 text-center mt-2">
            Влезте във вашия NeuroRisk клиничен панел
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Имейл или Потребителско име
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="имейл или потребителско име"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Парола
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900">Запомни ме</span>
            </label>
            <Link to="#" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Забравена парола?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Влизане..." : "Вход в системата"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Нямате акаунт?{" "}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">
              Регистрирайте се
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
