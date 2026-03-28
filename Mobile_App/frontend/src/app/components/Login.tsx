import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Activity, Lock, User, AlertCircle, Loader2, Mail } from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // For patients, we allow empty password if they provide their ID
    if (!email) {
      toast.error("Моля, попълнете полето за идентификация");
      return;
    }

    setLoading(true);
    try {
      // If it looks like a patient ID (e.g., contains a dash or prefix), 
      // we can try logging in with it even if password is empty.
      // But we just send what we have to the backend.
      const result = await apiService.login(email, password || email);
      
      toast.success("Успешен вход");
      navigate("/app");
    } catch (err: any) {
      toast.error(err.message || "Неуспешен вход. Проверете данните си.");
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
          <p className="text-gray-400 font-medium mt-1">Платформата е напълно готова.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">
              Имейл или Пациентски ID
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="напр. LAC-010216"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">
              Парола (оставете празно за вход с ID)
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (незадължително)"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-gray-600 font-medium"
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
