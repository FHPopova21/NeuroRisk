import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { X, Wifi, Activity, Brain } from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";
import clsx from "clsx";

// MindWave Mobile 2 Constants
const SAMPLING_RATE_MW = 512;
const TARGET_SAMPLING_RATE = 173.61;
const BUFFER_SIZE = 4096; // ~23.6s at 173.61Hz

declare global {
  interface Window {
    eel: {
      start_eeg_stream: () => Promise<boolean>;
      stop_eeg_stream: () => Promise<boolean>;
      expose: (fn: Function, name: string) => void;
    };
  }
}

export function LiveMonitoring() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<"stable" | "warning" | "high">("stable");
  const [duration, setDuration] = useState(0);
  const [waveData, setWaveData] = useState<Array<{ time: number; value: number }>>([]);
  const [riskScore, setRiskScore] = useState(0);

  // Processing Refs
  const resampledBufferRef = useRef<number[]>([]);
  const accumulatorRef = useRef(0);
  const stepSize = SAMPLING_RATE_MW / TARGET_SAMPLING_RATE; // ~2.949

  // Resampling Logic: 512Hz -> 173.61Hz
  const processRawData = (value: number) => {
    // Update UI wave immediately (keep last 50 points for visualization)
    setWaveData(prev => {
      const newData = [...prev, { time: Date.now(), value: value }];
      return newData.slice(-50);
    });

    // Accumulator for linear sampling
    accumulatorRef.current += 1;
    if (accumulatorRef.current >= stepSize) {
      accumulatorRef.current -= stepSize;
      
      // Normalize raw byte (0-255) to AI-friendly range (usually -1 to 1 or 0 to 1)
      // MindWave raw is 16-bit signed, but byte-by-byte reading is simpler for now
      const signalValue = (value - 127) / 128; 
      resampledBufferRef.current.push(signalValue);
      
      // Check if buffer is full (23.6s reached)
      if (resampledBufferRef.current.length >= BUFFER_SIZE) {
        const fullBuffer = [...resampledBufferRef.current];
        resampledBufferRef.current = []; // Clear for next batch
        handleSendSignal(fullBuffer);
      }
    }
  };

  const handleSendSignal = async (signal: number[]) => {
    try {
      const result = await apiService.processSignal(signal);
      if (result.risk_score !== undefined) {
        setRiskScore(result.risk_score);
        if (result.risk_score > 70) setStatus("high");
        else if (result.risk_score > 30) setStatus("warning");
        else setStatus("stable");
      }
    } catch (err) {
      console.error("Failed to process EEG batch", err);
    }
  };

  // Expose function to Eel for real-time updates
  useEffect(() => {
    if (window.eel) {
      window.eel.expose(processRawData, "updateEEGData");
      window.eel.expose((err: string) => {
        toast.error(`Проблем с устройството: ${err}`);
        setIsConnected(false);
      }, "onStreamError");
    }
  }, []);

  const connectDevice = async () => {
    setIsConnecting(true);
    try {
      if (window.eel) {
        const success = await window.eel.start_eeg_stream();
        if (success) {
          setIsConnected(true);
          toast.success("Сесията започна!");
        }
      } else {
        toast.error("Eel не е зареден");
      }
    } catch (err) {
      toast.error("Неуспешно свързване с порта");
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async () => {
    if (window.eel) {
      await window.eel.stop_eeg_stream();
    }
    setIsConnected(false);
  };

  useEffect(() => {
    let timer: any;
    if (isConnected) {
      timer = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => {
       if (timer) clearInterval(timer);
    };
  }, [isConnected]);

  const statusConfig = {
    stable: { color: "#10b981", text: "Стабилно", dotColor: "bg-green-500" },
    warning: { color: "#f59e0b", text: "Предупреждение", dotColor: "bg-yellow-500" },
    high: { color: "#ef4444", text: "Висока активност", dotColor: "bg-red-500" }
  }[status];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#030213] flex flex-col max-w-md mx-auto overflow-auto pb-6">
      {/* Header */}
      <div className="relative flex items-start justify-between p-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Мониторинг
          </h1>
          <div className="flex items-center gap-2">
            <span className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-white/60 text-sm">
              {isConnected ? "В реално време" : "Няма връзка"}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Connection Action */}
      <AnimatePresence>
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mx-6 mb-6 p-8 bg-blue-600 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-blue-900/40 border border-blue-400/30"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Wifi className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">MindWave Mobile 2</h2>
            <p className="text-blue-100 text-sm mb-6 px-4">Моля, включете устройството и натиснете бутона за свързване.</p>
            <button
              onClick={connectDevice}
              disabled={isConnecting}
              className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isConnecting ? "Свързване..." : "Свържи сега"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status & Waveform */}
      {isConnected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
          {/* Status Card */}
          <div className="mx-6 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className={clsx("w-3 h-3 rounded-full", statusConfig.dotColor)} />
                <span className="text-white font-semibold text-lg">{statusConfig.text}</span>
              </div>
              <button onClick={disconnectDevice} className="text-white/40 text-xs hover:text-white transition-colors">Прекъсни връзката</button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-white/60 text-sm mb-2">Продължителност</p>
                <p className="text-white text-3xl font-bold">{formatDuration(duration)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm mb-2">Рисков Индекс</p>
                <p className={clsx("text-3xl font-bold", riskScore > 50 ? "text-red-400" : "text-green-400")}>{riskScore}%</p>
              </div>
            </div>
          </div>

          {/* Waveform Visualization */}
          <div className="mx-6 mb-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <Brain className="w-8 h-8 text-white/5" />
             </div>
             <h3 className="text-white font-bold text-lg mb-6">EEG Сигнал</h3>
             <div className="h-48 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={waveData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={statusConfig.color}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
             </div>
             <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 text-sm font-medium">Буфериране: 23.6с</span>
                </div>
                <div className="flex gap-1">
                   {[1,2,3,4].map(i => (
                     <div key={i} className={clsx("w-1.5 h-1.5 rounded-full", resampledBufferRef.current.length > (BUFFER_SIZE/4)*i ? "bg-blue-500" : "bg-white/10")} />
                   ))}
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}