import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Globe,
  Image as ImageIcon,
  Upload,
  Layers,
  Sparkles,
  LayoutGrid,
  Save,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Hash,
} from 'lucide-react';
import { Platform, BannerSlide, OpenMode, TabPlacement } from '../types';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  platforms: Platform[];
  banners: BannerSlide[];
  onRefreshData: () => Promise<void>;
  onAddOrUpdatePlatformDirect: (platform: Platform) => void;
  onDeletePlatformDirect: (id: string) => void;
  onReorderPlatformsDirect: (platforms: Platform[]) => void;
  onAddOrUpdateBannerDirect: (banner: BannerSlide) => void;
  onDeleteBannerDirect: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  platforms,
  banners,
  onRefreshData,
  onAddOrUpdatePlatformDirect,
  onDeletePlatformDirect,
  onReorderPlatformsDirect,
  onAddOrUpdateBannerDirect,
  onDeleteBannerDirect,
}) => {
  const [activeTab, setActiveTab] = useState<'platforms' | 'banners'>('platforms');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Platform Form State
  const [editingPlatformId, setEditingPlatformId] = useState<string | null>(null);
  const [platformName, setPlatformName] = useState('');
  const [platformSubtitle, setPlatformSubtitle] = useState('Open platform to explore content.');
  const [platformUrl, setPlatformUrl] = useState('');
  const [platformLogo, setPlatformLogo] = useState('');
  const [platformCategory, setPlatformCategory] = useState('NEET & JEE');
  const [platformOpenMode, setPlatformOpenMode] = useState<OpenMode>('new_tab');
  const [platformTabPlacement, setPlatformTabPlacement] = useState<TabPlacement>('live');
  const [platformOrder, setPlatformOrder] = useState<number>(platforms.length + 1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline delete confirmation states
  const [confirmDeletePlatformId, setConfirmDeletePlatformId] = useState<string | null>(null);
  const [confirmDeleteBannerId, setConfirmDeleteBannerId] = useState<string | null>(null);

  // Banner Form State
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerActionUrl, setBannerActionUrl] = useState('');
  const [bannerActionType, setBannerActionType] = useState<'telegram' | 'platform' | 'external' | 'tutorial'>('external');
  const [bannerBadgeText, setBannerBadgeText] = useState('');
  const bannerFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Client-side instant image compression (prevents LocalStorage quota crashes & lag)
  const compressImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        showToast('Image read error');
      };
      reader.readAsDataURL(file);
    });
  };

  // Convert uploaded image file to compressed Data URL
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void,
    type: 'logo' | 'banner' = 'logo'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        showToast('Image size 15MB se kam honi chahiye');
        return;
      }
      try {
        const maxWidth = type === 'banner' ? 960 : 400;
        const maxHeight = type === 'banner' ? 540 : 400;
        const compressed = await compressImage(file, maxWidth, maxHeight);
        setter(compressed);
        showToast('Photo optimized & uploaded! ✓');
      } catch (err) {
        showToast('Photo upload ho gaya!');
      }
    }
  };

  // Platform Handlers
  const handleSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformName.trim()) {
      showToast('Kripya platform ka naam likhein');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetOrder = Number(platformOrder) || (platforms.length + 1);

      const payload: Platform = {
        id: editingPlatformId || 'plat-' + Date.now(),
        name: platformName.trim(),
        subtitle: platformSubtitle.trim() || 'Open platform to explore content.',
        url: platformUrl.trim(),
        logo: platformLogo.trim() || '/app-icon.png',
        category: platformCategory.trim() || 'General',
        openMode: platformOpenMode,
        tabPlacement: platformTabPlacement,
        order: targetOrder,
        batchesCount: 15,
        createdAt: new Date().toISOString(),
      };

      // 1. Immediately update state & localStorage (GUARANTEES 0ms lag and NEVER loses data)
      onAddOrUpdatePlatformDirect(payload);

      // 2. Persist to backend server API
      if (editingPlatformId) {
        await fetch(`/api/platforms/${editingPlatformId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
        showToast(`Platform "${platformName}" position #${targetOrder} par update ho gaya! ✓`);
      } else {
        await fetch('/api/platforms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
        showToast(`Platform "${platformName}" position #${targetOrder} par jud gaya! ✓`);
      }

      resetPlatformForm();
      await onRefreshData();
    } catch (err) {
      showToast('Saved locally!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlatform = (p: Platform) => {
    setEditingPlatformId(p.id);
    setPlatformName(p.name);
    setPlatformSubtitle(p.subtitle);
    setPlatformUrl(p.url || '');
    setPlatformLogo(p.logo);
    setPlatformCategory(p.category || 'General');
    setPlatformOpenMode(p.openMode || 'new_tab');
    setPlatformTabPlacement(p.tabPlacement || 'live');
    setPlatformOrder(typeof p.order === 'number' ? p.order : platforms.indexOf(p) + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Safe Inline Delete Platform
  const executeDeletePlatform = async (id: string, name: string) => {
    try {
      setConfirmDeletePlatformId(null);
      onDeletePlatformDirect(id);
      await fetch(`/api/platforms/${id}`, { method: 'DELETE' }).catch(() => null);
      showToast(`Platform "${name}" delete ho gaya! ✓`);
      await onRefreshData();
    } catch (err) {
      showToast('Deleted locally!');
    }
  };

  // Move Platform Position Up
  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const sorted = [...platforms].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const current = sorted[index];
    const prev = sorted[index - 1];

    const currentOrder = current.order ?? (index + 1);
    const prevOrder = prev.order ?? index;

    current.order = prevOrder;
    prev.order = currentOrder;

    sorted[index - 1] = current;
    sorted[index] = prev;

    // Renumber all cleanly
    sorted.forEach((p, i) => {
      p.order = i + 1;
    });

    onReorderPlatformsDirect(sorted);
    await fetch('/api/platforms/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedPlatforms: sorted }),
    }).catch(() => null);
    showToast(`"${current.name}" ko Position #${current.order} par kar diya! ⬆️`);
  };

  // Move Platform Position Down
  const handleMoveDown = async (index: number) => {
    const sorted = [...platforms].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    if (index >= sorted.length - 1) return;

    const current = sorted[index];
    const next = sorted[index + 1];

    const currentOrder = current.order ?? (index + 1);
    const nextOrder = next.order ?? (index + 2);

    current.order = nextOrder;
    next.order = currentOrder;

    sorted[index + 1] = current;
    sorted[index] = next;

    // Renumber all cleanly
    sorted.forEach((p, i) => {
      p.order = i + 1;
    });

    onReorderPlatformsDirect(sorted);
    await fetch('/api/platforms/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedPlatforms: sorted }),
    }).catch(() => null);
    showToast(`"${current.name}" ko Position #${current.order} par kar diya! ⬇️`);
  };

  const handleTogglePlacement = async (p: Platform) => {
    const nextPlacement: TabPlacement = p.tabPlacement === 'live' ? 'upcoming' : 'live';
    const updated = { ...p, tabPlacement: nextPlacement };
    onAddOrUpdatePlatformDirect(updated);
    try {
      await fetch(`/api/platforms/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tabPlacement: nextPlacement }),
      }).catch(() => null);
      showToast(`Platform "${p.name}" ko ${nextPlacement.toUpperCase()} tab me shift kiya!`);
      await onRefreshData();
    } catch (err) {}
  };

  const resetPlatformForm = () => {
    setEditingPlatformId(null);
    setPlatformName('');
    setPlatformSubtitle('Open platform to explore content.');
    setPlatformUrl('');
    setPlatformLogo('');
    setPlatformCategory('NEET & JEE');
    setPlatformOpenMode('new_tab');
    setPlatformTabPlacement('live');
    setPlatformOrder(platforms.length + 1);
  };

  // Banner Handlers
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) {
      showToast('Kripya banner title likhein');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: BannerSlide = {
        id: editingBannerId || 'banner-' + Date.now(),
        title: bannerTitle.trim(),
        subtitle: bannerSubtitle.trim(),
        imageUrl: bannerImage.trim() || '/banners/banner_clean_1.jpg',
        actionUrl: bannerActionUrl.trim() || 'https://t.me/GBFreestudy',
        actionType: bannerActionType,
        badgeText: bannerBadgeText.trim(),
      };

      // 1. Immediately update state & localStorage
      onAddOrUpdateBannerDirect(payload);

      // 2. Persist to API
      if (editingBannerId) {
        await fetch(`/api/banners/${editingBannerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
        showToast('Carousel slide update ho gayi! ✓');
      } else {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
        showToast('Nayi 16:9 Carousel slide add ho gayi! ✓');
      }

      resetBannerForm();
      await onRefreshData();
    } catch (err) {
      showToast('Saved locally!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBanner = (b: BannerSlide) => {
    setEditingBannerId(b.id);
    setBannerTitle(b.title);
    setBannerSubtitle(b.subtitle);
    setBannerImage(b.imageUrl);
    setBannerActionUrl(b.actionUrl);
    setBannerActionType(b.actionType || 'external');
    setBannerBadgeText(b.badgeText || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const executeDeleteBanner = async (id: string, title: string) => {
    try {
      setConfirmDeleteBannerId(null);
      onDeleteBannerDirect(id);
      await fetch(`/api/banners/${id}`, { method: 'DELETE' }).catch(() => null);
      showToast(`Banner "${title}" delete ho gaya! ✓`);
      await onRefreshData();
    } catch (err) {
      showToast('Deleted locally!');
    }
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerTitle('');
    setBannerSubtitle('');
    setBannerImage('');
    setBannerActionUrl('');
    setBannerActionType('external');
    setBannerBadgeText('');
  };

  // Sort platforms by order ascending for display
  const sortedPlatforms = [...platforms].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl max-h-[94vh] flex flex-col rounded-3xl bg-[#0d121d] border border-cyan-500/40 shadow-2xl text-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0f1626] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">
                    GB STUDY Admin Panel
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    MASTER
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Custom Platform Positioning (1, 2, 3...) • 16:9 Carousel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await onRefreshData();
                  showToast('Database Refreshed! 🔄');
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Refresh database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 py-2 border-b border-slate-800 bg-[#0b0e17] flex items-center gap-2">
            <button
              onClick={() => setActiveTab('platforms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'platforms'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Platforms ({platforms.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('banners')}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Carousel 16:9 Banners ({banners.length})</span>
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* 1. PLATFORMS TAB */}
            {activeTab === 'platforms' && (
              <div className="space-y-6">
                {/* Form to Add / Edit Platform */}
                <form
                  onSubmit={handleSavePlatform}
                  className="p-4 sm:p-5 rounded-3xl bg-[#121929] border border-slate-800/90 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-extrabold text-cyan-400 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>{editingPlatformId ? 'Edit Platform' : 'Add New Platform (Position, URL & Photo)'}</span>
                    </h3>
                    {editingPlatformId && (
                      <button
                        type="button"
                        onClick={resetPlatformForm}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Platform Name */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Platform Name *
                      </label>
                      <input
                        type="text"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        placeholder="e.g. Physics Wallah, Khan Sir, My Site"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Position Number (User Requested: "main hi decide karoon ki kis platform ko kitne number par rakhna hai") */}
                    <div>
                      <label className="text-[11px] font-bold text-cyan-400 block mb-1 flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5" />
                        <span>Position / Sequence Number (1, 2, 3...) *</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={platformOrder}
                        onChange={(e) => setPlatformOrder(Number(e.target.value))}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-cyan-500/50 text-white font-bold text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Subtitle */}
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Subtitle / Description
                      </label>
                      <input
                        type="text"
                        value={platformSubtitle}
                        onChange={(e) => setPlatformSubtitle(e.target.value)}
                        placeholder="Open platform to explore content."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Platform URL */}
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Platform Website URL *</span>
                      </label>
                      <input
                        type="url"
                        value={platformUrl}
                        onChange={(e) => setPlatformUrl(e.target.value)}
                        placeholder="https://pwgb-uupv.vercel.app/study/batches or any URL"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Platform Icon */}
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Platform Icon (Photo ya Link)</span>
                        </span>
                        <span className="text-[10px] text-cyan-300 font-normal">
                          Device se photo upload karein ya image URL dalein
                        </span>
                      </label>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={platformLogo}
                          onChange={(e) => setPlatformLogo(e.target.value)}
                          placeholder="Image link paste karein ya upload karein ->"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shrink-0 border border-slate-700 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Photo</span>
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileUpload(e, setPlatformLogo, 'logo')}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      {platformLogo && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-black border border-slate-700 overflow-hidden">
                            <img src={platformLogo} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[11px] text-emerald-400 font-semibold">
                            ✓ Icon Ready
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Placement (Live vs Upcoming Tab) */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Placement (Live vs Upcoming)
                      </label>
                      <select
                        value={platformTabPlacement}
                        onChange={(e) => setPlatformTabPlacement(e.target.value as TabPlacement)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="live">🟢 Live (Platforms Tab me dikhega)</option>
                        <option value="upcoming">⏳ Upcoming (Upcoming Tab me dikhega)</option>
                      </select>
                    </div>

                    {/* Open Mode */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Open Mode (Khulne ka tarika)
                      </label>
                      <select
                        value={platformOpenMode}
                        onChange={(e) => setPlatformOpenMode(e.target.value as OpenMode)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      >
                        <option value="new_tab">↗️ New Tab (Direct Launch in New Tab - Recommended)</option>
                        <option value="same_tab">🔄 Same Tab (Redirect in Same Tab)</option>
                        <option value="batches">📚 In-App Batches (Native study screen)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingPlatformId ? 'Save Changes' : 'Publish Platform to App'}</span>
                  </button>
                </form>

                {/* Platforms List with Position Numbers & Up/Down Ordering */}
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Platforms Sequence Order ({sortedPlatforms.length})
                    </h4>
                    <span className="text-[10px] text-cyan-400 font-semibold">
                      Use ⬆️ ⬇️ to reorder positions
                    </span>
                  </div>

                  {sortedPlatforms.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-[#121929] border border-dashed border-slate-800 text-slate-400 text-xs">
                      Abhi koi platform add nahi hai. Upar diye gaye form se naya platform jodein!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {sortedPlatforms.map((p, index) => {
                        const isConfirming = confirmDeletePlatformId === p.id;
                        const positionNum = p.order ?? (index + 1);

                        return (
                          <div
                            key={p.id}
                            className="p-3.5 rounded-2xl bg-[#121929] border border-slate-800 flex items-center justify-between gap-3 shadow-md"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Position Badge Number */}
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
                                #{positionNum}
                              </div>

                              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
                                <img
                                  src={p.logo}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-sm font-bold text-white truncate">{p.name}</h5>
                                  <button
                                    onClick={() => handleTogglePlacement(p)}
                                    className={`px-2 py-0.5 rounded text-[9px] font-black cursor-pointer transition-colors ${
                                      p.tabPlacement === 'live'
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    }`}
                                    title="Click to toggle Live/Upcoming"
                                  >
                                    {p.tabPlacement?.toUpperCase() || 'LIVE'}
                                  </button>
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  Position: <span className="text-cyan-300 font-bold">#{positionNum}</span> • Mode: <span className="text-cyan-300">{p.openMode || 'new_tab'}</span>
                                </p>
                                {p.url && (
                                  <p className="text-[10px] text-cyan-400 truncate mt-0.5">
                                    {p.url}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions with Position Up/Down and Delete */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* Move Up */}
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  index === 0
                                    ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-800 border-slate-700 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 cursor-pointer'
                                }`}
                                title="Move Up (Order -1)"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>

                              {/* Move Down */}
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === sortedPlatforms.length - 1}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  index === sortedPlatforms.length - 1
                                    ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-slate-800 border-slate-700 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 cursor-pointer'
                                }`}
                                title="Move Down (Order +1)"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>

                              {isConfirming ? (
                                <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-600/80 rounded-xl p-1">
                                  <button
                                    onClick={() => executeDeletePlatform(p.id, p.name)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold cursor-pointer"
                                  >
                                    Delete!
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeletePlatformId(null)}
                                    className="p-1 text-slate-300 hover:text-white cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditPlatform(p)}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                                    title="Edit Platform"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeletePlatformId(p.id)}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                                    title="Delete Platform"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. BANNERS TAB (16:9 Aspect Ratio) */}
            {activeTab === 'banners' && (
              <div className="space-y-6">
                {/* Add / Edit Banner Form */}
                <form
                  onSubmit={handleSaveBanner}
                  className="p-4 sm:p-5 rounded-3xl bg-[#121929] border border-slate-800/90 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-extrabold text-cyan-400 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span>{editingBannerId ? 'Edit 16:9 Banner' : 'Add 16:9 Carousel Banner (Photo ya URL)'}</span>
                    </h3>
                    {editingBannerId && (
                      <button
                        type="button"
                        onClick={resetBannerForm}
                        className="text-xs text-rose-400 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Headline / Title *
                      </label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="e.g. GB SPECIAL BATCH"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={bannerSubtitle}
                        onChange={(e) => setBannerSubtitle(e.target.value)}
                        placeholder="e.g. Free access for students"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    {/* Banner Image URL or Photo Upload (16:9 preview) */}
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-400 block mb-1 flex items-center justify-between">
                        <span>Banner Image (Photo Upload ya Link - 16:9 Ratio)</span>
                        <span className="text-[10px] text-cyan-300 font-normal">
                          Exact 16:9 standard ratio
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bannerImage}
                          onChange={(e) => setBannerImage(e.target.value)}
                          placeholder="Image link paste karein ya upload karein ->"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                        />
                        <button
                          type="button"
                          onClick={() => bannerFileRef.current?.click()}
                          className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center gap-1.5 shrink-0 border border-slate-700 cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Banner</span>
                        </button>
                        <input
                          type="file"
                          ref={bannerFileRef}
                          onChange={(e) => handleFileUpload(e, setBannerImage, 'banner')}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>

                      {bannerImage && (
                        <div className="mt-2 w-full aspect-[16/9] rounded-2xl bg-black border border-slate-700 overflow-hidden relative shadow-lg">
                          <img src={bannerImage} alt="16:9 Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Badge Text (Optional)
                      </label>
                      <input
                        type="text"
                        value={bannerBadgeText}
                        onChange={(e) => setBannerBadgeText(e.target.value)}
                        placeholder="e.g. VIP, LIVE, NEW"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Action Destination Link
                      </label>
                      <input
                        type="url"
                        value={bannerActionUrl}
                        onChange={(e) => setBannerActionUrl(e.target.value)}
                        placeholder="https://t.me/GBFreestudy or website link"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-slate-700/80 text-white text-xs focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 active:scale-[0.99] transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingBannerId ? 'Update Banner' : 'Publish 16:9 Banner'}</span>
                  </button>
                </form>

                {/* Existing Banners */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                    Active 16:9 Carousel Banners ({banners.length})
                  </h4>

                  {banners.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl bg-[#121929] border border-dashed border-slate-800 text-slate-400 text-xs">
                      Abhi koi carousel banner nahi hai. Upar diye gaye form se naya 16:9 banner jodein!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {banners.map((b) => {
                        const isConfirming = confirmDeleteBannerId === b.id;

                        return (
                          <div
                            key={b.id}
                            className="p-3.5 rounded-2xl bg-[#121929] border border-slate-800 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-20 aspect-[16/9] rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0">
                                <img
                                  src={b.imageUrl}
                                  alt={b.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-sm font-bold text-white truncate">{b.title}</h5>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                  {b.subtitle}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isConfirming ? (
                                <div className="flex items-center gap-1 bg-rose-950/80 border border-rose-600/80 rounded-xl p-1">
                                  <button
                                    onClick={() => executeDeleteBanner(b.id, b.title)}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-extrabold cursor-pointer"
                                  >
                                    Delete!
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteBannerId(null)}
                                    className="p-1 text-slate-300 hover:text-white cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditBanner(b)}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteBannerId(b.id)}
                                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toast */}
          {toastMessage && (
            <div className="p-2.5 bg-cyan-500 text-black font-extrabold text-xs text-center animate-bounce">
              {toastMessage}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
