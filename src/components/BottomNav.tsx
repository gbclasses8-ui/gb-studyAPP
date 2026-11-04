import React from 'react';
import { Home, Calendar, Bot, Sparkles } from 'lucide-react';

export type NavTab = 'platforms' | 'gb_ai' | 'upcoming';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none select-none">
      <nav className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-[#0d131f]/95 backdrop-blur-xl border border-slate-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.7)]">
        {/* 1. Platforms Tab */}
        <button
          onClick={() => onTabChange('platforms')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'platforms'
              ? 'bg-[#152338] text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_12px_rgba(6,182,212,0.25)] border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Platforms</span>
        </button>

        {/* 2. GB AI Tab (In between Platforms and Upcoming) */}
        <button
          onClick={() => onTabChange('gb_ai')}
          className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gb_ai'
              ? 'bg-gradient-to-r from-cyan-950 to-indigo-950 text-cyan-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_0_15px_rgba(6,182,212,0.35)] border border-cyan-400/50'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>GB AI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-0.5" />
        </button>

        {/* 3. Upcoming Tab */}
        <button
          onClick={() => onTabChange('upcoming')}
          className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-[#152338] text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_12px_rgba(6,182,212,0.25)] border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming</span>
        </button>
      </nav>
    </div>
  );
};
