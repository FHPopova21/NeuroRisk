import { Activity, Wifi, Heart, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { apiService, Patient } from "../services/api";
import { toast } from "sonner";

export function Home() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getMyProfile()
      .then(setPatient)
      .catch(() => toast.error("Грешка при зареждане на профила"))
      .finally(() => setLoading(false));

    // Send initial heartbeat
    apiService.sendHeartbeat({ status: "online" });
  }, []);

  const handleSignalDoctor = async () => {
    try {
      await apiService.signalDoctor("Спешна помощ - сигнал от пациента");
      toast.success("Сигналът е изпратен успешно до Вашия лекар");
    } catch (err) {
      toast.error("Неуспешно изпращане на сигнал");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Зареждане...</div>;


  return (
    <div className="min-h-full bg-[#f8f9fa] p-6 pb-24">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-3xl font-bold text-[#030213] mb-2 tracking-tight">
          Здравейте, {patient?.name || "Пациент"}
        </h1>
        <p className="text-gray-500 font-medium">Вашата връзка е активна.</p>
      </div>

      {/* Main Status Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#030213] rounded-[2rem] p-8 mb-8 text-white shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {patient?.status === "HIGH" ? "Висок риск" : patient?.status === "MEDIUM" ? "Повишен риск" : "Нисък риск"}
            </h2>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Системата е активна</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-white text-sm">
            Системата отчита обична спав в средната епилептиформена активнос
            при наблюдаваните пациенти тази седмица.
          </p>
        </div>
      </motion.div>

      {/* Status Cards */}
      <div className="space-y-3 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              Статус на синхронизация
            </h3>
            <p className="text-sm text-green-600">Предаване на живо</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Wifi className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Устройство</h3>
            <p className="text-sm text-gray-500">Канал-02 • Активен</p>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-1">22</h4>
          <p className="text-sm text-gray-500">Общо записи</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Activity className="w-5 h-5 text-orange-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-1">5</h4>
          <p className="text-sm text-gray-500">Пациенти с висок риск</p>
        </motion.div>
      </div>

      {/* Signal Doctor Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSignalDoctor}
        className="w-full bg-white text-[#d4183d] py-5 rounded-2xl font-bold border border-[#d4183d]/10 mb-4 flex items-center justify-center gap-2 shadow-sm"
      >
        <AlertTriangle className="w-5 h-5" />
        Сигнализирай на лекар
      </motion.button>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/app/monitoring")}
        className="w-full bg-[#030213] text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
      >
        <Activity className="w-6 h-6" />
        Започнете мониторинг
      </motion.button>
    </div>
  );
}