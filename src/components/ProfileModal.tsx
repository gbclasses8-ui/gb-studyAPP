import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Edit2, Check } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  studentName: string;
  activeMinutes: number;
  onClose: () => void;
  onUpdateName: (newName: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  studentName,
  activeMinutes,
  onClose,
  onUpdateName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(studentName);

  if (!isOpen) return null;

  const hours = Math.floor(activeMinutes / 60);
  const minutes = activeMinutes % 60;
  const activeTimeString = `${hours}h ${minutes}m`;

  const handleSave = () => {
    if (editedName.trim()) {
      onUpdateName(editedName.trim());
    }
    setIsEditing(false);
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

          {/* Title & subtitle */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Student Analytics</h2>
            <p className="text-sm text-slate-400 mt-1">
              Your registered account information
            </p>
          </div>

          {/* Stats info box */}
          <div className="rounded-2xl bg-[#151c2a] border border-slate-800 p-4 space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Student Name</span>
              {isEditing ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-28 px-2 py-0.5 rounded bg-slate-900 border border-cyan-500 text-white font-bold text-sm focus:outline-none"
                    autoFocus
                  />
                  <button onClick={handleSave} className="p-1 rounded bg-cyan-600 text-white hover:bg-cyan-500">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold tracking-wide">{studentName}</span>
                  <button
                    onClick={() => {
                      setEditedName(studentName);
                      setIsEditing(true);
                    }}
                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="h-[1px] bg-slate-800/80 w-full" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Active Time</span>
              <span className="text-white font-bold tracking-wide">{activeTimeString}</span>
            </div>

            <div className="h-[1px] bg-slate-800/80 w-full" />

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Access</span>
              <span className="text-white font-bold tracking-wide">Full Access (Free)</span>
            </div>
          </div>

          {/* Close Profile button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white bg-gradient-to-r from-[#00b4d8] to-[#4361ee] hover:from-[#0096c7] hover:to-[#3f37c9] shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer text-base"
          >
            Close Profile
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
