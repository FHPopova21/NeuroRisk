import { TrendingUp, Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data for weekly chart
const weeklyData = [
  { day: "Пон", risk: 20, id: "mon" },
  { day: "Вто", risk: 35, id: "tue" },
  { day: "Сря", risk: 25, id: "wed" },
  { day: "Чет", risk: 45, id: "thu" },
  { day: "Пет", risk: 30, id: "fri" },
  { day: "Съб", risk: 15, id: "sat" },
  { day: "Нед", risk: 20, id: "sun" },
];

// Mock history entries
const historyEntries = [
  {
    id: 1,
    date: "26 март 2026",
    time: "14:30",
    risk: "low",
    riskText: "Нисък риск",
    percentage: 15,
    interpretation:
      "Нормална активност. Мозъчните вълни показват стабилни модели без отклонения.",
  },
  {
    id: 2,
    date: "26 март 2026",
    time: "09:15",
    risk: "medium",
    riskText: "Среден риск",
    percentage: 41,
    interpretation:
      "Леко повишена активност в тета диапазона. Препоръчва се проследяване.",
  },
  {
    id: 3,
    date: "25 март 2026",
    time: "18:45",
    risk: "low",
    riskText: "Нисък риск",
    percentage: 18,
    interpretation: "Стабилни показатели. Няма необичайни флуктуации.",
  },
  {
    id: 4,
    date: "25 март 2026",
    time: "11:20",
    risk: "high",
    riskText: "Висок риск",
    percentage: 85,
    interpretation:
      "Високо ниво на епилептиформена активност. Свържете се с лекар.",
  },
  {
    id: 5,
    date: "24 март 2026",
    time: "16:00",
    risk: "medium",
    riskText: "Среден риск",
    percentage: 45,
    interpretation: "Умерено повишение. Може да се наложи корекция на терапията.",
  },
  {
    id: 6,
    date: "24 март 2026",
    time: "08:30",
    risk: "low",
    riskText: "Нисък риск",
    percentage: 12,
    interpretation: "Отлични резултати. Продължете с текущата терапия.",
  },
];

function getRiskColor(risk: string) {
  switch (risk) {
    case "low":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        badge: "bg-green-100",
        icon: CheckCircle,
      };
    case "medium":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
        badge: "bg-orange-100",
        icon: AlertCircle,
      };
    case "high":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        badge: "bg-red-100",
        icon: AlertCircle,
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
        badge: "bg-gray-100",
        icon: AlertCircle,
      };
  }
}

export function History() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-full bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white px-6 pt-8 pb-6 mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">История</h1>
        <p className="text-gray-500">Преглед на вашите анализи</p>
      </div>

      {/* Weekly Summary Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mb-6 bg-white rounded-3xl shadow-sm p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Седмичен преглед</h2>
            <p className="text-sm text-gray-500">Тенденция на риска</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
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
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="risk"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#riskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>19 - 26 март 2026</span>
          </div>
          <div className="text-green-600 font-semibold">Средно: 27%</div>
        </div>
      </motion.div>

      {/* Timeline Header */}
      <div className="px-6 mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Хронология на анализите
        </h3>
      </div>

      {/* Timeline Entries */}
      <div className="px-6 space-y-4">
        {historyEntries.map((entry, index) => {
          const colors = getRiskColor(entry.risk);
          const Icon = colors.icon;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/history/${entry.id}`)}
              className={`relative bg-white rounded-2xl shadow-sm border-l-4 ${colors.border} overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}
                    >
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full ${colors.badge} ${colors.text} text-xs font-semibold mb-1`}
                      >
                        {entry.riskText} • {entry.percentage}%
                      </div>
                      <p className="text-xs text-gray-500">
                        {entry.date} • {entry.time}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className={`${colors.bg} rounded-xl p-4`}>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {entry.interpretation}
                  </p>
                </div>
              </div>

              {/* Progress bar at bottom */}
              <div className="h-1.5 bg-gray-100">
                <div
                  className={`h-full transition-all ${
                    entry.risk === "low"
                      ? "bg-green-500"
                      : entry.risk === "medium"
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${entry.percentage}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}