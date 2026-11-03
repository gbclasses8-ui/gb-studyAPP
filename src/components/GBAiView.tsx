import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bot, Camera, Brain, BookOpen, Bell, BellRing, Zap, Cpu } from 'lucide-react';

export const GBAiView: React.FC = () => {
  const [isNotified, setIsNotified] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleNotifyMe = () => {
    setIsNotified(true);
    setToastMessage('Aapko GB AI launch hote hi sabse pehle alert mil jayega! 🚀');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full px-4 pb-28 pt-2 select-none">
      {/* Top Badge */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101926]/90 border border-cyan-500/40 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-[11px] font-extrabold tracking-wider uppercase">
            NEXT-GEN AI STUDY ASSISTANT
          </span>
        </div>
      </div>

      {/* Hero Visual Container */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-b from-[#11192a] via-[#0e1422] to-[#0a0e18] border border-cyan-500/30 shadow-2xl text-center overflow-hidden mb-6">
        {/* Ambient background glows */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Futuristic Glowing AI Orb */}
        <div className="relative flex items-center justify-center mb-5">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 p-[2px] shadow-[0_0_35px_rgba(6,182,212,0.35)]">
            <div className="w-full h-full rounded-[22px] bg-[#0c1220] flex items-center justify-center relative overflow-hidden">
              <Bot className="w-12 h-12 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black tracking-tight text-white mb-2">
          GB <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">AI</span>
        </h2>

        {/* Coming Soon Glowing Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-cyan-500/20 border border-amber-400/50 mb-3 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
            COMING SOON
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
          Your personal AI Study Companion &amp; Instant 24/7 Doubt Solver for NEET, JEE &amp; Board Exams.
        </p>

        {/* Notify Button */}
        <div className="mt-5">
          <button
            onClick={handleNotifyMe}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              isNotified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-gradient-to-r from-[#00b4d8] to-[#4361ee] hover:from-[#0096c7] hover:to-[#3f37c9] text-white shadow-cyan-500/25 active:scale-[0.98]'
            }`}
          >
            {isNotified ? (
              <>
                <BellRing className="w-4 h-4 text-emerald-400" />
                <span>Launch Alert Activated! ✓</span>
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                <span>Notify Me on Launch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Teaser Capabilities */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Upcoming Capabilities
        </h3>

        <div className="p-4 rounded-3xl bg-[#101522] border border-slate-800/80 flex items-start gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Photo Doubt Solver</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Photo kheechein aur seconds me step-by-step Hindi &amp; English explanation paayein.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#101522] border border-slate-800/80 flex items-start gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Deep Concept Explanation</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Toughest Physics numericals aur Organic Chemistry reaction mechanisms ko aasan bhasha me samjhein.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-[#101522] border border-slate-800/80 flex items-start gap-3.5 shadow-lg">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Smart Revision Flashcards</h4>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Har chapter ke important formulas, shortcuts aur high-yield points automatically generate honge.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs shadow-2xl text-center animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
