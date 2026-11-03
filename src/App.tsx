import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon } from 'lucide-react';
import { Platform, BannerSlide, UserProfile } from './types';
import { SplashScreens } from './components/SplashScreens';
import { WelcomeModal } from './components/WelcomeModal';
import { TelegramModal } from './components/TelegramModal';
import { ProfileModal } from './components/ProfileModal';
import { BannerCarousel } from './components/BannerCarousel';
import { PlatformList } from './components/PlatformList';
import { BatchesView } from './components/BatchesView';
import { UpcomingView } from './components/UpcomingView';
import { GBAiView } from './components/GBAiView';
import { BottomNav, NavTab } from './components/BottomNav';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LoadingPlatformModal } from './components/LoadingPlatformModal';

// Safe localStorage wrappers to prevent any quota crash
function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Storage] Failed to save key "${key}":`, err);
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}

export default function App() {
  // Database / Backend State with localStorage fallback for 100% persistence
  const [platforms, setPlatforms] = useState<Platform[]>(() => {
    try {
      const saved = safeGetItem('gb_study_platforms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = safeGetItem('gb_study_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // Keep ref to always have latest state during async sync
  const platformsRef = useRef<Platform[]>(platforms);
  useEffect(() => {
    platformsRef.current = platforms;
  }, [platforms]);

  const bannersRef = useRef<BannerSlide[]>(banners);
  useEffect(() => {
    bannersRef.current = banners;
  }, [banners]);

  // App state & user profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = safeGetItem('gb_study_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: 'SARVOTTAM',
      enrolledBatches: ['yakeen-2027'],
      activeMinutes: 0,
      hasSeenWelcome: false,
      hasSeenTelegram: false,
    };
  });

  // Flow states
  const [showSplash, setShowSplash] = useState(true);
  const [isTransitionSplash, setIsTransitionSplash] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Platform Launch animation modal state
  const [isLaunchingPlatform, setIsLaunchingPlatform] = useState(false);

  // Admin 10-tap gesture state
  const [iconTapCount, setIconTapCount] = useState(0);
  const tapResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  
  // Navigation & Platform selection (Platforms, GB AI, Upcoming)
  const [activeTab, setActiveTab] = useState<NavTab>('platforms');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [activeScreen, setActiveScreen] = useState<'main' | 'batches'>('main');

  // Helper for deleted IDs tracking
  const getDeletedPlatformIds = (): Set<string> => {
    try {
      const saved = safeGetItem('gb_deleted_platform_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set<string>();
  };

  const getDeletedBannerIds = (): Set<string> => {
    try {
      const saved = safeGetItem('gb_deleted_banner_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set<string>();
  };

  // Safe Non-Destructive Bidirectional Synchronization
  const refreshBackendData = async () => {
    try {
      const [platRes, banRes] = await Promise.all([
        fetch('/api/platforms').catch(() => null),
        fetch('/api/banners').catch(() => null),
      ]);

      const deletedPlatformIds = getDeletedPlatformIds();
      const deletedBannerIds = getDeletedBannerIds();

      // Platforms Non-Destructive Merge
      if (platRes && platRes.ok) {
        const platData = await platRes.json().catch(() => null);
        if (Array.isArray(platData)) {
          const map = new Map<string, Platform>();

          // 1. Preserve current local platforms unless explicitly deleted
          (platformsRef.current || []).forEach((p) => {
            if (!deletedPlatformIds.has(p.id)) {
              map.set(p.id, p);
            }
          });

          // 2. Merge server platforms unless explicitly deleted
          platData.forEach((sp: Platform) => {
            if (!deletedPlatformIds.has(sp.id)) {
              const existing = map.get(sp.id);
              map.set(sp.id, existing ? { ...existing, ...sp } : sp);
            }
          });

          const mergedPlatforms = Array.from(map.values()).sort(
            (a, b) => (a.order ?? 999) - (b.order ?? 999)
          );

          setPlatforms(mergedPlatforms);
          safeSetItem('gb_study_platforms', JSON.stringify(mergedPlatforms));

          // If local has platforms missing on server, bulk sync to server
          const serverIdSet = new Set(platData.map((p: any) => p.id));
          const missingOnServer = mergedPlatforms.filter((p) => !serverIdSet.has(p.id));
          if (missingOnServer.length > 0) {
            fetch('/api/platforms/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                platforms: mergedPlatforms,
                deletedIds: Array.from(deletedPlatformIds),
              }),
            }).catch(() => null);
          }
        }
      }

      // Banners Non-Destructive Merge
      if (banRes && banRes.ok) {
        const banData = await banRes.json().catch(() => null);
        if (Array.isArray(banData)) {
          const bannerMap = new Map<string, BannerSlide>();

          (bannersRef.current || []).forEach((b) => {
            if (!deletedBannerIds.has(b.id)) {
              bannerMap.set(b.id, b);
            }
          });

          banData.forEach((sb: BannerSlide) => {
            if (!deletedBannerIds.has(sb.id)) {
              const existing = bannerMap.get(sb.id);
              bannerMap.set(sb.id, existing ? { ...existing, ...sb } : sb);
            }
          });

          const mergedBanners = Array.from(bannerMap.values());
          setBanners(mergedBanners);
          safeSetItem('gb_study_banners', JSON.stringify(mergedBanners));
        }
      }
    } catch (err) {
      console.warn('Backend sync error (cached state preserved):', err);
    }
  };

  useEffect(() => {
    refreshBackendData();
    // Non-destructive auto sync every 10 seconds
    const syncInterval = setInterval(refreshBackendData, 10000);
    return () => clearInterval(syncInterval);
  }, []);

  // Save profile changes to localStorage
  useEffect(() => {
    safeSetItem('gb_study_profile', JSON.stringify(profile));
  }, [profile]);

  // Active time incrementer
  useEffect(() => {
    const interval = setInterval(() => {
      setProfile((prev) => ({
        ...prev,
        activeMinutes: prev.activeMinutes + 1,
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle 10-tap secret admin trigger on the GB STUDY icon
  const handleIconTap = () => {
    const nextCount = iconTapCount + 1;
    setIconTapCount(nextCount);

    if (tapResetTimerRef.current) {
      clearTimeout(tapResetTimerRef.current);
    }

    if (nextCount >= 10) {
      setIconTapCount(0);
      setShowAdminLogin(true);
    } else {
      // Reset if no tap within 3.5 seconds
      tapResetTimerRef.current = setTimeout(() => {
        setIconTapCount(0);
      }, 3500);
    }
  };

  // Direct instant add/update platform in local state & cache
  const handleAddOrUpdatePlatformDirect = (platform: Platform) => {
    // Unmark from deleted if it was deleted before
    const deleted = getDeletedPlatformIds();
    if (deleted.has(platform.id)) {
      deleted.delete(platform.id);
      safeSetItem('gb_deleted_platform_ids', JSON.stringify(Array.from(deleted)));
    }

    setPlatforms((prev) => {
      const index = prev.findIndex((p) => p.id === platform.id);
      let updated: Platform[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = platform;
      } else {
        updated = [...prev, platform];
      }
      // Sort by order ascending
      updated.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
      safeSetItem('gb_study_platforms', JSON.stringify(updated));
      return updated;
    });
  };

  // Direct reorder platforms in local state & cache
  const handleReorderPlatformsDirect = (orderedList: Platform[]) => {
    setPlatforms(orderedList);
    safeSetItem('gb_study_platforms', JSON.stringify(orderedList));
  };

  // Direct instant delete platform from local state & cache (0ms delay!)
  const handleDeletePlatformDirect = (id: string) => {
    // Record deletion permanently
    const deleted = getDeletedPlatformIds();
    deleted.add(id);
    safeSetItem('gb_deleted_platform_ids', JSON.stringify(Array.from(deleted)));

    setPlatforms((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      safeSetItem('gb_study_platforms', JSON.stringify(updated));
      return updated;
    });
  };

  // Direct instant add/update banner in local state & cache
  const handleAddOrUpdateBannerDirect = (banner: BannerSlide) => {
    const deleted = getDeletedBannerIds();
    if (deleted.has(banner.id)) {
      deleted.delete(banner.id);
      safeSetItem('gb_deleted_banner_ids', JSON.stringify(Array.from(deleted)));
    }

    setBanners((prev) => {
      const index = prev.findIndex((b) => b.id === banner.id);
      let updated: BannerSlide[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = banner;
      } else {
        updated = [...prev, banner];
      }
      safeSetItem('gb_study_banners', JSON.stringify(updated));
      return updated;
    });
  };

  // Direct instant delete banner from local state & cache (0ms delay!)
  const handleDeleteBannerDirect = (id: string) => {
    const deleted = getDeletedBannerIds();
    deleted.add(id);
    safeSetItem('gb_deleted_banner_ids', JSON.stringify(Array.from(deleted)));

    setBanners((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      safeSetItem('gb_study_banners', JSON.stringify(updated));
      return updated;
    });
  };

  // When initial splash completes
  const handleInitialSplashDone = () => {
    setShowSplash(false);
    if (!profile.hasSeenWelcome) {
      setShowWelcome(true);
    } else if (!profile.hasSeenTelegram) {
      setShowTelegram(true);
    }
  };

  // Welcome modal submit
  const handleSaveStudentName = (name: string) => {
    setProfile((prev) => ({
      ...prev,
      name,
      hasSeenWelcome: true,
    }));
    setShowWelcome(false);
    setShowTelegram(true);
  };

  // Telegram modal dismiss
  const handleCloseTelegram = () => {
    setProfile((prev) => ({
      ...prev,
      hasSeenTelegram: true,
    }));
    setShowTelegram(false);
  };

  // SMOOTH PLATFORM OPENING WITH LAUNCH ANIMATION MODAL (Matching user's screenshot!)
  const handleSelectPlatform = (platform: Platform) => {
    setIsLaunchingPlatform(true);

    setTimeout(() => {
      setIsLaunchingPlatform(false);
      const targetUrl = platform.url?.trim();
      const mode = platform.openMode || 'new_tab';

      if (targetUrl) {
        if (mode === 'same_tab') {
          window.location.href = targetUrl;
        } else {
          window.open(targetUrl, '_blank');
        }
      } else {
        // Native Batches View (Classroom)
        setSelectedPlatform(platform);
        setActiveScreen('batches');
      }
    }, 700);
  };

  // Backing out from BatchesView triggers the glowing aura splash transition
  const handleBackFromBatches = () => {
    setIsTransitionSplash(true);
  };

  const handleTransitionSplashDone = () => {
    setIsTransitionSplash(false);
    setActiveScreen('main');
    setSelectedPlatform(null);
  };

  // Toggle batch enrollment
  const handleToggleEnroll = (batchId: string) => {
    setProfile((prev) => {
      const isEnrolled = prev.enrolledBatches.includes(batchId);
      return {
        ...prev,
        enrolledBatches: isEnrolled
          ? prev.enrolledBatches.filter((id) => id !== batchId)
          : [...prev.enrolledBatches, batchId],
      };
    });
  };

  // Filter platforms by live / upcoming and order them strictly by order ascending
  const livePlatforms = [...platforms]
    .filter((p) => p.tabPlacement !== 'upcoming')
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const upcomingPlatforms = [...platforms]
    .filter((p) => p.tabPlacement === 'upcoming')
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const filteredLivePlatforms = livePlatforms.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#070a12] text-white select-none relative font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Initial Splash Screens */}
      {showSplash && (
        <SplashScreens onComplete={handleInitialSplashDone} />
      )}

      {/* 2. Transition Splash Screen */}
      {isTransitionSplash && (
        <SplashScreens onComplete={handleTransitionSplashDone} isTransitionOnly={true} />
      )}

      {/* 3. Welcome Student Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onSave={handleSaveStudentName}
      />

      {/* 4. Join Telegram Modal (with https://t.me/GBFreestudy) */}
      <TelegramModal
        isOpen={showTelegram}
        onClose={handleCloseTelegram}
      />

      {/* 5. Student Analytics Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        studentName={profile.name}
        activeMinutes={profile.activeMinutes}
        onClose={() => setShowProfileModal(false)}
        onUpdateName={(newName) => setProfile((p) => ({ ...p, name: newName }))}
      />

      {/* 6. Secret Admin Login Modal (Triggered by 10 taps) */}
      <AdminLoginModal
        isOpen={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
        onSuccess={() => {
          setShowAdminLogin(false);
          setShowAdminDashboard(true);
        }}
      />

      {/* 7. Full Admin Dashboard (with sequence reordering, instant deletion, and persistence) */}
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
        platforms={platforms}
        banners={banners}
        onRefreshData={refreshBackendData}
        onAddOrUpdatePlatformDirect={handleAddOrUpdatePlatformDirect}
        onDeletePlatformDirect={handleDeletePlatformDirect}
        onReorderPlatformsDirect={handleReorderPlatformsDirect}
        onAddOrUpdateBannerDirect={handleAddOrUpdateBannerDirect}
        onDeleteBannerDirect={handleDeleteBannerDirect}
      />

      {/* 8. Launching Platform Animation Modal (Exact replica of user screenshot!) */}
      <LoadingPlatformModal isOpen={isLaunchingPlatform} />

      {/* Screen Routing */}
      {activeScreen === 'batches' && selectedPlatform ? (
        <BatchesView
          platform={selectedPlatform}
          onBack={handleBackFromBatches}
          enrolledBatches={profile.enrolledBatches}
          onToggleEnroll={handleToggleEnroll}
        />
      ) : (
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-6">
          {/* Top Header */}
          <header className="sticky top-0 z-30 px-4 py-3 bg-[#070a12]/90 backdrop-blur-md flex items-center justify-between border-b border-slate-900/60">
            {/* Left: App icon with 10-tap secret listener + Title & Author */}
            <div className="flex items-center gap-3">
              <div
                onClick={handleIconTap}
                className="w-10 h-10 rounded-xl p-[1.5px] bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-500 shadow-md shadow-cyan-500/20 overflow-hidden cursor-pointer active:scale-95 transition-transform relative group shrink-0"
                title="GB STUDY - Tap 10x for Admin"
              >
                <img
                  src="/app-icon.png"
                  alt="GB STUDY"
                  className="w-full h-full object-cover rounded-[10px]"
                />

                {/* Secret tap feedback indicator (starts showing after 4 taps) */}
                {iconTapCount >= 4 && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex items-center justify-center rounded-[10px] text-[10px] font-black text-cyan-300">
                    {iconTapCount}/10
                  </div>
                )}
              </div>

              <div>
                <h1 className="text-xl font-black tracking-tight flex items-center gap-1 leading-tight">
                  <span className="text-white">GB STUDY</span>
                </h1>
                <span className="text-[11px] font-extrabold tracking-wider text-cyan-400 uppercase block">
                  SARVOTTAM YADAV
                </span>
              </div>
            </div>

            {/* Right: User Profile Icon */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-10 h-10 rounded-xl bg-[#131a29] border border-slate-700/80 hover:border-cyan-500/60 flex items-center justify-center text-slate-300 hover:text-cyan-400 shadow-md active:scale-95 transition-all cursor-pointer"
              aria-label="Open profile"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </header>

          {/* Main Tab Content */}
          {activeTab === 'platforms' && (
            <main className="flex-1 space-y-4">
              {/* Carousel Banners (strictly 16:9 ratio, only if any banner is added by Admin) */}
              {banners.length > 0 && (
                <BannerCarousel
                  banners={banners}
                  onBannerAction={(banner) => {
                    if (banner.actionType === 'telegram' || banner.actionUrl?.includes('t.me')) {
                      window.open(banner.actionUrl || 'https://t.me/GBFreestudy', '_blank');
                    } else if (banner.actionUrl) {
                      window.open(banner.actionUrl, '_blank');
                    }
                  }}
                />
              )}

              {/* Platform Cards List (Sorted by order 1, 2, 3...) */}
              <PlatformList
                platforms={filteredLivePlatforms}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelectPlatform={handleSelectPlatform}
              />
            </main>
          )}

          {activeTab === 'gb_ai' && (
            <main className="flex-1">
              <GBAiView />
            </main>
          )}

          {activeTab === 'upcoming' && (
            <main className="flex-1">
              <UpcomingView
                upcomingPlatforms={upcomingPlatforms}
                onSelectPlatform={handleSelectPlatform}
              />
            </main>
          )}

          {/* Bottom Dock Navigation: Platforms | GB AI | Upcoming */}
          <BottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      )}
    </div>
  );
}
