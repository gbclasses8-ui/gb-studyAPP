import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, FileText, CheckCircle2, Download, BookOpen, Volume2, Maximize, FastForward } from 'lucide-react';
import { Batch } from '../types';

interface StudyModalProps {
  batch: Batch | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export const StudyModal: React.FC<StudyModalProps> = ({ batch, isOpen, onClose, isDarkMode }) => {
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(0);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [activeLecture, setActiveLecture] = useState<any>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1x');
  const [activeTab, setActiveTab] = useState<'lectures' | 'notes' | 'dpp'>('lectures');
  const [completedLectures, setCompletedLectures] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !batch) return null;

  const subjects = batch.subjects && batch.subjects.length > 0
    ? batch.subjects
    : [
        {
          id: 's1',
          name: 'Core Curriculum',
          chapters: [
            {
              id: 'c1',
              title: 'Chapter 01 : Fundamentals & Concept Building',
              lecturesCount: 4,
              dppCount: 4,
              notesCount: 4,
              lectures: [
                { id: 'l1', title: '01 : Introduction and Key Principles', duration: '1h 15m', teacherName: 'Top Faculty' },
                { id: 'l2', title: '02 : In-depth Topic Analysis', duration: '1h 22m', teacherName: 'Top Faculty' },
                { id: 'l3', title: '03 : Problem Solving & Previous Year Questions', duration: '1h 05m', teacherName: 'Top Faculty' },
              ]
            },
            {
              id: 'c2',
              title: 'Chapter 02 : Advanced Applications & Numerical Mastery',
              lecturesCount: 5,
              dppCount: 5,
              notesCount: 5,
              lectures: [
                { id: 'l4', title: '01 : Core Formulas and Shortcut Tricks', duration: '1h 10m', teacherName: 'Top Faculty' },
                { id: 'l5', title: '02 : High-Yield Questions Practice', duration: '1h 30m', teacherName: 'Top Faculty' },
              ]
            }
          ]
        }
      ];

  const currentSubject = subjects[selectedSubjectIdx] || subjects[0];
  const currentChapter = currentSubject.chapters[selectedChapterIdx] || currentSubject.chapters[0];

  const handleSelectLecture = (lec: any) => {
    setActiveLecture(lec);
  };

  const toggleComplete = (id: string) => {
    if (completedLectures.includes(id)) {
      setCompletedLectures(completedLectures.filter(item => item !== id));
    } else {
      setCompletedLectures([...completedLectures, id]);
      showToast('Marked as Completed! 🎉');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            isDarkMode
              ? 'bg-[#0f1422] border-slate-800 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Header */}
          <div className={`p-4 border-b flex items-center justify-between ${
            isDarkMode ? 'border-slate-800/80 bg-[#12192a]' : 'border-slate-100 bg-slate-50'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  FREE ACCESS
                </span>
                <span className="text-xs text-slate-400 font-semibold">{batch.name}</span>
              </div>
              <h3 className="text-lg font-bold tracking-tight mt-0.5">
                Classroom &amp; Study Room
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Player Screen if lecture is playing */}
          {activeLecture ? (
            <div className="bg-black relative aspect-video flex flex-col items-center justify-center border-b border-slate-800">
              <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-t from-black via-zinc-950 to-zinc-900">
                <div className="w-full flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-cyan-400 truncate max-w-[70%]">
                    {activeLecture.title}
                  </span>
                  <button
                    onClick={() => setActiveLecture(null)}
                    className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Close Player
                  </button>
                </div>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => {
                      const speeds = ['1x', '1.25x', '1.5x', '2x'];
                      const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                      setPlaybackSpeed(next);
                    }}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                  >
                    {playbackSpeed}
                  </button>
                  <div className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center text-black shadow-lg shadow-cyan-500/40 cursor-pointer animate-pulse">
                    <Play className="w-6 h-6 fill-black ml-0.5" />
                  </div>
                  <div className="text-xs text-slate-400">
                    <span className="text-white font-bold">Live Stream</span>
                  </div>
                </div>

                <div className="w-full flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Teacher: {activeLecture.teacherName}</span>
                  </div>
                  <span>Duration: {activeLecture.duration}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={`p-4 border-b flex items-center gap-3 ${
              isDarkMode ? 'bg-[#151c2d] border-slate-800' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <BookOpen className="w-5 h-5 text-cyan-500" />
              <div className="text-xs text-slate-400">
                Tap on any lecture below to start watching video lectures and download revision notes.
              </div>
            </div>
          )}

          {/* Subject Pills */}
          <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto no-scrollbar ${
            isDarkMode ? 'border-slate-800/80 bg-[#0c111c]' : 'border-slate-100 bg-slate-50'
          }`}>
            {subjects.map((sub, idx) => (
              <button
                key={sub.id}
                onClick={() => {
                  setSelectedSubjectIdx(idx);
                  setSelectedChapterIdx(0);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubjectIdx === idx
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : isDarkMode
                    ? 'bg-slate-800/80 text-slate-400 hover:text-white'
                    : 'bg-white text-slate-600 hover:text-black border border-slate-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>

          {/* Chapters & Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Chapter Selection */}
            <div>
              <label className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mb-1.5 block">
                Select Chapter
              </label>
              <div className="space-y-1.5">
                {currentSubject.chapters.map((chap, cIdx) => (
                  <button
                    key={chap.id}
                    onClick={() => setSelectedChapterIdx(cIdx)}
                    className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      selectedChapterIdx === cIdx
                        ? isDarkMode
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                          : 'bg-cyan-50 border border-cyan-300 text-cyan-900'
                        : isDarkMode
                        ? 'bg-[#141b2a] border border-slate-800 text-slate-300 hover:bg-[#1a2337]'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate pr-2">{chap.title}</span>
                    <span className="text-[10px] opacity-70 shrink-0">
                      {chap.lecturesCount} Lectures
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Tabs (Lectures / Notes / DPP) */}
            <div className="pt-2">
              <div className="flex border-b border-slate-800 mb-3">
                <button
                  onClick={() => setActiveTab('lectures')}
                  className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'lectures'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Lectures ({currentChapter.lectures?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'notes'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Class Notes PDF
                </button>
                <button
                  onClick={() => setActiveTab('dpp')}
                  className={`pb-2 px-3 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                    activeTab === 'dpp'
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  DPP &amp; Quiz
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === 'lectures' && (
                <div className="space-y-2">
                  {currentChapter.lectures?.map((lec) => {
                    const isDone = completedLectures.includes(lec.id);
                    return (
                      <div
                        key={lec.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                          isDarkMode
                            ? 'bg-[#131a29] border-slate-800/90 hover:border-slate-700'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => handleSelectLecture(lec)}
                            className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 hover:bg-cyan-500 hover:text-black transition-colors cursor-pointer"
                          >
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </button>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold truncate">{lec.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {lec.teacherName} • {lec.duration}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleComplete(lec.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isDone
                              ? 'text-emerald-400 bg-emerald-500/10'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title={isDone ? 'Completed' : 'Mark as completed'}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-2">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        isDarkMode
                          ? 'bg-[#131a29] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold">
                            Lecture {num} Hand-Written Notes
                          </h5>
                          <p className="text-[10px] text-slate-400">PDF Document • 4.2 MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Downloaded Lecture ${num} Notes PDF!`)}
                        className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'dpp' && (
                <div className="space-y-2">
                  {[1, 2].map((num) => (
                    <div
                      key={num}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        isDarkMode
                          ? 'bg-[#131a29] border-slate-800'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold">Daily Practice Problem {num}</h5>
                          <p className="text-[10px] text-slate-400">15 Questions • 45 Mins</p>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`Starting DPP ${num} Quiz Test!`)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                      >
                        Start DPP
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-2.5 bg-emerald-500 text-black font-bold text-xs text-center animate-bounce">
              {toastMessage}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
