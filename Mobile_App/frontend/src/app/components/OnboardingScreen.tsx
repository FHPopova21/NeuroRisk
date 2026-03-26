import { motion } from "motion/react";
import { Activity } from "lucide-react";

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-screen bg-gradient-to-br from-[#030213] via-[#111026] to-[#1a193d] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[15%] left-[10%] size-20 rounded-full bg-white/5 blur-xl"></div>
      <div className="absolute bottom-[20%] right-[15%] size-32 rounded-full bg-white/5 blur-xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        {/* Brain illustration with EEG wave */}
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="size-40 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
          >
            <Activity className="size-20 text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Animated EEG wave */}
          <motion.svg
            className="absolute -bottom-4 left-1/2 -translate-x-1/2"
            width="160"
            height="40"
            viewBox="0 0 160 40"
          >
            <motion.path
              d="M0,20 Q10,10 20,20 T40,20 Q50,30 60,20 T80,20 Q90,10 100,20 T120,20 Q130,30 140,20 T160,20"
              stroke="white"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.svg>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3 mt-12">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Разберете мозъчната си активност
          </h1>
          <p className="text-gray-300 text-lg max-w-md">
            Наблюдение в реално време. По-интелигентни прозрения.
          </p>
        </div>

        {/* Get Started button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="mt-8 px-10 py-4 bg-white text-[#030213] font-bold rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          Започнете
        </motion.button>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-12 text-white/60 text-sm"
      >
        NeuroRisk Platform
      </motion.div>
    </div>
  );
}
