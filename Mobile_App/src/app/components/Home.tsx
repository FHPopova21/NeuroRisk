import { Activity, Wifi, Heart } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gradient-to-b from-green-50 to-white p-6">
      {/* Header */}
      <div className="mb-8 pt-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Здравейте, Сара
        </h1>
        <p className="text-gray-500">Вашата връзка е активна.</p>
      </div>

      {/* Main Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Нисък риск</h2>
            <p className="text-green-50 text-sm">Последен анализ преди 2ч</p>
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

      {/* Floating Action Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/monitoring")}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <Activity className="w-6 h-6" />
        Започнете мониторинг
      </motion.button>
    </div>
  );
}