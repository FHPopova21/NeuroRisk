import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import { X, Wifi, Activity } from "lucide-react";
import { apiService } from "../services/api";
import { toast } from "sonner";
import clsx from "clsx";
import EEGVisualizer from "./EEGVisualizer";

// MindWave Mobile 2 Constants
const SAMPLING_RATE_MW = 512;
const TARGET_SAMPLING_RATE = 173.61;
const BUFFER_SIZE = 4096; // ~23.6s at 173.61Hz

declare global {
  interface Window {
    eel: {
      start_eeg_stream: () => Promise<boolean>;
      stop_eeg_stream: () => Promise<boolean>;
      start_simulation: (label: number) => Promise<boolean>;
      expose: (fn: Function, name: string) => void;
    };
  }
}

export function LiveMonitoring() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [status, setStatus] = useState<"stable" | "warning" | "high">("stable");
  const [duration, setDuration] = useState(0);
  const [signalQuality, setSignalQuality] = useState(0);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  // Processing Refs
  const resampledBufferRef = useRef<number[]>([]);
  const accumulatorRef = useRef(0);
  const isSimRef = useRef(false);
  const stepSize = SAMPLING_RATE_MW / TARGET_SAMPLING_RATE; // ~2.949

  // Logic to handle both MindWave and Simulator data
  const processRawData = (value: number) => {
    if (isFinished) return;

    if (isSimRef.current) {
      // Simulator data is already 173.61Hz and raw Bonn ranges
      resampledBufferRef.current.push(value);
    } else {
      // MindWave Resampling: 512Hz -> 173.61Hz
      accumulatorRef.current += 1;
      if (accumulatorRef.current >= stepSize) {
        accumulatorRef.current -= stepSize;
        const signalValue = value / 32768.0; // Normalized 16-bit
        resampledBufferRef.current.push(signalValue);
      }
    }
      
    if (resampledBufferRef.current.length >= BUFFER_SIZE) {
      setIsFinished(true);
      const fullBuffer = [...resampledBufferRef.current];
      handleSessionEnd(fullBuffer);
    }
  };

  const handleSessionEnd = async (signal: number[]) => {
    try {
      if (window.eel) window.eel.stop_eeg_stream();
      
      const result = await apiService.processSignal(signal);
      if (result.risk_score !== undefined) {
        setRiskScore(result.risk_score);
        if (result.risk_score > 70) setStatus("high");
        else if (result.risk_score > 30) setStatus("warning");
        else setStatus("stable");
        
        toast.success("Анализът е завършен!");
      }
    } catch (err) {
      toast.error("Грешка при анализа на сигнала");
    }
  };

  const saveToHistory = async () => {
    try {
      if (riskScore !== null) {
        toast.success("Резултатът е запазен в историята!");
        navigate("/");
      }
    } catch (err) {
      toast.error("Неуспешно запазване");
    }
  };

  // Expose functions to Eel
  useEffect(() => {
    if (window.eel) {
      const onRawEEGData = (value: number) => {
        processRawData(value);
        window.dispatchEvent(new CustomEvent('new_eeg_data', { detail: value }));
      };
      // @ts-ignore
      window.eel.expose(onRawEEGData, "updateEEGData");

      // @ts-ignore
      window.eel.expose((val: number) => {
          setSignalQuality(Math.round((200 - val) / 2)); // 0 = perfect, 200 = no signal
      }, "updateSignalQuality");
      // @ts-ignore
      window.eel.expose((err: string) => {
        toast.error(`Проблем: ${err}`);
        setIsConnected(false);
      }, "onStreamError");
    }
  }, [isFinished]);

  const connectDevice = async (isSimulation = false, label = 1) => {
    setIsConnecting(true);
    setIsFinished(false);
    setDuration(0);
    resampledBufferRef.current = [];
    isSimRef.current = isSimulation;
    try {
      if (window.eel) {
        const success = isSimulation 
            ? await window.eel.start_simulation(label)
            : await window.eel.start_eeg_stream();
        if (success) {
          setIsConnected(true);
          toast.success(isSimulation ? "Симулацията започна!" : "Сесията започна!");
        }
      }
    } catch (err) {
      toast.error("Неуспешна връзка");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async () => {
    if (window.eel) await window.eel.stop_eeg_stream();
    setIsConnected(false);
  };

  useEffect(() => {
    let timer: any;
    if (isConnected && !isFinished) {
      timer = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isConnected, isFinished]);

  const statusConfig = {
    stable: { color: "#10b981", text: "Стабилно", dotColor: "bg-green-500", desc: "Няма признаци на активност." },
    warning: { color: "#f59e0b", text: "Предупреждение", dotColor: "bg-yellow-500", desc: "Забелязана е необичайна активност." },
    high: { color: "#ef4444", text: "Висока активност", dotColor: "bg-red-500", desc: "Вероятен риск! Свържете се с лекар." }
  }[status];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#030213] flex flex-col max-w-md mx-auto overflow-hidden pb-6 relative">
      {/* Header */}
      <div className="relative flex items-start justify-between p-6 pb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Мониторинг</h1>
          <div className="flex items-center gap-2">
            <span className={clsx("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            <p className="text-white/60 text-sm">MindWave Mobile 2</p>
          </div>
        </div>
        <button onClick={() => navigate("/")} className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors shrink-0">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {!isConnected ? (
          <div className="mx-6 p-8 bg-blue-600 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-blue-900/40">
            <Wifi className="w-12 h-12 text-white mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Започни измерване</h2>
            <p className="text-blue-100 text-sm mb-6 px-4">Сесията продължава 23.6 секунди за максимална точност.</p>
            <button onClick={() => connectDevice(false)} disabled={isConnecting} className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl disabled:opacity-50">
              {isConnecting ? "Свързване..." : "Старт сега (MindWave)"}
            </button>
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
               <button onClick={() => connectDevice(true, 5)} disabled={isConnecting} className="bg-green-500/20 text-green-100 text-sm font-bold py-3 rounded-xl border border-green-500/30 hover:bg-green-500/30 transition-colors">
                  Виртуално (Здрав)
               </button>
               <button onClick={() => connectDevice(true, 1)} disabled={isConnecting} className="bg-red-500/20 text-red-100 text-sm font-bold py-3 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-colors">
                  Виртуално (Болен)
               </button>
            </div>
          </div>
      ) : (
        <div className="flex-1 space-y-6">
          <div className="mx-6 bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <div className={clsx("w-3 h-3 rounded-full", statusConfig.dotColor)} />
                    <span className="text-white font-semibold text-lg">{statusConfig.text}</span>
                </div>
                {!isFinished && <button onClick={disconnectDevice} className="text-white/40 text-xs">Отказ</button>}
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-white/60 text-xs mb-1">Време</p>
                    <p className="text-white text-2xl font-bold">{formatDuration(duration)} / 00:24</p>
                </div>
                <div>
                    <p className="text-white/60 text-xs mb-1">Качество</p>
                    <p className="text-green-400 text-2xl font-bold">{signalQuality}%</p>
                </div>
            </div>
          </div>

          <div className="mx-6 bg-white/5 border border-white/10 rounded-3xl p-6 h-48 overflow-hidden">
               <EEGVisualizer color={statusConfig.color} isFinished={isFinished} />
          </div>

          <div className="mx-6 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.min(100, (resampledBufferRef.current.length / BUFFER_SIZE) * 100)}%` }} 
                  />
              </div>
          </div>
        </div>
      )}

      {/* Result Overlay */}
      <AnimatePresence>
        {isFinished && riskScore !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-[#030213]/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 text-center">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full bg-white/10 border border-white/20 rounded-[3rem] p-8">
                <div className={clsx("w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 border-4", status === 'stable' ? 'border-green-500/50 bg-green-500/10' : status === 'warning' ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-red-500/50 bg-red-500/10')}>
                    <span className={clsx("text-4xl font-black", status === 'stable' ? 'text-green-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500')}>{riskScore}%</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{statusConfig.text}</h2>
                <p className="text-white/60 mb-8">{statusConfig.desc}</p>
                <div className="space-y-3">
                    <button onClick={saveToHistory} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20">Запази резултата</button>
                    <button onClick={() => navigate("/")} className="w-full text-white/40 font-medium py-2">Затвори без запис</button>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}