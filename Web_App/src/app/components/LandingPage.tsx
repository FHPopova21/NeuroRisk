import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, ShieldAlert, Activity, BookOpen, Scale,
  Cpu, UserCheck, AlertCircle, Stethoscope, GraduationCap, UserCog,
  Info, ChevronDown, BarChart2, Smartphone, Zap, Brain, LayoutDashboard, CheckCircle
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  // Fake live data state
  const [liveRiskScore, setLiveRiskScore] = useState(42);
  const [liveHjorth, setLiveHjorth] = useState(1.24);

  // Simulate live data changes
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveRiskScore(prev => Math.min(65, Math.max(35, prev + (Math.random() - 0.5) * 5)));
      setLiveHjorth(prev => Number((Math.max(0.5, prev + (Math.random() - 0.5) * 0.1)).toFixed(2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 overflow-x-hidden selection:bg-emerald-100">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-20 overflow-hidden">

        {/* --- FIX 1: Multi-channel Living Background --- */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute w-full h-32" style={{ top: `${20 + i * 25}%` }}>
              <motion.svg
                className="w-[200%] h-full absolute left-0 top-0"
                viewBox="0 0 2000 200"
                preserveAspectRatio="none"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 20 + i * 5, ease: "linear" }}
              >
                <path
                  d={`M0,100 
                       Q50,${80 + i * 10} 100,100 T200,100 T300,100 
                       Q450,${50 - i * 10} 500,100 T600,100 T700,100 
                       Q850,${150 + i * 5} 900,100 T1000,100 T1100,100 
                       Q1250,${80 - i * 5} 1300,100 T1400,100 T1500,100 
                       Q1650,${50 + i * 10} 1700,100 T1800,100 T1900,100 T2000,100`}
                  fill="none"
                  stroke={i === 1 ? "#059669" : "#34d399"} // Middle one is darker teal
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </motion.svg>
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-transparent to-slate-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-transparent to-slate-50" />
        </div>

        {/* Header (Absolute) */}
        <header className="absolute top-0 left-0 right-0 px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
          <div className="flex items-center gap-2 text-emerald-700">
            <Activity className="w-8 h-8" />
            <span className="font-semibold text-xl tracking-tight">Клинична платформа NeuroRisk</span>
          </div>
          <div className="hidden sm:block text-sm text-emerald-800/70 font-medium bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 px-3 py-1 rounded-full">
            v1.1.0 Изследователско превю
          </div>
        </header>

        {/* Hero Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto w-full items-center">

          {/* Left: Text & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              AI-базиран мониторинг на ЕЕГ риск
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Обясним <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                ЕЕГ Анализ
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
              Анализ на мозъчни сигнали в реално време за ранно откриване на риск.
            </p>

            {/* FIX 2: Explainability Teaser (List) */}
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md">
                <Activity className="w-3.5 h-3.5" /> Мобилност по Хьорт
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md">
                <BarChart2 className="w-3.5 h-3.5" /> Дисперсия на сигнала
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md">
                <Cpu className="w-3.5 h-3.5" /> Спектрална мощност
              </span>
            </div>

            {/* Dynamic Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {user ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                    className="group relative px-8 py-4 bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Влез в {user.role === 'admin' ? 'Админ панела' : 'Клиничното табло'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/profile")}
                    className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/30 transition-colors"
                  >
                    Вписан като {user.name || "Лекар"}
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/login")}
                    className="group relative px-8 py-4 bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200/50 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Вход в клиничното табло <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/login")}
                    className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/30 transition-colors"
                  >
                    Вход за системни администратори
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>

          {/* Right: FIX "Fake Live Analysis" Card (New) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            {/* Main Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-6 max-w-md ml-auto relative z-10">
              {/* Card Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Симулационен монитор</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Обработка на потока
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400">КАНАЛ-02: АКТИВЕН</span>
              </div>

              {/* Live Stats */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>ВЕРОЯТНОСТ ЗА РИСК</span>
                    <span className="text-emerald-600 transition-all duration-500">{Math.round(liveRiskScore)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      animate={{ width: `${liveRiskScore}%` }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Мобилност по Хьорт</p>
                    <p className="font-mono font-medium text-slate-700">{liveHjorth}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Спектрална ентропия</p>
                    <p className="font-mono font-medium text-slate-700">0.85</p>
                  </div>
                </div>
              </div>

              {/* Mini Sparkline */}
              <div className="h-16 w-full bg-slate-50 rounded-lg border border-slate-100 overflow-hidden relative flex items-end">
                <motion.div
                  className="absolute inset-0 flex items-center"
                  animate={{ x: [-100, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                >
                  <svg viewBox="0 0 200 50" className="w-full h-full text-emerald-400 stroke-current fill-none stroke-2">
                    <path d="M0,25 Q10,20 20,25 T40,25 T60,25 Q70,5 80,25 T100,25 T120,25 Q130,45 140,25 T160,25 T180,25 T200,25" vectorEffect="non-scaling-stroke" />
                  </svg>
                  <svg viewBox="0 0 200 50" className="w-full h-full text-emerald-400 stroke-current fill-none stroke-2 ml-[-1px]">
                    <path d="M0,25 Q10,20 20,25 T40,25 T60,25 Q70,5 80,25 T100,25 T120,25 Q130,45 140,25 T160,25 T180,25 T200,25" vectorEffect="non-scaling-stroke" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Floating Elements (Decoration) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white p-3 rounded-lg shadow-lg border border-slate-100 z-0 opacity-80"
            >
              <Cpu className="w-5 h-5 text-amber-500" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 bg-white p-3 rounded-lg shadow-lg border border-slate-100 z-20"
            >
              <ShieldAlert className="w-5 h-5 text-emerald-500" />
            </motion.div>
          </motion.div>
        </div>

        {/* FIX 3: Scroll Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer text-slate-400 hover:text-emerald-600 transition-colors"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-xs font-medium uppercase tracking-widest">Как работи</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-32 px-6 lg:px-8 bg-white overflow-hidden relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Как работи NeuroRisk</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">От сурови неврологични данни до приложими клинични прозрения в три безпроблемни стъпки.</p>
          </div>

          <div className="relative">
            {/* Animated Tracking Line */}
            <div className="hidden md:block absolute top-[4.5rem] left-0 w-full h-1 bg-slate-100 rounded-full z-0 overflow-hidden">
              <motion.div
                className="h-full w-1/3 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {[
                { step: "01", title: "Събиране на данни", icon: Smartphone, desc: "Непрекъснат ЕЕГ мониторинг чрез свързани клинични устройства и мобилното приложение за пациенти." },
                { step: "02", title: "AI машина за анализ", icon: Cpu, desc: "Нашите собствени модели извличат характеристики и оценяват риска от пристъпи в реално време." },
                { step: "03", title: "Лекарско табло", icon: LayoutDashboard, desc: "Клиницистите получават структурирани прозрения в подкрепа на по-бързи и по-точни решения." },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2, duration: 0.6 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex flex-col items-center text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, translateY: -5 }}
                    className="w-36 h-36 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center text-emerald-600 mb-8 border border-slate-100 transition-all duration-300 relative group-hover:shadow-[0_8px_30px_rgb(16,185,129,0.12)] group-hover:border-emerald-100"
                  >
                    <div className="absolute inset-0 bg-emerald-50/50 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <item.icon className="w-12 h-12 relative z-10" />
                    <span className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold border-4 border-white shadow-sm z-20">
                      {item.step}
                    </span>
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed max-w-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-32 px-6 lg:px-8 bg-slate-50/80 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Възможности на платформата</h2>
            <p className="text-xl text-slate-500 max-w-2xl">Пълен пакет, създаден за клинична прецизност и непрекъснат надзор.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <motion.div
              whileHover={{ scale: 1.01, translateY: -4 }}
              className="md:col-span-4 bg-white p-10 lg:p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 border border-emerald-100/50">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Визуализация на ЕЕГ в реално време</h3>
              <p className="text-slate-500 text-lg leading-relaxed max-w-xl">Предавайте, наблюдавайте и анализирайте мозъчната активност на живо със субмилисекундно закъснение. Интерактивни времеви и спектрални домейни, изградени изключително за строг клиничен преглед.</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, translateY: -4 }}
              className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-10 lg:p-12 rounded-[2.5rem] border border-slate-700 shadow-xl transition-all duration-300 text-white"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-8 border border-white/10">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Засичане на риск</h3>
              <p className="text-slate-300 text-lg opacity-90">Алгоритми за машинно обучение незабавно маркират високорискови аномалии за преглед от човек.</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Лекарско табло</h3>
              <p className="text-slate-500 text-md">Централизиран хъб за проследяване на пациентски риск и медицинска история.</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Непрекъснато проследяване</h3>
              <p className="text-slate-500 text-md">Постоянната обработка във фонов режим гарантира, че не е пропусната критична аномалия.</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Мобилна интеграция</h3>
              <p className="text-slate-500 text-md">Пациентите синхронизират устройствата си чрез лесно за използване мобилно приложение.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= USERS SPLIT LAYOUT ================= */}
      <section className="flex flex-col lg:flex-row min-h-[600px] border-y border-slate-200/50">
        {/* Left: Patient */}
        <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <Smartphone className="w-14 h-14 text-emerald-400 mb-10 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">За пациенти</h2>
          <p className="text-xl text-slate-300 max-w-md leading-relaxed font-light">Лесно мобилно приложение за синхронизиране на вашето носимо устройство, преглед на състоянието на мониторинга и безпроблемно споделяне на данни с вашия лекар.</p>
        </div>

        {/* Right: Doctor */}
        <div className="flex-1 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-950 p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/60 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
          <Stethoscope className="w-14 h-14 text-emerald-600 mb-10 opacity-90" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-emerald-900">За лекари</h2>
          <p className="text-xl text-emerald-800/80 max-w-md leading-relaxed font-light">Здраво уеб табло, включващо стрийминг на AI изводи на живо, изчерпателни исторически диаграми и централизирано управление на клинични бележки.</p>
        </div>
      </section>

      {/* ================= PLATFORM PREVIEW (MOCKUPS) ================= */}
      <section className="py-32 px-6 lg:px-8 bg-slate-50/50 overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Изживейте интерфейса</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Изчистен, достъпен и структуриран перфектно както за клинична скорост, така и за лесно използване от пациентите.</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24">
            {/* Mobile Mockup Abstraction */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative w-[300px] h-[600px] bg-white rounded-[3rem] border-[8px] border-slate-900 shadow-2xl shadow-slate-300 overflow-hidden flex flex-col"
            >
              {/* iPhone Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl z-20" />
              {/* Mobile Header */}
              <div className="pt-12 pb-6 px-6 bg-emerald-500 text-white rounded-b-[2rem] shadow-sm relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Здравейте, Сара</h3>
                <p className="text-white/80 text-sm">Вашата връзка е активна.</p>
              </div>
              {/* Mobile Content */}
              <div className="p-6 space-y-4 flex-1 bg-slate-50">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Статус на синхронизация</h4>
                    <p className="text-xs text-emerald-600 font-medium">Предаване на живо</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-28 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-blue-50" />
                    <div className="space-y-2">
                      <div className="h-2 w-16 bg-slate-200 rounded-full" />
                      <div className="h-2 w-10 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-28 flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-amber-50" />
                    <div className="space-y-2">
                      <div className="h-2 w-20 bg-slate-200 rounded-full" />
                      <div className="h-2 w-12 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-between mt-4">
                  <div className="h-3 w-32 bg-slate-200 rounded-full mb-4" />
                  <div className="flex-1 w-full bg-slate-50 rounded-xl flex items-end p-2 gap-1">
                    <div className="w-full h-[40%] bg-emerald-200 rounded-t-md opacity-50" />
                    <div className="w-full h-[60%] bg-emerald-300 rounded-t-md opacity-50" />
                    <div className="w-full h-[30%] bg-emerald-200 rounded-t-md opacity-50" />
                    <div className="w-full h-[80%] bg-emerald-400 rounded-t-md opacity-50" />
                    <div className="w-full h-[50%] bg-emerald-300 rounded-t-md opacity-50" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dashboard Mockup Abstraction */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[700px] h-[500px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Browser Header */}
              <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              {/* Dashboard Layout */}
              <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-48 bg-slate-900 p-6 flex flex-col gap-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    <div className="h-3 w-20 bg-slate-700 rounded-full" />
                  </div>
                  <div className="h-8 w-full bg-emerald-500/20 rounded-lg" />
                  <div className="h-4 w-3/4 bg-slate-800 rounded-full" />
                  <div className="h-4 w-5/6 bg-slate-800 rounded-full" />
                  <div className="h-4 w-full bg-slate-800 rounded-full" />
                </div>
                {/* Main Content */}
                <div className="flex-1 bg-slate-50 p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-center mb-2">
                    <div className="h-6 w-48 bg-slate-200 rounded-full" />
                    <div className="h-8 w-24 bg-emerald-100 rounded-full" />
                  </div>
                  <div className="flex gap-4 h-24">
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4" />
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4" />
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-4" />
                  </div>
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <div className="h-4 w-32 bg-slate-200 rounded-full mb-6" />
                    <div className="flex-1 border-t border-b border-dashed border-slate-200 relative flex items-center justify-center">
                      {/* Abstract Waveform */}
                      <svg viewBox="0 0 400 100" className="w-full h-full text-emerald-500 stroke-current fill-none stroke-2 opacity-60">
                        <path d="M0,50 Q20,20 40,50 T80,50 T120,50 Q140,10 160,50 T200,50 T240,50 Q260,90 280,50 T320,50 T360,50 T400,50" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= WHY IT MATTERS ================= */}
      <section className="py-32 px-6 lg:px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 space-y-10">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">Защо контекстуалният<br />мениджмънт е важен</h2>

            <div className="space-y-8">
              {[
                { title: "Ранна осведоменост за риска", desc: "Забелязва фини отклонения от базовата линия в ЕЕГ вълните преди появата на физически прояви." },
                { title: "Подпомага вземането на решения", desc: "Предоставя емпирични, структурирани данни в подкрепа на клиничните подозрения." },
                { title: "Дългосрочно непрекъснато проследяване", desc: "Записва исторически събития в продължение на месеци, за да дефинира точни модели на пациентите." },
              ].map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  key={idx}
                  className="flex gap-5"
                >
                  <div className="mt-1">
                    <CheckCircle className="w-7 h-7 text-emerald-500 bg-emerald-50 rounded-full" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h4>
                    <p className="text-slate-500 leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-200 to-orange-200 rounded-[3rem] blur-2xl opacity-20 transform rotate-3" />
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative bg-amber-50 border border-amber-200/50 p-12 rounded-[3rem] shadow-xl shadow-amber-900/5"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 mb-8 shadow-sm border border-amber-100">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-amber-950 mb-6 font-serif tracking-tight">Ясна етична граница</h3>
              <p className="text-xl text-amber-900/80 leading-relaxed italic">
                "NeuroRisk е създаден специално като инструмент за подпомагане на вземането на решения и обучение. Той категорично <strong className="text-amber-950 border-b-2 border-amber-300">не е диагностична машина</strong>. Алгоритмичната вероятност за риск служи само за една цел: да насочва клиничния опит на лекарите."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-32 px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[400px] bg-emerald-500/20 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Започнете да мониторирате по-умно.
          </h2>
          <p className="text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
            Внедрете анализ в реално време за вашата клинична среда. Изпитайте обясним мониторинг днес.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/login")}
            className="px-12 py-5 bg-emerald-500 text-white text-lg rounded-2xl font-bold shadow-2xl shadow-emerald-500/30 hover:bg-emerald-400 border border-emerald-400 transition-all font-sans tracking-wide uppercase"
          >
            Достъп до платформата
          </motion.button>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-slate-100 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-400 font-medium">
          <p>© 2026 NeuroRisk Медицински AI технологии.</p>
          <div className="flex flex-wrap justify-center gap-8">
            <span className="hover:text-emerald-600 outline-none cursor-pointer transition-colors">За нас</span>
            <span className="hover:text-emerald-600 outline-none cursor-pointer transition-colors">Контакти</span>
            <span className="hover:text-emerald-600 outline-none cursor-pointer transition-colors">Протокол за поверителност</span>
            <span className="hover:text-emerald-600 outline-none cursor-pointer transition-colors">Условия за ползване</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
