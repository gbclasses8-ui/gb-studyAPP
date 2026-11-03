import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, ChevronLeft, Moon, Sun, Search, Users, Calendar, GraduationCap, Bookmark, Check } from 'lucide-react';
import { Platform, Batch } from '../types';
import { BATCHES_DATA } from '../data/platformsData';
import { StudyModal } from './StudyModal';
import { DrawerMenu } from './DrawerMenu';

interface BatchesViewProps {
  platform: Platform;
  onBack: () => void;
  enrolledBatches: string[];
  onToggleEnroll: (batchId: string) => void;
}

export const BatchesView: React.FC<BatchesViewProps> = ({
  platform,
  onBack,
  enrolledBatches,
  onToggleEnroll,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStudyBatch, setSelectedStudyBatch] = useState<Batch | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter batches for this platform
  const platformBatches = BATCHES_DATA.filter(
    (b) => b.platformId === platform.id || (platform.id === 'pw' && b.platformId === 'pw') || platform.id === 'gb-study'
  );

  const filteredBatches = (platformBatches.length > 0 ? platformBatches : BATCHES_DATA.slice(0, 4)).filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.targetExam.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || batch.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEnrollClick = (batchId: string, batchName: string) => {
    onToggleEnroll(batchId);
    if (!enrolledBatches.includes(batchId)) {
      setToastMessage(`Enrolled successfully in ${batchName}! Free access unlocked.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 select-none ${
      isDarkMode ? 'bg-[#0a0e17] text-white' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-30 px-4 py-3 border-b flex items-center justify-between backdrop-blur-md transition-colors ${
        isDarkMode
          ? 'bg-[#0f1422]/90 border-slate-800/80 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
            }`}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={onBack}
            className={`flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer ${
              isDarkMode ? 'hover:text-cyan-400 text-slate-200' : 'hover:text-cyan-700 text-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Dark/Light toggle (Moon icon like video frame 033-035) */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isDarkMode
              ? 'hover:bg-slate-800 text-slate-300 hover:text-amber-300'
              : 'hover:bg-slate-100 text-slate-700 hover:text-amber-500'
          }`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500" />}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Batches
        </h1>

        {/* Search Bar with Green Search Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Your Batch"
              className={`w-full pl-10 pr-3 py-2.5 rounded-2xl text-sm transition-all focus:outline-none ${
                isDarkMode
                  ? 'bg-[#121828] border border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
                  : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
              }`}
            />
          </div>
          <button
            onClick={() => {}}
            className="px-5 py-2.5 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Search
          </button>
        </div>

        {/* Promo Banner with 3 Dots */}
        <div className="space-y-2">
          <div className="w-full rounded-2xl overflow-hidden border border-slate-800 shadow-md">
            <img
              src="/batches/pw_power_banner.jpg"
              alt="Power Batch JEE 2027"
              className="w-full h-auto object-cover"
              onError={(e) => {
                // fallback styled banner
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex justify-center items-center gap-1.5 pt-0.5">
            <span className="w-3.5 h-1.5 rounded-full bg-slate-500" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['All', 'NEET', 'JEE', 'Class 11', 'Foundation', 'SSC / State Exams'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-black'
                  : isDarkMode
                  ? 'bg-[#151c2d] text-slate-400 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-600 hover:text-black border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Batch Cards or Skeleton Loader */}
        {isLoading ? (
          /* Skeleton Loader as shown at 00:33 in video */
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((i) => (
              <div
                key={i}
                className={`p-4 rounded-3xl border space-y-3 ${
                  isDarkMode ? 'bg-[#101624] border-slate-800/80' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className={`h-5 w-32 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className={`h-5 w-12 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
                <div className={`w-full aspect-[2.2/1] rounded-2xl ${isDarkMode ? 'bg-slate-800/80' : 'bg-slate-200'}`} />
                <div className={`h-4 w-44 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-4 w-56 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`h-6 w-28 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="flex gap-2 pt-1">
                  <div className={`h-11 flex-1 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                  <div className={`h-11 flex-1 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBatches.map((batch) => {
              const isEnrolled = enrolledBatches.includes(batch.id);

              return (
                <div
                  key={batch.id}
                  className={`p-4 rounded-3xl border shadow-xl transition-all ${
                    isDarkMode
                      ? 'bg-[#101625] border-slate-800/90'
                      : 'bg-white border-slate-200/90 shadow-slate-200/50'
                  }`}
                >
                  {/* Batch Title & Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold tracking-tight">
                      {batch.name}
                    </h3>
                    {batch.badge && (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-black font-extrabold text-[11px] shadow-sm">
                        {batch.badge}
                      </span>
                    )}
                  </div>

                  {/* Batch Image Banner */}
                  <div className="w-full aspect-[2.1/1] rounded-2xl overflow-hidden mb-3 border border-slate-800/40 relative bg-slate-900">
                    <img
                      src={batch.bannerImage}
                      alt={batch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/batches/yakeen_banner.jpg';
                      }}
                    />
                  </div>

                  {/* Aspirants Info */}
                  <div className="space-y-1.5 mb-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-semibold text-slate-300">{batch.targetExam}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>Starts on</span>
                        <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{batch.startDate}</strong>
                        <span className="mx-1 text-slate-600">|</span>
                        <span>Ends on</span>
                        <strong className={isDarkMode ? 'text-white' : 'text-slate-900'}>{batch.endDate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Price Row */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl font-black text-emerald-400">
                      ₹ {batch.discountedPrice}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 line-through">
                      ₹{batch.originalPrice}
                    </span>
                  </div>

                  {/* 100% Free For Students Pill Badge */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-[#22c55e] text-black shadow-sm">
                      {batch.freeBadgeText}
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center gap-2.5">
                    {/* Study Button */}
                    <button
                      onClick={() => setSelectedStudyBatch(batch)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                        isDarkMode
                          ? 'bg-[#151d2f] hover:bg-[#1a253b] text-white border border-slate-700/80 active:scale-[0.98]'
                          : 'bg-slate-900 hover:bg-black text-white active:scale-[0.98]'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Study</span>
                    </button>

                    {/* Enroll Now Button */}
                    <button
                      onClick={() => handleEnrollClick(batch.id, batch.name)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-[0.98] ${
                        isEnrolled
                          ? 'bg-slate-700 text-emerald-300 border border-emerald-500/50'
                          : 'bg-[#22c55e] hover:bg-[#16a34a] text-black'
                      }`}
                    >
                      {isEnrolled ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Enrolled</span>
                        </>
                      ) : (
                        <>
                          <span>Enroll Now</span>
                          <Bookmark className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredBatches.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm">No batches match "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-xs text-emerald-400 font-bold hover:underline"
                >
                  Show All Batches
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Study Classroom Modal */}
      <StudyModal
        batch={selectedStudyBatch}
        isOpen={!!selectedStudyBatch}
        onClose={() => setSelectedStudyBatch(null)}
        isDarkMode={isDarkMode}
      />

      {/* Hamburger Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        isDarkMode={isDarkMode}
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 p-3.5 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
