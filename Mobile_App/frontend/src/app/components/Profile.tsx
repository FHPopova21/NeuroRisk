import {
  User,
  Stethoscope,
  Wifi,
  Activity,
  Shield,
  MessageSquare,
  CheckCircle2,
  Settings,
  LogOut,
  Mail,
  Phone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService, Patient } from "../services/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import clsx from "clsx";

export function Profile() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [latestNote, setLatestNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSignaling, setIsSignaling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, noteData] = await Promise.all([
          apiService.getMyProfile(),
          apiService.getLatestNote()
        ]);
        setPatient(profileData);
        setLatestNote(noteData);
      } catch (err) {
        toast.error("Грешка при зареждане на данните");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleReportProblem = async () => {
    if (window.confirm("Сигурни ли сте, че искате да сигнализирате за проблем? Лекарят ще получи известие веднага.")) {
      setIsSignaling(true);
      try {
        await apiService.signalDoctor("Пациентът сигнализира за технически или здравословен проблем през мобилното приложение.");
        toast.success("Сигналът е изпратен успешно!");
      } catch (err) {
        toast.error("Грешка при изпращане на сигнала");
      } finally {
        setIsSignaling(false);
      }
    }
  };

  const getLastSyncText = () => {
    if (!patient?.last_active) return "Няма данни за синхронизация";
    const lastActive = new Date(patient.last_active);
    const diffMs = new Date().getTime() - lastActive.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Току-що синхронизирано";
    if (diffMins < 60) return `Последна синхронизация: преди ${diffMins} мин`;
    return `Последна синхронизация: ${lastActive.toLocaleDateString()} ${lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#f8f9fa]">Зареждане...</div>;
  return (
    <div className="min-h-full bg-[#f8f9fa] pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Профил</h1>
        <p className="text-gray-500">Вашият здравен статус център</p>
      </div>

      {/* Patient Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mb-8 bg-[#030213] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{patient?.name || "Пациент"}</h2>
            <p className="text-gray-400 text-sm font-medium">ID: {patient?.patient_id || "#---"}</p>
          </div>
        </div>
      </motion.div>

      {/* Health Status Section */}
      <div className="px-6 mb-6">
        <h3 className="font-bold text-[#030213] mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#030213]" />
          Статус на мониторинг
        </h3>

        <div className="space-y-3">
          {/* Connection Status - Doctor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Лекар</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {patient?.doctor_name || "Д-р Билияна Бадалова"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{patient?.doctor_specialization || "Невролог"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-green-700">
                  Свързан
                </span>
              </div>
            </div>
          </motion.div>

          {/* Connection Status - Device */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Устройство</h4>
                  <p className="text-sm text-gray-600 mt-1">MindWave Mobile 2</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getLastSyncText()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                <Activity className="w-4 h-4 text-green-600 animate-pulse" />
                <span className="text-xs font-semibold text-green-700">
                  Активен
                </span>
              </div>
            </div>
          </motion.div>

          {/* Monitoring Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Мониторинг на активност
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Непрекъснато наблюдение
                </p>
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Рисков индекс</span>
                <span className="text-purple-700 font-semibold">{patient?.risk_score || 0}%</span>
              </div>
              <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${patient?.risk_score || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Статус: {patient?.status === "HIGH" ? "Висок" : patient?.status === "MEDIUM" ? "Среден" : "Нисък"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Doctor Interaction */}
      <div className="px-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          Последна комуникация
        </h3>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">
                  {latestNote ? (latestNote.doctor_name || "Вашият Лекар") : "Д-р Бадалова"}
                </h4>
                <span className="text-xs text-gray-500">
                  {latestNote ? new Date(latestNote.timestamp).toLocaleDateString() : "---"}
                </span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  {latestNote ? (
                    `"${latestNote.content.length > 150 ? latestNote.content.slice(0, 150) + "..." : latestNote.content}"`
                  ) : (
                    "Липсват нови клинични бележки."
                  )}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contact Info */}
      <div className="px-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Контактна информация</h3>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Имейл</p>
              <p className="text-sm font-medium text-gray-800">
                {patient?.email || "---"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Phone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Система</p>
              <p className="text-sm font-medium text-gray-800">
                NeuroRisk Mobile v1.0
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 space-y-3">
        <motion.button
          onClick={handleReportProblem}
          disabled={isSignaling}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={clsx(
            "w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all",
            isSignaling ? "opacity-50 cursor-not-allowed" : "hover:bg-amber-50 active:scale-[0.98]"
          )}
        >
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-amber-600" />
          </div>
          <span className="font-medium text-gray-800">Сигнализирай за проблем</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:bg-red-50 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <span className="font-medium text-red-600">Изход</span>
        </motion.button>
      </div>
    </div>
  );
}
