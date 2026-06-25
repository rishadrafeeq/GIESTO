import { get, put } from '@vercel/blob';
import {
  BLOB_ACCESS,
  blobStorageError,
  isBlobStorageReady,
} from './lib/blob.js';

const CATEGORIES_PATH = 'giesto/categories.json';

function getAdminPin() {
  return process.env.ADMIN_PIN || 'giesto2026';
}

function unauthorized() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

function normalizeCategories(categories) {
  return (categories || []).map((c) => ({
    id: String(c.id || '').trim(),
    label: String(c.label || c.id || '').trim(),
    shopLabel: String(c.shopLabel || c.label || c.id || '').trim(),
    image: c.image || '/assets/hero_suit.png',
  }));
}

async function readStaticCategories(request) {
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/data/categories.json`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Static categories file not found');
  return res.json();
}

async function readBlobCategories() {
  const result = await get(CATEGORIES_PATH, { access: BLOB_ACCESS });
  if (!result) throw new Error('Categories not found in blob storage');
  const text = await new Response(result.stream).text();
  return JSON.parse(text);
}

export async function GET(request) {
  const headers = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' };

  if (isBlobStorageReady()) {
    try {
      const data = await readBlobCategories();
      return Response.json(
        {
          categories: normalizeCategories(data.categories),
          updatedAt: data.updatedAt || null,
          source: 'blob',
        },
        { headers }
      );
    } catch {
      /* fall through to static file */
    }
  }

  try {
    const data = await readStaticCategories(request);
    return Response.json(
      {
        categories: normalizeCategories(data.categories),
        updatedAt: data.updatedAt || null,
        source: 'static',
      },
      { headers }
    );
  } catch {
    return Response.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.pin !== getAdminPin()) return unauthorized();

  if (!isBlobStorageReady()) {
    return Response.json({ error: blobStorageError() }, { status: 503 });
  }

  const payload = {
    categories: normalizeCategories(body.categories),
    updatedAt: new Date().toISOString(),
  };

  try {
    await put(CATEGORIES_PATH, JSON.stringify(payload), {
      access: BLOB_ACCESS,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    return Response.json(
      { error: err.message || 'Failed to save categories to storage' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, updatedAt: payload.updatedAt });
}
