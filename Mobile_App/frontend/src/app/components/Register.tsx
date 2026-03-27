import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { Activity, Lock, User, Key, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";

export function Register() {
  const navigate = useNavigate();
  const { token: urlToken } = useParams();
  
  const [patientId, setPatientId] = useState("");
  const [token, setToken] = useState(urlToken || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Success

  useEffect(() => {
    if (urlToken) setToken(urlToken);
  }, [urlToken]);

  const handleActivatePath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !token || !password || !confirmPassword) {
      toast.error("Моля, попълнете всички полета");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Паролите не съвпадат");
      return;
    }

    setLoading(true);
    try {
      await apiService.activatePatient(token, password, confirmPassword);
      setStep(2);
      toast.success("Акаунтът е активиран успешно!");
    } catch (err: any) {
      toast.error(err.message || "Грешка при активация");
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="h-screen bg-[#030213] flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="size-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
            <CheckCircle2 className="size-10 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Готово!</h1>
          <p className="text-gray-400 mb-8 max-w-xs">
            Вашият акаунт вече е активен. Вече можете да влезете в мобилната платформа.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full max-w-xs bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all"
          >
            Към вход
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#030213] flex flex-col px-6 pt-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] size-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
      
      <button 
        onClick={() => navigate("/login")}
        className="size-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-white mb-8 relative z-10"
      >
        <ArrowLeft className="size-6" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Активация</h1>
          <p className="text-gray-400 mt-2">Настройте парола за достъп до NeuroRisk</p>
        </div>

        <form onSubmit={handleActivatePath} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Patient ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="size-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="напр. PN-XXXXX"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Активационен токен</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="size-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Въведете току-що получения код"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Нова парола</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="size-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 ml-1">Потвърдете парола</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="size-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : "Активирай профила"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
