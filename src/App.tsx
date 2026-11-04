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
import { PLATFORMS_DATA, BANNERS_DATA, DELETED_PLATFORM_IDS } from './data/platformsData';

const BLACKLISTED_PLATFORM_NAMES = ['GB LIVE STUDY', 'PW TEST 2', 'PW TEST'];

function isBlacklistedPlatform(p: { id?: string; name?: string }): boolean {
  if (!p) return false;
  if (p.id && DELETED_PLATFORM_IDS.includes(p.id)) return true;
  const normalized = (p.name || '').trim().toUpperCase();
  return BLACKLISTED_PLATFORM_NAMES.includes(normalized);
}

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
      const deletedIds = new Set<string>(DELETED_PLATFORM_IDS);
      const savedDeleted = safeGetItem('gb_deleted_platform_ids');
      if (savedDeleted) {
        const parsedDel = JSON.parse(savedDeleted);
        if (Array.isArray(parsedDel)) {
          parsedDel.forEach((id: string) => deletedIds.add(id));
        }
      }

      const saved = safeGetItem('gb_study_platforms');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((p: Platform) => !deletedIds.has(p.id) && !isBlacklistedPlatform(p));
          return cleaned;
        }
      }
    } catch (e) {}
    return PLATFORMS_DATA.filter((p) => !DELETED_PLATFORM_IDS.includes(p.id) && !isBlacklistedPlatform(p));
  });

  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = safeGetItem('gb_study_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return BANNERS_DATA;
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
  const [launchingPlatformName, setLaunchingPlatformName] = useState('');

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
    const set = new Set<string>(DELETED_PLATFORM_IDS);
    try {
      const saved = safeGetItem('gb_deleted_platform_ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id: string) => set.add(id));
        }
      }
    } catch (e) {}
    return set;
  };

  const getDeletedBannerIds = (): Set<string> => {
    try {
      const saved = safeGetItem('gb_deleted_banner_ids');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    return new Set<string>();
  };

  const lastSyncedVersionRef = useRef<number>(0);

  // Apply sync data idempotently to state & local cache with Smart Union Merge
  const applySyncData = (syncData: any) => {
    if (!syncData) return;

    if (typeof syncData.version === 'number') {
      if (syncData.version <= lastSyncedVersionRef.current) {
        return; // Already up to date
      }
      lastSyncedVersionRef.current = syncData.version;
    }

    const localDeleted = getDeletedPlatformIds();
    const serverDeletedIds = new Set<string>([
      ...DELETED_PLATFORM_IDS,
      ...(Array.isArray(syncData.deletedPlatformIds) ? syncData.deletedPlatformIds : []),
      ...localDeleted,
    ]);

    if (Array.isArray(syncData.platforms)) {
      setPlatforms((prevPlatforms) => {
        const map = new Map<string, Platform>();

        // 1. Authoritative incoming server platforms
        syncData.platforms.forEach((p: Platform) => {
          if (p && p.id && !serverDeletedIds.has(p.id) && !isBlacklistedPlatform(p)) {
            map.set(p.id, p);
          }
        });

        // 2. Keep any newly added local platforms that haven't synced yet (and aren't deleted)
        prevPlatforms.forEach((p) => {
          if (p && p.id && !serverDeletedIds.has(p.id) && !isBlacklistedPlatform(p)) {
            if (!map.has(p.id)) {
              map.set(p.id, p);
            }
          }
        });

        const merged = Array.from(map.values()).sort(
          (a, b) => (a.order ?? 999) - (b.order ?? 999)
        );

        safeSetItem('gb_study_platforms', JSON.stringify(merged));
        safeSetItem('gb_deleted_platform_ids', JSON.stringify(Array.from(serverDeletedIds)));
        return merged;
      });
    }

    if (Array.isArray(syncData.banners)) {
      const localDeletedBanners = getDeletedBannerIds();
      const serverDeletedBanners = new Set<string>([
        ...(Array.isArray(syncData.deletedBannerIds) ? syncData.deletedBannerIds : []),
        ...localDeletedBanners,
      ]);

      setBanners((prevBanners) => {
        const map = new Map<string, BannerSlide>();
        prevBanners.forEach((b) => {
          if (b && b.id && !serverDeletedBanners.has(b.id)) {
            map.set(b.id, b);
          }
        });
        syncData.banners.forEach((b: BannerSlide) => {
          if (b && b.id && !serverDeletedBanners.has(b.id)) {
            map.set(b.id, b);
          }
        });
        const merged = Array.from(map.values());
        safeSetItem('gb_study_banners', JSON.stringify(merged));
        safeSetItem('gb_deleted_banner_ids', JSON.stringify(Array.from(serverDeletedBanners)));
        return merged;
      });
    }
  };

  // High-Speed Authoritative Server Synchronization (Zero-Lag Cross-Device Real-Time)
  const refreshBackendData = async () => {
    try {
      // Unified fast sync-state endpoint
      const syncRes = await fetch('/api/sync-state', {
        headers: { 'Cache-Control': 'no-cache' }
      }).catch(() => null);

      if (syncRes && syncRes.ok) {
        const syncData = await syncRes.json().catch(() => null);
        if (syncData) {
          applySyncData(syncData);
          return;
        }
      }

      // Fallback individual endpoints if sync-state is unavailable
      const [platRes, banRes, delRes] = await Promise.all([
        fetch('/api/platforms').catch(() => null),
        fetch('/api/banners').catch(() => null),
        fetch('/api/platforms/deleted').catch(() => null),
      ]);

      const localDeleted = getDeletedPlatformIds();
      const serverDeletedIds = new Set<string>([
        ...DELETED_PLATFORM_IDS,
        ...localDeleted,
      ]);

      if (delRes && delRes.ok) {
        const delData = await delRes.json().catch(() => null);
        if (Array.isArray(delData)) {
          delData.forEach((id: string) => serverDeletedIds.add(id));
        }
      }
      safeSetItem('gb_deleted_platform_ids', JSON.stringify(Array.from(serverDeletedIds)));

      if (platRes && platRes.ok) {
        const platData = await platRes.json().catch(() => null);
        if (Array.isArray(platData)) {
          setPlatforms((prevPlatforms) => {
            const map = new Map<string, Platform>();
            prevPlatforms.forEach((p) => {
              if (p && p.id && !serverDeletedIds.has(p.id) && !isBlacklistedPlatform(p)) {
                map.set(p.id, p);
              }
            });
            platData.forEach((p: Platform) => {
              if (p && p.id && !serverDeletedIds.has(p.id) && !isBlacklistedPlatform(p)) {
                map.set(p.id, p);
              }
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => (a.order ?? 999) - (b.order ?? 999)
            );
            safeSetItem('gb_study_platforms', JSON.stringify(merged));
            return merged;
          });
        }
      }

      if (banRes && banRes.ok) {
        const banData = await banRes.json().catch(() => null);
        if (Array.isArray(banData)) {
          setBanners((prevBanners) => {
            const map = new Map<string, BannerSlide>();
            prevBanners.forEach((b) => map.set(b.id, b));
            banData.forEach((b: BannerSlide) => map.set(b.id, b));
            const merged = Array.from(map.values());
            safeSetItem('gb_study_banners', JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  };

  useEffect(() => {
    // Purge any blacklisted platforms from localStorage if present
    try {
      const saved = safeGetItem('gb_study_platforms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((p: Platform) => !isBlacklistedPlatform(p));
          safeSetItem('gb_study_platforms', JSON.stringify(cleaned));
        }
      }
    } catch (e) {}

    // 1. Initial snapshot fetch
    refreshBackendData();

    // 2. High-Efficiency Real-Time SSE Stream (Zero-Latency Instant Push across 100k-500k devices)
    let sseSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let consecutiveSseFailures = 0;

    const connectSSE = () => {
      // If server or network drops SSE more than twice, rely on adaptive version heartbeat
      if (consecutiveSseFailures >= 2) return;
      if (typeof EventSource === 'undefined') return;

      try {
        sseSource = new EventSource('/api/events');

        sseSource.addEventListener('sync', (e: MessageEvent) => {
          try {
            consecutiveSseFailures = 0;
            const data = JSON.parse(e.data);
            applySyncData(data);
          } catch (err) {}
        });

        sseSource.onerror = () => {
          consecutiveSseFailures++;
          if (sseSource) {
            sseSource.close();
            sseSource = null;
          }
          if (consecutiveSseFailures < 2 && !reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
              reconnectTimeout = null;
              connectSSE();
            }, 5000);
          }
        };
      } catch (err) {}
    };

    connectSSE();

    // 3. Ultra-Lightweight Adaptive Heartbeat Poll (Checks /api/version only, handles 500k users smoothly)
    const versionPollInterval = setInterval(async () => {
      try {
        const vRes = await fetch('/api/version').catch(() => null);
        if (vRes && vRes.ok) {
          const vData = await vRes.json().catch(() => null);
          if (vData && typeof vData.v === 'number') {
            if (vData.v > lastSyncedVersionRef.current) {
              refreshBackendData();
            }
          }
        }
      } catch (e) {}
    }, 6000);

    // Instant refresh when user switches back to the tab or unlocks phone
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshBackendData();
      }
    };
    const handleFocus = () => {
      refreshBackendData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (sseSource) sseSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      clearInterval(versionPollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
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

  // SMOOTH PLATFORM OPENING WITH EXACT 2-SECOND LAUNCH MODAL & DEDICATED OPEN MODE HANDLING
  const handleSelectPlatform = (platform: Platform) => {
    setLaunchingPlatformName(platform.name);
    setIsLaunchingPlatform(true);

    let targetUrl = (platform.url || '').trim();
    if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const mode = platform.openMode || 'new_tab';

    // 1. In-App Batches Mode (or no URL) -> open native classroom view
    if (mode === 'batches' || !targetUrl) {
      setTimeout(() => {
        setSelectedPlatform(platform);
        setActiveScreen('batches');
        setIsLaunchingPlatform(false);
        setLaunchingPlatformName('');
      }, 2000);
      return;
    }

    // 2. Same Tab Mode -> redirect in current browser tab after 2 seconds
    if (mode === 'same_tab') {
      setTimeout(() => {
        setIsLaunchingPlatform(false);
        setLaunchingPlatformName('');
        window.location.href = targetUrl;
      }, 2000);
      return;
    }

    // 3. New Tab or External Mode -> open in new tab / external browser
    // Pre-initialize window on user click gesture to bypass mobile popup blockers
    let preOpenedTab: Window | null = null;
    try {
      preOpenedTab = window.open('about:blank', '_blank');
    } catch (e) {}

    // Opens platform after exactly 2 seconds (2000ms) with animated modal active throughout
    setTimeout(() => {
      let openedSuccess = false;
      if (preOpenedTab && !preOpenedTab.closed) {
        try {
          preOpenedTab.location.href = targetUrl;
          openedSuccess = true;
        } catch (err) {}
      }

      if (!openedSuccess) {
        const fallbackTab = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (!fallbackTab) {
          // If popup blocker still caught it, navigate directly
          window.location.href = targetUrl;
        }
      }

      setIsLaunchingPlatform(false);
      setLaunchingPlatformName('');
    }, 2000);
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
      <LoadingPlatformModal isOpen={isLaunchingPlatform} platformName={launchingPlatformName} />

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
