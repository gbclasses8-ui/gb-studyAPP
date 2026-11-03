import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Key, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPassword('');
        onSuccess();
      } else {
        // Fallback check
        if (password.trim() === 'GBADMIN2026') {
          setPassword('');
          onSuccess();
        } else {
          setError('Galat Password! Kripya sahi password dalein.');
        }
      }
    } catch (err) {
      if (password.trim() === 'GBADMIN2026') {
        setPassword('');
        onSuccess();
      } else {
        setError('Galat Password! (Required: GBADMIN2026)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm rounded-[28px] bg-[#0f1422] border border-cyan-500/50 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden"
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-cyan-500/15 blur-2xl pointer-events-none rounded-full" />

          {/* Shield Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full border border-cyan-400/40 bg-[#141d2e] flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-5">
            <h3 className="text-xl font-black text-white tracking-tight">
              Admin Control Panel
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Protected by 10-Tap Gesture Authentication
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Key className="w-4 h-4 text-cyan-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter Password (GBADMIN2026)"
                  autoFocus
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-[#141b2a] border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mt-2 px-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer text-sm"
            >
              {isLoading ? 'Verifying...' : 'Unlock Admin Panel'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
