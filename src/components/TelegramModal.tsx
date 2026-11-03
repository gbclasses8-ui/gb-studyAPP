import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send } from 'lucide-react';

interface TelegramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramModal: React.FC<TelegramModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleJoin = () => {
    window.open('https://t.me/GBFreestudy', '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-[28px] bg-[#10141e] border border-slate-800 p-6 shadow-2xl relative overflow-hidden text-center"
        >
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-sky-500/10 blur-2xl pointer-events-none rounded-full" />

          {/* Telegram circle icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full border border-sky-500/40 bg-[#142033] flex items-center justify-center shadow-[0_0_20px_rgba(14,165,233,0.25)]">
              <Send className="w-8 h-8 text-sky-400 translate-x-[-1px] translate-y-[1px]" />
            </div>
          </div>

          {/* Title & description */}
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Join Telegram</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed px-2">
            Join our official channel for latest updates, notes &amp; new platform announcements.
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleJoin}
              className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#00b4d8] to-[#4361ee] hover:from-[#0096c7] hover:to-[#3f37c9] shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all cursor-pointer text-base"
            >
              Join Channel
            </button>

            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
