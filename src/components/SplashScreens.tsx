import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreensProps {
  onComplete: () => void;
  isTransitionOnly?: boolean; // When backing out of batches
}

export const SplashScreens: React.FC<SplashScreensProps> = ({ onComplete, isTransitionOnly = false }) => {
  const [phase, setPhase] = useState<'gold' | 'aura' | 'done'>(isTransitionOnly ? 'aura' : 'gold');

  useEffect(() => {
    if (isTransitionOnly) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1400);
      return () => clearTimeout(timer);
    }

    // Full startup splash sequence
    const goldTimer = setTimeout(() => {
      setPhase('aura');
    }, 1800);

    const completeTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(goldTimer);
      clearTimeout(completeTimer);
    };
  }, [isTransitionOnly, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] select-none">
      <AnimatePresence mode="wait">
        {phase === 'gold' && !isTransitionOnly && (
          <motion.div
            key="gold-splash"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center w-full h-full bg-[#181c22] p-6 relative overflow-hidden"
          >
            {/* Ambient luxury golden radial aura */}
            <div className="absolute w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />

            {/* User requested splash image from https://ibb.co/JjBwJ0Fb (refined, slightly smaller) */}
            <div className="relative z-10 w-52 h-52 sm:w-60 sm:h-60 rounded-full p-2 bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-700 shadow-[0_0_40px_rgba(245,158,11,0.3)] flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-amber-300/60 shadow-inner">
                <img
                  src="/splash_sarvottam.jpg"
                  alt="SARVOTTAM YADAV"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'aura' && (
          <motion.div
            key="aura-splash"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.45 }}
            className="relative flex flex-col items-center justify-center w-full h-full bg-[#07090e] p-6 overflow-hidden"
          >
            {/* Colorful rainbow circular aura glow behind icon */}
            <div className="relative flex items-center justify-center mb-8">
              <div 
                className="absolute w-64 h-64 rounded-full opacity-70 blur-3xl animate-pulse"
                style={{
                  background: 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(59,130,246,0.4) 35%, rgba(16,185,129,0.3) 70%, rgba(245,158,11,0.2) 100%)'
                }}
              />
              
              {/* App icon squircle */}
              <motion.div 
                initial={{ scale: 0.8, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="relative z-10 w-32 h-32 rounded-3xl p-1 bg-gradient-to-b from-white/30 via-slate-400/20 to-black/60 shadow-2xl backdrop-blur-md border border-white/20 overflow-hidden"
              >
                <img
                  src="/app-icon.png"
                  alt="GB STUDY"
                  className="w-full h-full object-cover rounded-[22px]"
                />
              </motion.div>
            </div>

            {/* Title: GB STUDY */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center justify-center mb-3 text-center"
            >
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                <span>gbstudy</span>
                <span className="text-[#38bdf8]">.hub</span>
              </h1>
            </motion.div>

            {/* Subtitle Pill: SARVOTTAM YADAV */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="px-5 py-1.5 rounded-full bg-[#121824]/90 border border-slate-700/80 shadow-inner flex items-center justify-center"
            >
              <span className="text-xs font-bold tracking-[0.18em] text-slate-300 uppercase">
                SARVOTTAM <span className="text-cyan-400">YADAV</span>
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
