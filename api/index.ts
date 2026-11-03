import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DB_FILE = path.resolve(process.cwd(), 'data', 'database.json');

function readDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [],
        banners: Array.isArray(parsed.banners) ? parsed.banners : [],
      };
    }
  } catch (e) {
    // ignore
  }
  return { platforms: [], banners: [] };
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // on read-only environments
  }
}

// In-memory persistent database cache
let memoryDb: {
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

try {
  const loaded = readDb();
  memoryDb.platforms = loaded.platforms || [];
  memoryDb.banners = loaded.banners || [];
} catch (e) {}

app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === 'GBADMIN2026') {
    return res.json({ success: true, message: 'Authentication successful' });
  }
  return res.status(401).json({ success: false, message: 'Incorrect Password' });
});

app.get('/api/platforms', (_req: Request, res: Response) => {
  const sorted = [...(memoryDb.platforms || [])].sort((a: any, b: any) => {
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
    memoryDb.deletedPlatformIds = Array.from(new Set([...memoryDb.deletedPlatformIds, ...deletedIds]));
  }

  if (Array.isArray(incomingPlatforms)) {
    const map = new Map<string, any>();
    (memoryDb.platforms || []).forEach((p: any) => {
      if (!memoryDb.deletedPlatformIds.includes(p.id)) {
        map.set(p.id, p);
      }
    });
    incomingPlatforms.forEach((p: any) => {
      if (!memoryDb.deletedPlatformIds.includes(p.id)) {
        map.set(p.id, p);
      }
    });
    memoryDb.platforms = Array.from(map.values());
    writeDb(memoryDb);
  }

  const sorted = [...(memoryDb.platforms || [])].sort((a: any, b: any) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    return orderA - orderB;
  });
  res.json({ success: true, platforms: sorted });
});

app.post('/api/platforms', (req: Request, res: Response) => {
  const existingList = memoryDb.platforms || [];
  const targetId = req.body.id || 'plat-' + Date.now();
  const nextOrder = typeof req.body.order === 'number' ? req.body.order : existingList.length + 1;

  memoryDb.deletedPlatformIds = (memoryDb.deletedPlatformIds || []).filter((id) => id !== targetId);

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
    memoryDb.platforms = [...existingList];
  } else {
    memoryDb.platforms = [...existingList, platformData];
  }

  writeDb(memoryDb);
  res.status(201).json(platformData);
});

app.post('/api/platforms/reorder', (req: Request, res: Response) => {
  const { orderedPlatforms } = req.body;
  if (Array.isArray(orderedPlatforms)) {
    memoryDb.platforms = orderedPlatforms;
    writeDb(memoryDb);
    return res.json({ success: true, platforms: memoryDb.platforms });
  }
  res.status(400).json({ error: 'orderedPlatforms array required' });
});

app.put('/api/platforms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = (memoryDb.platforms || []).findIndex((p: any) => p.id === id);
  if (index === -1) {
    const created = {
      id,
      name: req.body.name || 'New Platform',
      subtitle: req.body.subtitle || '',
      logo: req.body.logo || '/app-icon.png',
      url: req.body.url || '',
      openMode: req.body.openMode || 'new_tab',
      tabPlacement: req.body.tabPlacement || 'live',
      order: req.body.order || (memoryDb.platforms || []).length + 1,
      batchesCount: 10,
      ...req.body,
    };
    memoryDb.platforms = [...(memoryDb.platforms || []), created];
    writeDb(memoryDb);
    return res.json(created);
  }

  memoryDb.platforms[index] = {
    ...memoryDb.platforms[index],
    ...req.body,
    id,
  };
  writeDb(memoryDb);
  res.json(memoryDb.platforms[index]);
});

app.delete('/api/platforms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  memoryDb.deletedPlatformIds = Array.from(new Set([...(memoryDb.deletedPlatformIds || []), id]));
  memoryDb.platforms = (memoryDb.platforms || []).filter((p: any) => p.id !== id);
  writeDb(memoryDb);
  res.json({ success: true, id, platforms: memoryDb.platforms });
});

app.get('/api/banners', (_req: Request, res: Response) => {
  res.json(memoryDb.banners || []);
});

app.post('/api/banners', (req: Request, res: Response) => {
  const newBanner = {
    id: req.body.id || 'banner-' + Date.now(),
    title: req.body.title || 'New Banner',
    subtitle: req.body.subtitle || '',
    imageUrl: req.body.imageUrl || '',
    actionUrl: req.body.actionUrl || 'https://t.me/GBFreestudy',
    actionType: req.body.actionType || 'external',
    badgeText: req.body.badgeText || '',
  };

  memoryDb.banners = [...(memoryDb.banners || []), newBanner];
  writeDb(memoryDb);
  res.status(201).json(newBanner);
});

app.delete('/api/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  memoryDb.banners = (memoryDb.banners || []).filter((b: any) => b.id !== id);
  writeDb(memoryDb);
  res.json({ success: true, id });
});

export default app;
