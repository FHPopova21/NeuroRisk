import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  TrendingUp,
  Zap,
  Brain,
  Moon,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Mock EEG waveform data
const waveformData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  value: Math.sin(i / 5) * 30 + Math.random() * 20 + 100,
}));

// Mock feature contributions
const features = [
  { name: "Тета вълни", value: 85, icon: Brain },
  { name: "Делта вълни", value: 45, icon: Moon },
  { name: "Пикова активност", value: 72, icon: Zap },
  { name: "Базова честота", value: 38, icon: TrendingUp },
];

export function AnalysisDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data based on ID (in real app, fetch from API)
  const analysis = {
    id: id || "1",
    date: "26 март 2026",
    time: "14:30",
    risk: "medium",
    riskText: "Среден риск",
    percentage: 41,
    interpretation:
      "Леко повишена активност в тета диапазона. Препоръчва се проследяване.",
    doctorNote:
      "Пациентът показва повишена тета активност през деня. Препоръчвам корекция на дозата и контролен преглед след 2 седмици. Продължете с ежедневния мониторинг.",
    doctorName: "Д-р Билияна Бадалова",
  };

  const getRiskColor = () => {
    switch (analysis.risk) {
      case "low":
        return {
          gradient: "from-green-400 to-green-500",
          icon: CheckCircle,
          text: "text-green-700",
          bg: "bg-green-50",
        };
      case "medium":
        return {
          gradient: "from-orange-400 to-orange-500",
          icon: AlertCircle,
          text: "text-orange-700",
          bg: "bg-orange-50",
        };
      case "high":
        return {
          gradient: "from-red-400 to-red-500",
          icon: AlertCircle,
          text: "text-red-700",
          bg: "bg-red-50",
        };
      default:
        return {
          gradient: "from-gray-400 to-gray-500",
          icon: AlertCircle,
          text: "text-gray-700",
          bg: "bg-gray-50",
        };
    }
  };

  const colors = getRiskColor();
  const Icon = colors.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4 p-6">
          <button
            onClick={() => navigate("/history")}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Детайли на анализа</h1>
            <p className="text-sm text-gray-500">
              {analysis.date} • {analysis.time}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Risk Indicator Gauge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 shadow-lg`}
        >
          <div className="flex flex-col items-center">
            {/* Circular Gauge */}
            <div className="relative w-40 h-40 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  opacity="0.3"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 70 * (1 - analysis.percentage / 100),
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon className="w-12 h-12 text-white mb-2" />
                <span className="text-4xl font-bold text-white">
                  {analysis.percentage}%
                </span>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">
              {analysis.riskText}
            </h2>
            <p className="text-white/90 text-center">{analysis.interpretation}</p>
          </div>
        </motion.div>

        {/* EEG Waveform */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            EEG форма на вълната
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={waveformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#999"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#999"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Contributions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h3 className="font-bold text-gray-800 mb-4">
            Какво повлия на този резултат
          </h3>
          <div className="space-y-4">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FeatureIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {feature.name}
                      </span>
                      <span className="text-sm font-bold text-purple-600">
                        {feature.value}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${feature.value}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Doctor Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Отзиви на лекаря</h3>
              <p className="text-sm text-gray-500">{analysis.doctorName}</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-gray-700 leading-relaxed">{analysis.doctorNote}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
