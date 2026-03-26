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
import { motion } from "motion/react";

export function Profile() {
  return (
    <div className="min-h-full bg-gradient-to-b from-green-50 to-white pb-6">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Профил</h1>
        <p className="text-gray-500">Вашият здравен статус център</p>
      </div>

      {/* Patient Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mb-6 bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">Сара Иванова</h2>
            <p className="text-green-50 text-sm">ID: #EA1016</p>
          </div>
        </div>
      </motion.div>

      {/* Health Status Section */}
      <div className="px-6 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
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
                    Д-р Билияна Бадалова
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Невролог</p>
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
                  <p className="text-sm text-gray-600 mt-1">Канал-02</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Последна синхронизация: преди 5 мин
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
                <span className="text-gray-600">Статус</span>
                <span className="text-purple-700 font-semibold">41%</span>
              </div>
              <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: "41%" }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Вероятност за риск: Средна
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
                  Д-р Бадалова
                </h4>
                <span className="text-xs text-gray-500">Вчера, 15:30</span>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  "Системата отчита обична спав в средната епилептиформена
                  активнос при наблюдаваните пациенти тази седмица."
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
                sara.ivanova@example.com
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
              <p className="text-xs text-gray-500">Телефон</p>
              <p className="text-sm font-medium text-gray-800">
                +359 888 123 456
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 space-y-3">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          <span className="font-medium text-gray-800">Настройки</span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:bg-red-50 transition-colors"
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
