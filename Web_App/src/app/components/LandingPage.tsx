import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  ArrowRight, ShieldAlert, Activity, BookOpen, Scale, 
  Cpu, UserCheck, AlertCircle, Stethoscope, GraduationCap, UserCog,
  Info, ChevronDown, BarChart2
} from "lucide-react";

import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // We can use useAuth here if we want to redirect if already logged in
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
                       Q50,${80 + i*10} 100,100 T200,100 T300,100 
                       Q450,${50 - i*10} 500,100 T600,100 T700,100 
                       Q850,${150 + i*5} 900,100 T1000,100 T1100,100 
                       Q1250,${80 - i*5} 1300,100 T1400,100 T1500,100 
                       Q1650,${50 + i*10} 1700,100 T1800,100 T1900,100 T2000,100`}
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
            <span className="font-semibold text-xl tracking-tight">NeuroRisk Edu</span>
          </div>
          <div className="hidden sm:block text-sm text-emerald-800/70 font-medium bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 px-3 py-1 rounded-full">
            v1.1.0 Research Preview
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
              Live Educational System
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Interpretable <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                EEG Analysis
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
               A decision-support system designed to teach, not diagnose. 
               Explore real-time feature extraction and risk assessment in a safe environment.
            </p>

            {/* FIX 2: Explainability Teaser (List) */}
            <div className="flex flex-wrap gap-3 text-sm font-medium text-slate-500">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md">
                <Activity className="w-3.5 h-3.5" /> Hjorth Mobility
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md">
                <BarChart2 className="w-3.5 h-3.5" /> Signal Variance
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-md">
                <Cpu className="w-3.5 h-3.5" /> Spectral Power
              </span>
            </div>

            {/* FIX 4: Micro-interaction Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="group relative px-8 py-4 bg-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-200/50 overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Analysis as Student <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/login")}
                className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/30 transition-colors"
              >
                Instructor Login
              </motion.button>
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
                     <h3 className="font-bold text-slate-800 text-sm">Simulation Monitor</h3>
                     <p className="text-xs text-slate-500 flex items-center gap-1">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       Processing Stream
                     </p>
                   </div>
                 </div>
                 <span className="text-xs font-mono text-slate-400">CH-02: ACTIVE</span>
               </div>

               {/* Live Stats */}
               <div className="space-y-4 mb-6">
                 <div>
                   <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                     <span>RISK PROBABILITY</span>
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
                     <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Hjorth Mobility</p>
                     <p className="font-mono font-medium text-slate-700">{liveHjorth}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                     <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Spectral Entropy</p>
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
          <span className="text-xs font-medium uppercase tracking-widest">How it works</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ================= ABOUT THE PLATFORM ================= */}
      <section className="py-24 px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldAlert,
                title: "Risk Assessment",
                text: "Supports clinicians by highlighting potentially risky EEG patterns for review."
              },
              {
                icon: BookOpen,
                title: "Educational Analysis",
                text: "Allows students to explore signal characteristics and explain their interpretation."
              },
              {
                icon: Scale,
                title: "Ethical AI Design",
                text: "No diagnosis, no prediction — strictly decision support for human experts."
              }
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)" }}
                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm mb-6">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{card.title}</h3>
                <p className="text-slate-600 leading-relaxed">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-slate-900 text-center mb-16"
          >
            How the Model Works
          </motion.h2>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-emerald-100 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {[
                { title: "EEG Input", icon: Activity, desc: "Raw signal data ingestion" },
                { title: "Feature Extraction", icon: Cpu, desc: "Mathematical analysis of waves" },
                { title: "Risk Indicators", icon: AlertCircle, desc: "Pattern matching & scoring" },
                { title: "Human Review", icon: UserCheck, desc: "Expert clinical interpretation" },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center group"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, borderColor: "#10b981" }}
                    className="w-20 h-20 bg-white rounded-full border-4 border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 transition-colors shadow-sm mb-6 relative cursor-help"
                  >
                    <step.icon className="w-8 h-8" />
                    
                    {/* Tooltip */}
                    <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full mb-3 px-3 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap pointer-events-none shadow-lg">
                      Assists, does not diagnose
                    </div>
                  </motion.div>
                  <h4 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= INFLUENCE FACTORS ================= */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">What Influences the <br/> Risk Assessment?</h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Our educational model analyzes four key signal characteristics. 
              These factors are weighted to provide a risk probability score, 
              which must always be verified by a human expert.
            </p>
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3">
               <Info className="w-5 h-5 text-amber-600 shrink-0" />
               <p className="text-sm text-amber-900">
                 <strong>Note:</strong> High values in these metrics correlate with but do not guarantee seizure risk.
               </p>
            </div>
          </div>

          <div className="flex-1 w-full bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
            {[
              { label: "Signal Energy (RMS)", width: "75%" },
              { label: "Frequency Stability", width: "45%" },
              { label: "Temporal Variability", width: "85%" },
              { label: "Signal Complexity", width: "60%" },
            ].map((item, idx) => (
              <div key={idx} className="mb-6 last:mb-0 group cursor-default">
                <div className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                  <span>{item.label}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 text-xs">Analysis Factor</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: item.width }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    viewport={{ once: true }}
                    className="h-full bg-emerald-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ROLES ================= */}
      <section className="py-24 px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-slate-900 mb-4">Who Is This Platform For?</h2>
             <p className="text-slate-600">Tailored views for every stage of medical education.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { 
                 role: "Clinicians", 
                 icon: Stethoscope, 
                 actions: ["Review detailed risk reports", "Verify signal anomalies", "Make final assessments"] 
               },
               { 
                 role: "Students", 
                 icon: GraduationCap, 
                 actions: ["Practice signal interpretation", "Submit analysis for review", "Compare features to risk"] 
               },
               { 
                 role: "Supervisors", 
                 icon: UserCog, 
                 actions: ["Monitor student progress", "Annotate case studies", "Manage patient cohorts"] 
               },
             ].map((card, idx) => (
               <motion.div
                 key={idx}
                 whileHover={{ height: "auto", scale: 1.02 }}
                 className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-default group h-full"
               >
                 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                   <card.icon className="w-7 h-7" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-4">{card.role}</h3>
                 <ul className="space-y-3">
                   {card.actions.map((action, i) => (
                     <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                       {action}
                     </li>
                   ))}
                 </ul>
               </motion.div>
             ))}
           </div>
        </div>
      </section>

      {/* ================= ETHICS CLOSING ================= */}
      <section className="relative py-32 px-8 flex items-center justify-center overflow-hidden">
        {/* Calm Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 z-0">
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3] }} 
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full transform -skew-x-12"
          />
        </div>

        <div className="relative z-10 text-center max-w-2xl">
           <Scale className="w-10 h-10 text-emerald-700 mx-auto mb-6 opacity-80" />
           <h2 className="text-3xl md:text-4xl font-serif text-slate-800 mb-6 tracking-wide">
             "This system supports clinical judgment.<br/>
             It does not replace medical expertise."
           </h2>
           <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">
             Responsible AI in Medicine
           </p>
        </div>
      </section>

      {/* Footer Details */}
      <footer className="bg-white border-t border-slate-200 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500">
          <p>© 2026 Dept. of Neurology Education.</p>
          <div className="flex gap-6">
            <span className="hover:text-emerald-600 cursor-pointer">Privacy Protocol</span>
            <span className="hover:text-emerald-600 cursor-pointer">Research Guidelines</span>
            <span className="hover:text-emerald-600 cursor-pointer">System Status</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
