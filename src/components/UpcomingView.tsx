import React, { useState } from 'react';
import { Calendar, Bell, BellRing, Users, Sparkles, Clock, ArrowRight, Layers } from 'lucide-react';
import { Platform } from '../types';
import { UPCOMING_EVENTS } from '../data/platformsData';
import { PlatformLogo } from './PlatformLogo';

interface UpcomingViewProps {
  upcomingPlatforms: Platform[];
  onSelectPlatform: (platform: Platform) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  upcomingPlatforms,
  onSelectPlatform,
}) => {
  const [remindedIds, setRemindedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleReminder = (id: string, title: string) => {
    if (remindedIds.includes(id)) {
      setRemindedIds(remindedIds.filter((item) => item !== id));
      showToast(`Reminder removed for: ${title}`);
    } else {
      setRemindedIds([...remindedIds, id]);
      showToast(`Reminder set! We will notify you before the event starts. 🔔`);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="w-full px-4 pb-28 pt-2 select-none">
      {/* Section Badge */}
      <div className="flex justify-center mb-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101926]/90 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-extrabold tracking-wider uppercase">
            UPCOMING PLATFORMS &amp; TESTS
          </span>
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          Upcoming{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Hub
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Platforms &amp; test series launching soon
        </p>
      </div>

      {/* 1. Upcoming Platforms Managed via Admin Panel */}
      {upcomingPlatforms.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Upcoming Platforms ({upcomingPlatforms.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 font-semibold">
              Added by Admin
            </span>
          </div>

          <div className="space-y-3">
            {upcomingPlatforms.map((platform) => (
              <div
                key={platform.id}
                onClick={() => onSelectPlatform(platform)}
                className="group p-4 rounded-3xl bg-[#101522] hover:bg-[#141b2c] border border-slate-800/90 hover:border-cyan-500/40 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <PlatformLogo platformId={platform.id} name={platform.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {platform.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        COMING SOON
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {platform.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-[#162132] group-hover:bg-cyan-500/20 border border-slate-700/60 flex items-center justify-center shrink-0 text-cyan-400">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Live Events & Tests */}
      <div className="space-y-3.5">
        <div className="px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Scheduled Test Series &amp; Webinars
          </span>
        </div>

        {UPCOMING_EVENTS.map((event) => {
          const isReminded = remindedIds.includes(event.id);

          return (
            <div
              key={event.id}
              className="p-4 rounded-3xl bg-[#101522] border border-slate-800/90 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                  {event.tag}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {event.platform}
                </span>
              </div>

              <h4 className="text-base font-bold text-white mb-2 leading-snug">
                {event.title}
              </h4>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{event.enrolled}</span>
                </div>
              </div>

              <button
                onClick={() => toggleReminder(event.id, event.title)}
                className={`w-full py-2.5 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isReminded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#162132] hover:bg-[#1c2a40] text-cyan-400 border border-slate-700/80 active:scale-[0.98]'
                }`}
              >
                {isReminded ? (
                  <>
                    <BellRing className="w-4 h-4 text-emerald-400" />
                    <span>Reminder Active</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Set Reminder</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {toastMessage && (
        <div className="fixed bottom-24 inset-x-4 max-w-sm mx-auto z-50 p-3 rounded-2xl bg-cyan-500 text-black font-extrabold text-xs shadow-2xl text-center animate-bounce">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
