import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onSave }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'SARVOTTAM';
    onSave(finalName);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-sm rounded-[28px] bg-[#10141e] border border-slate-800 p-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/10 blur-2xl pointer-events-none rounded-full" />

          {/* User circle icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full border border-cyan-500/40 bg-[#141b2a] flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <User className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          {/* Title & description */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Student</h2>
            <p className="text-sm text-slate-400 mt-1">
              Enter your full name to start learning.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                autoFocus
                className="w-full px-4 py-3.5 rounded-2xl bg-[#151c2a] border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-base transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#00b4d8] to-[#4361ee] hover:from-[#0096c7] hover:to-[#3f37c9] shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer text-base"
            >
              Start Exploring
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
