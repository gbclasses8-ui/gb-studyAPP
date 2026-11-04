import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingPlatformModalProps {
  isOpen: boolean;
  platformName?: string;
}

export const LoadingPlatformModal: React.FC<LoadingPlatformModalProps> = ({ isOpen, platformName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="launching-platform-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-[260px] py-7 px-5 rounded-[26px] bg-[#0e1320] border border-cyan-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(6,182,212,0.15)] flex flex-col items-center justify-center space-y-4"
          >
            {/* Animated Cyan Spinner Arc */}
            <div className="w-10 h-10 rounded-full border-[3px] border-cyan-500/15 border-t-cyan-400 animate-spin" />

            {/* Launching Text */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-[15px] font-semibold text-white tracking-wide">
                Launching Platform...
              </span>
              {platformName && (
                <span className="text-xs text-cyan-400 font-medium mt-1 truncate max-w-[190px]">
                  {platformName}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
