import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Play, Tv, Sparkles, ExternalLink } from 'lucide-react';
import { BannerSlide } from '../types';

interface BannerCarouselProps {
  banners: BannerSlide[];
  onBannerAction?: (banner: BannerSlide) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onBannerAction }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIdx] || banners[0];

  return (
    <div className="w-full relative px-4 pt-1 pb-3 select-none">
      {/* Banner Container: Exact 16:9 Aspect Ratio as requested */}
      <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden shadow-xl border border-slate-800/80 bg-[#0d131f]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            onClick={() => onBannerAction?.(currentBanner)}
            className="w-full h-full relative cursor-pointer overflow-hidden group"
          >
            {/* If banner has a rich background image */}
            <img
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              onError={(e) => {
                // Fallback to stylized anime banner gradient
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Ambient overlay gradient for contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Top Badge (if any) */}
            {currentBanner.badgeText && (
              <div className="absolute top-2.5 left-3 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-cyan-500/40 text-[9px] font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>{currentBanner.badgeText}</span>
              </div>
            )}

            {/* Bottom Content Bar */}
            <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between">
              <div className="max-w-[75%]">
                <h3 className="text-sm sm:text-base font-black text-white filter drop-shadow leading-tight truncate">
                  {currentBanner.title}
                </h3>
                {currentBanner.subtitle && (
                  <p className="text-[11px] text-slate-300 font-semibold filter drop-shadow truncate mt-0.5">
                    {currentBanner.subtitle}
                  </p>
                )}
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-cyan-500 text-black text-[10px] font-black shrink-0 flex items-center gap-1 shadow-md shadow-cyan-500/30">
                <span>OPEN</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`transition-all duration-300 rounded-full h-1.5 cursor-pointer ${
                currentIdx === idx
                  ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                  : 'w-1.5 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
