import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Writable path on Vercel serverless is /tmp
const VERCEL_TMP_DB = '/tmp/database.json';
const STATIC_SEED_DB = path.resolve(process.cwd(), 'data', 'database.json');

const BLACKLIST_DELETED_PLATFORM_IDS = [
  'plat-1793674074703', // PW Test
  'plat-1793684455809', // PW Test 2
  'plat-1793684865029', // GB Live Study
];

const BLACKLIST_PLATFORM_NAMES = ['GB LIVE STUDY', 'PW TEST 2', 'PW TEST'];

// High-speed authoritative in-memory cache
let memoryDb: {
  platforms: any[];
  banners: any[];
  deletedPlatformIds: string[];
  deletedBannerIds: string[];
} = {
  platforms: [],
  banners: [],
  deletedPlatformIds: [...BLACKLIST_DELETED_PLATFORM_IDS],
  deletedBannerIds: [],
};

let dataVersion = Date.now();
let cachedSyncPayload = '';
let cachedEtag = `W/"${dataVersion}"`;
const sseClients = new Set<Response>();

function updateCachedPayload() {
  dataVersion = Date.now();
  cachedEtag = `W/"${dataVersion}"`;

  const sortedPlatforms = [...(memoryDb.platforms || [])].sort((a: any, b: any) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    return orderA - orderB;
  });

  cachedSyncPayload = JSON.stringify({
    platforms: sortedPlatforms,
    banners: memoryDb.banners || [],
    deletedPlatformIds: memoryDb.deletedPlatformIds || [],
    deletedBannerIds: memoryDb.deletedBannerIds || [],
    version: dataVersion,
    timestamp: Date.now(),
  });
}

function broadcastSync() {
  updateCachedPayload();
  const message = `event: sync\ndata: ${cachedSyncPayload}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

function readDb() {
  try {
    let raw = '';
    if (fs.existsSync(VERCEL_TMP_DB)) {
      raw = fs.readFileSync(VERCEL_TMP_DB, 'utf-8');
    } else if (fs.existsSync(STATIC_SEED_DB)) {
      raw = fs.readFileSync(STATIC_SEED_DB, 'utf-8');
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      const rawPlatforms = Array.isArray(parsed.platforms) ? parsed.platforms : [];
      const rawBanners = Array.isArray(parsed.banners) ? parsed.banners : [];
      const deletedPlatformIds = Array.isArray(parsed.deletedPlatformIds) ? parsed.deletedPlatformIds : [];
      const deletedBannerIds = Array.isArray(parsed.deletedBannerIds) ? parsed.deletedBannerIds : [];

      const allDeletedPlatforms = Array.from(new Set([...(memoryDb.deletedPlatformIds || []), ...deletedPlatformIds, ...BLACKLIST_DELETED_PLATFORM_IDS]));
      const allDeletedBanners = Array.from(new Set([...(memoryDb.deletedBannerIds || []), ...deletedBannerIds]));

      const platforms = rawPlatforms.filter((p: any) => {
        if (allDeletedPlatforms.includes(p.id)) return false;
        const normalizedName = (p.name || '').trim().toUpperCase();
        if (BLACKLIST_PLATFORM_NAMES.includes(normalizedName)) return false;
        return true;
      });

      const banners = rawBanners.filter((b: any) => !allDeletedBanners.includes(b.id));

      memoryDb = {
        platforms,
        banners,
        deletedPlatformIds: allDeletedPlatforms,
        deletedBannerIds: allDeletedBanners,
      };
      updateCachedPayload();
      return memoryDb;
    }
  } catch (e) {
    console.warn('Error reading DB:', e);
  }
  updateCachedPayload();
  return memoryDb;
}

function writeDb(data: any) {
  try {
    // Write to /tmp on Vercel, or fallback to project data directory
    const targetFile = fs.existsSync('/tmp') ? VERCEL_TMP_DB : STATIC_SEED_DB;
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // If filesystem is read-only, in-memory state remains authoritative
  }
}

// Initial DB seed
readDb();

// 1. Admin Verification
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === 'GBADMIN2026') {
    return res.json({ success: true, message: 'Authentication successful' });
  }
  return res.status(401).json({ success: false, message: 'Incorrect Password' });
});

// 2. Real-Time Server-Sent Events (SSE) Stream
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no',
  });

  res.write(`event: sync\ndata: ${cachedSyncPayload}\n\n`);
  sseClients.add(res);

  const keepaliveTimer = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch (e) {
      clearInterval(keepaliveTimer);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepaliveTimer);
    sseClients.delete(res);
  });
});

// 3. Ultra-Lightweight Version Check
app.get('/api/version', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=1, stale-while-revalidate=4');
  res.setHeader('ETag', cachedEtag);

  if (req.headers['if-none-match'] === cachedEtag) {
    return res.status(304).end();
  }

  res.json({ v: dataVersion });
});

// 4. Pre-Cached Full Sync State
app.get('/api/sync-state', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=1, stale-while-revalidate=5');
  res.setHeader('ETag', cachedEtag);

  if (req.headers['if-none-match'] === cachedEtag) {
    return res.status(304).end();
  }

  res.type('application/json').send(cachedSyncPayload);
});

app.get('/api/platforms/deleted', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=1, stale-while-revalidate=5');
  res.json(memoryDb.deletedPlatformIds || []);
});

app.get('/api/platforms', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=1, stale-while-revalidate=5');
  res.setHeader('ETag', cachedEtag);

  if (req.headers['if-none-match'] === cachedEtag) {
    return res.status(304).end();
  }

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
    memoryDb.deletedPlatformIds = Array.from(new Set([...memoryDb.deletedPlatformIds, ...deletedIds, ...BLACKLIST_DELETED_PLATFORM_IDS]));
  }

  if (Array.isArray(incomingPlatforms)) {
    const map = new Map<string, any>();
    (memoryDb.platforms || []).forEach((p: any) => {
      const normalizedName = (p.name || '').trim().toUpperCase();
      if (!memoryDb.deletedPlatformIds.includes(p.id) && !BLACKLIST_DELETED_PLATFORM_IDS.includes(p.id) && !BLACKLIST_PLATFORM_NAMES.includes(normalizedName)) {
        map.set(p.id, p);
      }
    });
    incomingPlatforms.forEach((p: any) => {
      const normalizedName = (p.name || '').trim().toUpperCase();
      if (!memoryDb.deletedPlatformIds.includes(p.id) && !BLACKLIST_DELETED_PLATFORM_IDS.includes(p.id) && !BLACKLIST_PLATFORM_NAMES.includes(normalizedName)) {
        map.set(p.id, p);
      }
    });
    memoryDb.platforms = Array.from(map.values());
    writeDb(memoryDb);
    broadcastSync();
  }

  const sorted = [...(memoryDb.platforms || [])].sort((a: any, b: any) => {
    const orderA = typeof a.order === 'number' ? a.order : 999;
    const orderB = typeof b.order === 'number' ? b.order : 999;
    return orderA - orderB;
  });
  res.json({ success: true, platforms: sorted, deletedPlatformIds: memoryDb.deletedPlatformIds });
});

// Add or Upsert Platform
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
  broadcastSync();
  res.status(201).json(platformData);
});

app.post('/api/platforms/reorder', (req: Request, res: Response) => {
  const { orderedPlatforms } = req.body;
  if (Array.isArray(orderedPlatforms)) {
    memoryDb.platforms = orderedPlatforms;
    writeDb(memoryDb);
    broadcastSync();
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
    broadcastSync();
    return res.json(created);
  }

  memoryDb.platforms[index] = {
    ...memoryDb.platforms[index],
    ...req.body,
    id,
  };
  writeDb(memoryDb);
  broadcastSync();
  res.json(memoryDb.platforms[index]);
});

app.delete('/api/platforms/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  memoryDb.deletedPlatformIds = Array.from(new Set([...(memoryDb.deletedPlatformIds || []), id]));
  memoryDb.platforms = (memoryDb.platforms || []).filter((p: any) => p.id !== id);
  writeDb(memoryDb);
  broadcastSync();
  res.json({ success: true, id, platforms: memoryDb.platforms, deletedPlatformIds: memoryDb.deletedPlatformIds });
});

// Banners Endpoints
app.get('/api/banners', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=1, stale-while-revalidate=5');
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
  broadcastSync();
  res.status(201).json(newBanner);
});

app.delete('/api/banners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  memoryDb.banners = (memoryDb.banners || []).filter((b: any) => b.id !== id);
  writeDb(memoryDb);
  broadcastSync();
  res.json({ success: true, id });
});

export default app;
