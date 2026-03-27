import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Activity, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !password) {
      toast.error("Моля, попълнете всички полета");
      return;
    }

    setLoading(true);
    try {
      await apiService.login(patientId, password);
      toast.success("Успешен вход!");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Грешка при влизане");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#030213] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] size-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] size-64 bg-cyan-500/10 blur-[100px] rounded-full"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="size-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center mb-4 shadow-2xl">
            <Activity className="size-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">NeuroRisk</h1>
          <p className="text-gray-400 font-medium mt-1">Вход за пациенти</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Пациентско ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="size-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="напр. P-001"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Парола</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="size-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Влизане"
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400 leading-relaxed">
            Ако нямате ID или парола, моля свържете се с Вашия лекуващ лекар за активация на Вашия профил.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
