import React from 'react';

interface PlatformLogoProps {
  platformId: string;
  name: string;
  logoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlatformLogo: React.FC<PlatformLogoProps> = ({
  platformId,
  name,
  logoUrl,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs rounded-xl',
    md: 'w-14 h-14 text-sm rounded-2xl',
    lg: 'w-16 h-16 text-base rounded-2xl',
  }[size];

  // If a custom logo URL/photo is passed and is not the default icon, prefer it
  if (logoUrl && logoUrl.startsWith('data:image')) {
    return (
      <div className={`${sizeClasses} overflow-hidden shadow-lg border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0`}>
        <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (platformId === 'gb-study') {
    return (
      <div className={`${sizeClasses} overflow-hidden shadow-lg shadow-cyan-500/10 border border-slate-700/80 bg-slate-900 flex items-center justify-center shrink-0`}>
        <img
          src={logoUrl || '/app-icon.png'}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (platformId === 'pw') {
    return (
      <div className={`${sizeClasses} bg-black border border-white/20 flex items-center justify-center shrink-0 shadow-md`}>
        <div className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center">
          <span className="font-serif font-bold text-white text-base tracking-tighter">PW</span>
        </div>
      </div>
    );
  }

  if (platformId === 'mission-jeet') {
    return (
      <div className={`${sizeClasses} bg-black border border-zinc-700/80 flex flex-col items-center justify-center shrink-0 p-1`}>
        <span className="text-[9px] text-zinc-300 font-medium tracking-tight">Mission</span>
        <span className="text-xs font-black text-rose-500 tracking-wider">JEET</span>
      </div>
    );
  }

  if (platformId === 'pw-pi') {
    return (
      <div className={`${sizeClasses} bg-[#0b0c10] border border-zinc-700/80 flex items-center justify-center shrink-0 relative`}>
        <div className="flex items-baseline">
          <span className="font-bold text-white text-xl lowercase italic">pi</span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 mb-2"></span>
        </div>
      </div>
    );
  }

  if (platformId === 'pw-book') {
    return (
      <div className={`${sizeClasses} bg-white text-black border border-slate-300 flex flex-col items-center justify-center shrink-0 p-1`}>
        <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span className="text-[7px] font-bold tracking-tight text-zinc-800 uppercase mt-0.5">PW BOOKS</span>
      </div>
    );
  }

  if (platformId === 'pw-infinity-pass') {
    return (
      <div className={`${sizeClasses} bg-[#0a0a0f] border border-zinc-700 flex flex-col items-center justify-center shrink-0`}>
        <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center">
          <span className="font-serif italic font-bold text-white text-sm">PW</span>
        </div>
      </div>
    );
  }

  if (platformId === 'rwa') {
    return (
      <div className={`${sizeClasses} bg-white border-2 border-red-600 flex flex-col items-center justify-center shrink-0 overflow-hidden relative shadow-sm`}>
        <div className="absolute inset-0 border-[3px] border-red-600 rounded-2xl flex flex-col items-center justify-between p-1">
          <span className="text-[6px] font-black text-red-600 tracking-tighter">ROJGAR</span>
          <div className="flex -space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 inline-block"></span>
          </div>
          <span className="text-[6px] font-black text-red-600 tracking-tighter">ANKIT</span>
        </div>
      </div>
    );
  }

  if (platformId === 'vidykul') {
    return (
      <div className={`${sizeClasses} bg-[#5b21b6] border border-purple-400/40 flex flex-col items-center justify-center shrink-0 p-1`}>
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        <span className="text-[7px] font-extrabold text-white tracking-wider mt-0.5 uppercase">VIDYKUL</span>
      </div>
    );
  }

  if (platformId === 'gs-vision') {
    return (
      <div className={`${sizeClasses} bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 p-1`}>
        <div className="grid grid-cols-2 gap-1 w-5 h-5 items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
        </div>
        <span className="text-[7px] font-bold text-red-600 tracking-tighter mt-1">G.S. VISION</span>
      </div>
    );
  }

  if (platformId === 'future-kul') {
    return (
      <div className={`${sizeClasses} bg-[#111116] border border-zinc-700 flex flex-col items-center justify-center shrink-0 p-1`}>
        <span className="text-[9px] font-semibold text-zinc-300">FUTURE</span>
        <span className="text-[10px] font-bold text-amber-400 -mt-1">कुल</span>
      </div>
    );
  }

  if (platformId === 'apna-college') {
    return (
      <div className={`${sizeClasses} bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 p-1 text-center`}>
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
          🎓
        </div>
        <span className="text-[6.5px] font-black text-blue-900 tracking-tight mt-0.5 uppercase leading-none">APNA COLLEGE</span>
      </div>
    );
  }

  if (platformId === 'sachin-academy') {
    return (
      <div className={`${sizeClasses} bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0 p-1 text-center`}>
        <span className="text-[9px] font-black text-red-600">SACHIN</span>
        <span className="text-[7px] font-bold text-zinc-800 tracking-tighter">ACADEMY</span>
      </div>
    );
  }

  if (platformId === 'master-sahab') {
    return (
      <div className={`${sizeClasses} bg-zinc-900 border border-slate-700 flex flex-col items-center justify-center shrink-0 overflow-hidden relative`}>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
          <span className="text-sm">👨‍🏫</span>
        </div>
        <span className="text-[6.5px] font-bold text-cyan-400 mt-0.5 tracking-tighter">MASTER SAHAB</span>
      </div>
    );
  }

  if (platformId === 'unacademy') {
    return (
      <div className={`${sizeClasses} bg-[#0b1329] border border-cyan-800/40 flex flex-col items-center justify-center shrink-0 p-1 text-center`}>
        <div className="w-5 h-5 rounded-t-full border-t-2 border-l-2 border-r-2 border-emerald-400 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-t-full border-t border-l border-r border-cyan-300"></div>
        </div>
        <span className="text-[7px] font-bold text-white tracking-tighter mt-1">UNACADEMY</span>
      </div>
    );
  }

  // If custom URL photo or image is provided
  if (logoUrl) {
    return (
      <div className={`${sizeClasses} bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-md`}>
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Generic fallback
  return (
    <div className={`${sizeClasses} bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-cyan-400`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};
