import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.resolve(__dirname, 'data', 'database.json');

// Ensure directory exists
if (!fs.existsSync(path.resolve(__dirname, 'data'))) {
  fs.mkdirSync(path.resolve(__dirname, 'data'), { recursive: true });
}

// In-memory persistent database cache (Authoritative in-memory state)
let activeDb: {
  platforms: any[];
  banners: any[];
  deletedPlatformIds: string[];
  deletedBannerIds: string[];
} = {
  platforms: [],
  banners: [],
  deletedPlatformIds: [],
  deletedBannerIds: [],
};

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      const platforms = Array.isArray(parsed.platforms) ? parsed.platforms : [];
      const banners = Array.isArray(parsed.banners) ? parsed.banners : [];
      const deletedPlatformIds = Array.isArray(parsed.deletedPlatformIds) ? parsed.deletedPlatformIds : [];
      const deletedBannerIds = Array.isArray(parsed.deletedBannerIds) ? parsed.deletedBannerIds : [];

      // Merge with in-memory to prevent any loss
      const mergedPlatformsMap = new Map<string, any>();
      (activeDb.platforms || []).forEach((p: any) => mergedPlatformsMap.set(p.id, p));
      platforms.forEach((p: any) => mergedPlatformsMap.set(p.id, p));

      const mergedBannersMap = new Map<string, any>();
      (activeDb.banners || []).forEach((b: any) => mergedBannersMap.set(b.id, b));
      banners.forEach((b: any) => mergedBannersMap.set(b.id, b));

      const allDeletedPlatforms = Array.from(new Set([...(activeDb.deletedPlatformIds || []), ...deletedPlatformIds]));
      const allDeletedBanners = Array.from(new Set([...(activeDb.deletedBannerIds || []), ...deletedBannerIds]));

      // Filter out deleted
      const finalPlatforms = Array.from(mergedPlatformsMap.values()).filter((p: any) => !allDeletedPlatforms.includes(p.id));
      const finalBanners = Array.from(mergedBannersMap.values()).filter((b: any) => !allDeletedBanners.includes(b.id));

      activeDb = {
        platforms: finalPlatforms,
        banners: finalBanners,
        deletedPlatformIds: allDeletedPlatforms,
        deletedBannerIds: allDeletedBanners,
      };
      return activeDb;
    }
  } catch (err) {
    console.error('Error reading DB, preserving in-memory activeDb:', err);
  }
  return activeDb;
}

function writeDb(data: any) {
  try {
    // Atomic write to prevent file corruption
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

// Initial DB load
readDb();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Admin login check
  app.post('/api/admin/verify', (req: Request, res: Response) => {
    const { password } = req.body;
    if (password === 'GBADMIN2026') {
      return res.json({ success: true, message: 'Authentication successful' });
    }
    return res.status(401).json({ success: false, message: 'Incorrect Password' });
  });

  // 1. Platforms Endpoints
  app.get('/api/platforms', (_req: Request, res: Response) => {
    // Sort platforms by order ascending
    const sorted = [...(activeDb.platforms || [])].sort((a: any, b: any) => {
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      return orderA - orderB;
    });
    res.json(sorted);
  });

  // Bulk sync platforms from client to server (never loses any platform)
  app.post('/api/platforms/sync', (req: Request, res: Response) => {
    const { platforms: incomingPlatforms, deletedIds } = req.body;
    if (Array.isArray(deletedIds)) {
      activeDb.deletedPlatformIds = Array.from(new Set([...activeDb.deletedPlatformIds, ...deletedIds]));
    }

    if (Array.isArray(incomingPlatforms)) {
      const map = new Map<string, any>();
      (activeDb.platforms || []).forEach((p: any) => {
        if (!activeDb.deletedPlatformIds.includes(p.id)) {
          map.set(p.id, p);
        }
      });
      incomingPlatforms.forEach((p: any) => {
        if (!activeDb.deletedPlatformIds.includes(p.id)) {
          map.set(p.id, p);
        }
      });
      activeDb.platforms = Array.from(map.values());
      writeDb(activeDb);
    }

    const sorted = [...(activeDb.platforms || [])].sort((a: any, b: any) => {
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      return orderA - orderB;
    });
    res.json({ success: true, platforms: sorted });
  });

  // Add or Upsert Platform
  app.post('/api/platforms', (req: Request, res: Response) => {
    const existingList = activeDb.platforms || [];
    const targetId = req.body.id || 'plat-' + Date.now();
    const nextOrder = typeof req.body.order === 'number' ? req.body.order : existingList.length + 1;

    // Un-delete if this id was previously marked deleted
    activeDb.deletedPlatformIds = (activeDb.deletedPlatformIds || []).filter((id) => id !== targetId);

    const platformData = {
      id: targetId,
      name: req.body.name || 'New Platform',
      subtitle: req.body.subtitle || 'Open platform to explore content.',
      logo: req.body.logo || '/app-icon.png',
      url: req.body.url || '',
      bgColor: req.body.bgColor || '#111827',
      category: req.body.category || 'General',
      batchesCount: req.body.batchesCount || 10,
      openMode: req.body.openMode || 'new_tab',
      tabPlacement: req.body.tabPlacement || 'live',
      order: nextOrder,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };

    const existingIndex = existingList.findIndex((p: any) => p.id === targetId);
    if (existingIndex >= 0) {
      existingList[existingIndex] = { ...existingList[existingIndex], ...platformData };
      activeDb.platforms = [...existingList];
    } else {
      activeDb.platforms = [...existingList, platformData];
    }

    writeDb(activeDb);
    res.status(201).json(platformData);
  });

  app.post('/api/platforms/reorder', (req: Request, res: Response) => {
    const { orderedPlatforms } = req.body;
    if (Array.isArray(orderedPlatforms)) {
      activeDb.platforms = orderedPlatforms;
      writeDb(activeDb);
      return res.json({ success: true, platforms: activeDb.platforms });
    }
    res.status(400).json({ error: 'orderedPlatforms array required' });
  });

  app.put('/api/platforms/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = (activeDb.platforms || []).findIndex((p: any) => p.id === id);
    if (index === -1) {
      // Upsert if not found!
      const created = {
        id,
        name: req.body.name || 'New Platform',
        subtitle: req.body.subtitle || '',
        logo: req.body.logo || '/app-icon.png',
        url: req.body.url || '',
        openMode: req.body.openMode || 'new_tab',
        tabPlacement: req.body.tabPlacement || 'live',
        order: req.body.order || (activeDb.platforms || []).length + 1,
        batchesCount: 10,
        ...req.body,
      };
      activeDb.platforms = [...(activeDb.platforms || []), created];
      writeDb(activeDb);
      return res.json(created);
    }

    activeDb.platforms[index] = {
      ...activeDb.platforms[index],
      ...req.body,
      id,
    };
    writeDb(activeDb);
    res.json(activeDb.platforms[index]);
  });

  app.delete('/api/platforms/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    // Permanently record deletion so it is never resurrected automatically
    activeDb.deletedPlatformIds = Array.from(new Set([...(activeDb.deletedPlatformIds || []), id]));
    activeDb.platforms = (activeDb.platforms || []).filter((p: any) => p.id !== id);
    writeDb(activeDb);
    res.json({ success: true, id, platforms: activeDb.platforms });
  });

  // 2. Banners Endpoints
  app.get('/api/banners', (_req: Request, res: Response) => {
    res.json(activeDb.banners || []);
  });

  app.post('/api/banners', (req: Request, res: Response) => {
    const targetId = req.body.id || 'banner-' + Date.now();
    activeDb.deletedBannerIds = (activeDb.deletedBannerIds || []).filter((id) => id !== targetId);

    const bannerData = {
      id: targetId,
      title: req.body.title || 'New Banner',
      subtitle: req.body.subtitle || '',
      imageUrl: req.body.imageUrl || '/banners/banner_clean_1.jpg',
      actionUrl: req.body.actionUrl || 'https://t.me/GBFreestudy',
      actionType: req.body.actionType || 'external',
      badgeText: req.body.badgeText || '',
    };

    const existingIndex = (activeDb.banners || []).findIndex((b: any) => b.id === targetId);
    if (existingIndex >= 0) {
      activeDb.banners[existingIndex] = { ...activeDb.banners[existingIndex], ...bannerData };
    } else {
      activeDb.banners = [...(activeDb.banners || []), bannerData];
    }

    writeDb(activeDb);
    res.status(201).json(bannerData);
  });

  app.put('/api/banners/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = (activeDb.banners || []).findIndex((b: any) => b.id === id);
    if (index === -1) {
      const created = { id, ...req.body };
      activeDb.banners = [...(activeDb.banners || []), created];
      writeDb(activeDb);
      return res.json(created);
    }

    activeDb.banners[index] = {
      ...activeDb.banners[index],
      ...req.body,
      id,
    };
    writeDb(activeDb);
    res.json(activeDb.banners[index]);
  });

  app.delete('/api/banners/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    activeDb.deletedBannerIds = Array.from(new Set([...(activeDb.deletedBannerIds || []), id]));
    activeDb.banners = (activeDb.banners || []).filter((b: any) => b.id !== id);
    res.json({ success: true, id, banners: activeDb.banners });
  });

  // Static uploads directory
  app.use('/public', express.static(path.resolve(__dirname, 'public')));

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GB STUDY Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
