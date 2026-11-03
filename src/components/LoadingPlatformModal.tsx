import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingPlatformModalProps {
  isOpen: boolean;
}

export const LoadingPlatformModal: React.FC<LoadingPlatformModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-[270px] py-7 px-6 rounded-[28px] bg-[#10141f] border border-cyan-500/30 shadow-2xl flex flex-col items-center justify-center space-y-4"
        >
          {/* Animated Cyan Spinner */}
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />

          {/* Text */}
          <span className="text-sm font-bold text-white tracking-wide">
            Launching Platform...
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
