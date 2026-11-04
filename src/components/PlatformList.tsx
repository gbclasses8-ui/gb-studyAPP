import React from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { Platform } from '../types';
import { PlatformLogo } from './PlatformLogo';

interface PlatformListProps {
  platforms: Platform[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPlatform: (platform: Platform) => void;
}

export const PlatformList: React.FC<PlatformListProps> = ({
  platforms,
  searchQuery,
  onSearchChange,
  onSelectPlatform,
}) => {
  return (
    <div className="w-full px-4 pb-28">
      {/* Section Badge */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101926]/90 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase">
            ULTRA PLATFORM HUB
          </span>
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Choose Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500">
            Platform
          </span>
        </h2>
      </div>

      {/* Search Input */}
      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search platforms, notes, features..."
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#111724] border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 text-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {[...platforms].sort((a, b) => (a.order ?? 999) - (b.order ?? 999)).map((platform) => (
          <div
            key={platform.id}
            onClick={() => onSelectPlatform(platform)}
            className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-3xl bg-[#101522] hover:bg-[#141b2c] border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99]"
          >
            {/* Left: Platform Logo + info */}
            <div className="flex items-center gap-3.5 min-w-0">
              <PlatformLogo platformId={platform.id} name={platform.name} logoUrl={platform.logo} size="md" />
              
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate group-hover:text-cyan-300 transition-colors">
                    {platform.name}
                  </h3>
                  {platform.id === 'gb-study' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      MAIN
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
                  {platform.subtitle}
                </p>
              </div>
            </div>

            {/* Right: Circular Arrow Action Button */}
            <div className="w-10 h-10 rounded-full bg-[#162132] group-hover:bg-cyan-500/20 border border-slate-700/60 group-hover:border-cyan-400/50 flex items-center justify-center shrink-0 ml-3 transition-colors shadow-sm">
              <ArrowRight className="w-5 h-5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        ))}

        {platforms.length === 0 && (
          <div className="py-12 px-4 text-center rounded-3xl bg-[#101522] border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 mx-auto flex items-center justify-center text-slate-500 mb-3">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            {searchQuery ? (
              <>
                <p className="text-slate-300 text-sm font-semibold">Koi platform match nahi hua</p>
                <p className="text-slate-500 text-xs mt-1">"{searchQuery}" ke liye koi result nahi mila</p>
                <button
                  onClick={() => onSearchChange('')}
                  className="mt-3 text-xs text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  Search Reset Karein
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-200 text-sm font-bold">Abhi koi platform add nahi hai</p>
                <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                  Header me <strong className="text-cyan-300">GB STUDY icon ko 10 baar dabakar</strong> Admin Panel se naye platforms aur links jodein!
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
