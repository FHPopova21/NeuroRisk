import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Activity } from "lucide-react";

export function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-gradient-to-b from-green-400 via-emerald-300 to-cyan-200 flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Ambient floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          initial={{
            x: Math.random() * 400,
            y: Math.random() * 800,
          }}
          animate={{
            y: [null, Math.random() * 800],
            x: [null, Math.random() * 400],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Animated Brain Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative mb-16 z-10"
      >
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 w-56 h-56 rounded-full bg-white/20 blur-xl -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
        />

        {/* Brain Circle Container */}
        <div className="relative w-56 h-56">
          {/* Main brain circle with glassmorphism */}
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center relative shadow-2xl"
          >
            {/* Inner brain icon container */}
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-28 h-28 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border-2 border-white/50"
            >
              <Activity className="w-20 h-20 text-white drop-shadow-lg" strokeWidth={2} />
            </motion.div>

            {/* Smooth EEG Wave Animation across the brain */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 224 224"
                className="absolute inset-0"
              >
                {/* Multiple wave layers for depth */}
                <motion.path
                  d="M 0 112 Q 28 112 28 80 T 56 80 Q 70 80 70 112 T 84 112 Q 98 112 98 90 T 112 90 Q 126 90 126 112 T 140 112 Q 154 112 154 95 T 168 95 Q 182 95 182 112 T 196 112 Q 210 112 210 105 T 224 105"
                  stroke="white"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 1, 1, 0],
                    opacity: [0, 1, 1, 0],
                    x: [-224, 0, 224],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
                
                {/* Second wave with delay */}
                <motion.path
                  d="M 0 112 Q 28 112 28 80 T 56 80 Q 70 80 70 112 T 84 112 Q 98 112 98 90 T 112 90 Q 126 90 126 112 T 140 112 Q 154 112 154 95 T 168 95 Q 182 95 182 112 T 196 112 Q 210 112 210 105 T 224 105"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 1, 1, 0],
                    opacity: [0, 0.5, 0.5, 0],
                    x: [-224, 0, 224],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 1,
                  }}
                />
              </svg>
            </div>

            {/* Pulse rings emanating from center */}
            <motion.div
              animate={{
                scale: [1, 2.2],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
              }}
              className="absolute inset-0 rounded-full border-2 border-white"
            />
            <motion.div
              animate={{
                scale: [1, 2.2],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: 1,
              }}
              className="absolute inset-0 rounded-full border-2 border-white"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-center mb-16 z-10 px-4"
      >
        <h1 className="text-4xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
          Разберете вашата мозъчна активност
        </h1>
        <p className="text-xl text-white/95 drop-shadow-md">
          Мониторинг в реално време. По-умни прозрения.
        </p>
      </motion.div>

      {/* Get Started Button */}
      <motion.button
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/")}
        className="relative z-10 bg-white text-green-600 px-16 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all"
      >
        Започнете
      </motion.button>

      {/* Bottom gradient overlay for depth */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-200/50 to-transparent pointer-events-none" />
    </div>
  );
}