import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";

export function LiveMonitoring() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"stable" | "warning" | "high">("stable");
  const [duration, setDuration] = useState(0);
  const [signalQuality, setSignalQuality] = useState(95);
  const [frequency, setFrequency] = useState(8.4);
  const [amplitude, setAmplitude] = useState(45);
  const [ratio, setRatio] = useState(1.2);
  const [waveData, setWaveData] = useState<Array<{ time: number; value: number }>>([]);

  // Simulate real-time EEG data
  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);

      setWaveData((prev) => {
        const newData = [...prev];
        const timestamp = Date.now();
        
        // Generate different wave patterns based on status
        let value;
        if (status === "stable") {
          value = Math.sin(timestamp / 1000) * 30 + Math.random() * 10;
        } else if (status === "warning") {
          value = Math.sin(timestamp / 500) * 50 + Math.random() * 20;
        } else {
          value = Math.sin(timestamp / 300) * 80 + Math.random() * 30;
        }

        newData.push({ time: timestamp, value: value + 100 });
        
        // Keep only last 50 points
        if (newData.length > 50) {
          newData.shift();
        }
        
        return newData;
      });

      // Randomly change metrics slightly
      setSignalQuality(93 + Math.random() * 5);
      setFrequency(8 + Math.random() * 1);
      setAmplitude(42 + Math.random() * 6);
      setRatio(1.1 + Math.random() * 0.3);

      // Rarely change status for demo
      if (Math.random() > 0.98) {
        const statuses: Array<"stable" | "warning" | "high"> = ["stable", "warning", "high"];
        setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case "stable":
        return {
          color: "#10b981",
          text: "Стабилно",
          dotColor: "bg-green-500",
        };
      case "warning":
        return {
          color: "#f59e0b",
          text: "Предупреждение",
          dotColor: "bg-yellow-500",
        };
      case "high":
        return {
          color: "#ef4444",
          text: "Висока активност",
          dotColor: "bg-red-500",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Brain wave frequency bands
  const brainWaves = [
    { name: "Delta (0.5-4 Hz)", percentage: 35, color: "bg-blue-500" },
    { name: "Theta (4-8 Hz)", percentage: 28, color: "bg-cyan-500" },
    { name: "Alpha (8-13 Hz)", percentage: 22, color: "bg-green-500" },
    { name: "Beta (13-30 Hz)", percentage: 12, color: "bg-yellow-500" },
    { name: "Gamma (30+ Hz)", percentage: 8, color: "bg-purple-500" },
  ];

  return (
    <div className="min-h-screen bg-[#1e293b] flex flex-col max-w-md mx-auto overflow-auto pb-6">
      {/* Header */}
      <div className="relative flex items-start justify-between p-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Наблюдение на живо
          </h1>
          <p className="text-white/60 text-sm">В реално време</p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-6 mb-6 bg-[#2d3748] rounded-3xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className={`w-3 h-3 ${statusConfig.dotColor} rounded-full`} />
          <span className="text-white font-semibold text-lg">
            {statusConfig.text}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-white/60 text-sm mb-2">Продължителност</p>
            <p className="text-white text-3xl font-bold">
              {formatDuration(duration)}
            </p>
          </div>
          <div>
            <p className="text-white/60 text-sm mb-2">Качество на сигнала</p>
            <p className="text-green-400 text-3xl font-bold">
              {signalQuality.toFixed(0)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* EEG Waveform Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-6 mb-6 bg-[#2d3748] rounded-3xl p-6"
      >
        <h3 className="text-white font-bold text-lg mb-6">EEG вълнова форма</h3>

        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={waveData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={statusConfig.color}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1e293b] rounded-2xl p-4 text-center">
            <p className="text-white/60 text-xs mb-2">Честота</p>
            <p className="text-white font-bold text-lg">
              {frequency.toFixed(1)} Hz
            </p>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-4 text-center">
            <p className="text-white/60 text-xs mb-2">Амплитуда</p>
            <p className="text-white font-bold text-lg">{amplitude.toFixed(0)} μV</p>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-4 text-center">
            <p className="text-white/60 text-xs mb-2">Съотношение</p>
            <p className="text-white font-bold text-lg">{ratio.toFixed(1)}</p>
          </div>
        </div>
      </motion.div>

      {/* Brain Wave Frequencies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-6 mb-6 bg-[#2d3748] rounded-3xl p-6"
      >
        <h3 className="text-white font-bold text-lg mb-6">Мозъчни честоти</h3>

        <div className="space-y-5">
          {brainWaves.map((wave, index) => (
            <motion.div
              key={wave.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/90 text-sm">{wave.name}</span>
                <span className="text-white font-bold">{wave.percentage}%</span>
              </div>
              <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${wave.percentage}%` }}
                  transition={{ delay: 0.4 + index * 0.05, duration: 0.8 }}
                  className={`h-full ${wave.color} rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}