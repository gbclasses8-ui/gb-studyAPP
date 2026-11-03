import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Share2, Star, Info, ShieldCheck, Heart } from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GB STUDY - SARVOTTAM YADAV',
        text: 'Access 200+ Free Study Platforms and Batches on GB STUDY!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className={`relative z-10 w-72 sm:w-80 h-full p-5 flex flex-col justify-between shadow-2xl ${
            isDarkMode ? 'bg-[#0f1422] text-white border-r border-slate-800' : 'bg-white text-slate-900 border-r border-slate-200'
          }`}
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden shadow-md">
                  <img src="/app-icon.png" alt="GB STUDY" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    GB STUDY
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    SARVOTTAM YADAV
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu items */}
            <div className="py-5 space-y-2">
              <button
                onClick={() => {
                  window.open('https://t.me/GBFreestudy', '_blank');
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-cyan-500/10 text-cyan-400' : 'hover:bg-cyan-50 text-cyan-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Send className="w-4 h-4 text-cyan-400" />
                </div>
                <span>Official Telegram</span>
              </button>

              <button
                onClick={handleShare}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-blue-400" />
                </div>
                <span>Share App With Friends</span>
              </button>

              <button
                onClick={() => {
                  alert('Thank you for rating GB STUDY 5 Stars! 🌟');
                  onClose();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <span>Rate Us on Store</span>
              </button>

              <button
                onClick={() => {
                  alert('GB STUDY v3.4.0\nCreated by SARVOTTAM YADAV\nFree access to educational batches & platforms.');
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Info className="w-4 h-4 text-emerald-400" />
                </div>
                <span>About Platform</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-700/50 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-medium">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Students</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              GB STUDY • SARVOTTAM YADAV
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
