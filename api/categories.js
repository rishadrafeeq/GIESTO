import { put, head } from '@vercel/blob';

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
  const meta = await head(CATEGORIES_PATH);
  const res = await fetch(meta.url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to read categories from storage');
  return res.json();
}

export async function GET(request) {
  const headers = { 'Cache-Control': 'no-store, max-age=0, must-revalidate' };

  if (process.env.BLOB_READ_WRITE_TOKEN) {
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

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        error:
          'Server storage is not set up. In Vercel → Storage → create a Blob store and link it to this project, then redeploy.',
      },
      { status: 503 }
    );
  }

  const payload = {
    categories: normalizeCategories(body.categories),
    updatedAt: new Date().toISOString(),
  };

  await put(CATEGORIES_PATH, JSON.stringify(payload), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  return Response.json({ ok: true, updatedAt: payload.updatedAt });
}
