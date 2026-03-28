import { Activity, Wifi, Heart, Shield, Calendar } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { apiService, Patient } from "../services/api";
import { toast } from "sonner";

export function Home() {
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<{ name: string; connected: boolean }>({ name: "Няма свързано устройство", connected: false });
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    apiService.getMyProfile()
      .then(setPatient)
      .catch(() => toast.error("Грешка при зареждане на профила"))
      .finally(() => setLoading(false));

    // Send initial heartbeat
    apiService.sendHeartbeat({ status: "online" });
  }, []);

  const handleConnectDevice = async () => {
    setConnecting(true);
    try {
      console.log("Starting Bluetooth scan for MindWave...");
      
      // MindWave Mobile 2 често използва стандартни UUID-та или специфични за профила
      // Насочваме се към търсене по име за по-голяма съвместимост с MindWave
      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: 'MindWave' },
          { namePrefix: 'Mindwave' },
          { name: 'MindWave Mobile' }
        ],
        optionalServices: ['00001101-0000-1000-8000-00805f9b34fb'] // Стандартен Serial Port Profile
      });

      console.log("Device found:", bluetoothDevice.name);
      setDevice({ name: bluetoothDevice.name || "MindWave Mobile 2", connected: true });
      toast.success(`Свързано с ${bluetoothDevice.name}`);
      
    } catch (err: any) {
      console.error("Bluetooth error:", err);
      if (err.name === 'NotFoundError') {
        toast.error("MindWave не беше намерен. Уверете се, че е в режим на сдвояване.");
      } else {
        toast.error("Грешка при Bluetooth връзката");
      }
    } finally {
      setConnecting(false);
    }
  };

  const handleSignalDoctor = async () => {
    try {
      await apiService.signalDoctor("Спешна помощ - сигнал от пациента");
      toast.success("Сигналът е изпратен успешно до Вашия лекар");
    } catch (err) {
      toast.error("Неуспешно изпращане на сигнал");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-[#030213] font-bold">Зареждане...</div>;


  return (
    <div className="min-h-full bg-[#f8f9fa] p-6 pb-24 relative">

      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-3xl font-bold text-[#030213] mb-2 tracking-tight">
          Здравейте, {patient?.name || "..."}
        </h1>
        <p className="text-gray-500 font-medium">Вашата система е в готовност.</p>
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
              {patient?.risk_score !== undefined
                ? (patient.risk_score > 70 ? "Висок риск" : patient.risk_score > 30 ? "Повишен риск" : "Нисък риск")
                : "Нисък риск"}
            </h2>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
              {patient?.risk_score !== undefined ? `Рисков индекс: ${patient.risk_score}%` : "Системата е активна"}
            </p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <p className="text-white text-sm">
            {patient?.risk_score !== undefined && patient.risk_score > 70
              ? "Системата отчита критични отклонения. Моля, свържете се с Вашия лекар при първа възможност."
              : patient?.risk_score !== undefined && patient.risk_score > 30
                ? "Отчетени са леки промени в активността. Продължавайте мониторинга според указанията."
                : "Вашето състояние е стабилно. Системата работи нормално."}
          </p>
        </div>
      </motion.div>

      {/* Status Cards */}
      <div className="space-y-3 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">
              Статус на синхронизация
            </h3>
            <p className="text-sm text-green-600 font-medium">Предаване на живо</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={handleConnectDevice}
          className={`bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 border transition-all cursor-pointer active:scale-95 ${device.connected ? 'border-blue-200 bg-blue-50/20' : 'border-gray-100'}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${device.connected ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <Wifi className={`w-6 h-6 ${device.connected ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">ЕЕГ Сензор</h3>
            <p className={`text-sm font-medium ${device.connected ? 'text-blue-600' : 'text-gray-500'}`}>
              {connecting ? "Свързване..." : device.name}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Heart className="w-5 h-5 text-purple-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-1">
            {patient?.total_records || 0}
          </h4>
          <p className="text-sm text-gray-500 font-medium">Направени анализи</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <h4 className="text-2xl font-bold text-gray-800 mb-1">
            {patient?.risk_score !== undefined
              ? (patient.risk_score > 70 ? "Висок" : patient.risk_score > 30 ? "Среден" : "Нисък")
              : (patient?.status === "HIGH" ? "Висок" : patient?.status === "MEDIUM" ? "Среден" : "Нисък")}
          </h4>
          <p className="text-sm text-gray-500 font-medium">Ниво на риск</p>
        </motion.div>
      </div>

      {/* Signal Doctor Link (Secondary) */}
      <div className="mb-4 text-center">
        <button
          onClick={handleSignalDoctor}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto font-medium"
        >
          <Calendar className="w-4 h-4" />
          Нуждаете се от консултация? Сигнализирайте лекар
        </button>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!device.connected) {
            toast.error("Моля, първо свържете ЕЕГ сензор!");
            return;
          }
          navigate("/app/monitoring");
        }}
        className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${device.connected ? 'bg-[#030213] text-white' : 'bg-gray-200 text-gray-400 opacity-80 cursor-not-allowed'}`}
      >
        <Activity className="w-6 h-6" />
        {device.connected ? "Започнете мониторинг" : "Свържете сензор"}
      </motion.button>
    </div>
  );
}