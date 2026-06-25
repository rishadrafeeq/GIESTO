import { get } from '@vercel/blob';
import { BLOB_ACCESS, isBlobStorageReady } from './lib/blob.js';

export async function GET(request) {
  const path = new URL(request.url).searchParams.get('path');
  if (!path || path.includes('..')) {
    return new Response('Invalid path', { status: 400 });
  }

  if (!isBlobStorageReady()) {
    return new Response('Storage not configured', { status: 503 });
  }

  try {
    const result = await get(path, { access: BLOB_ACCESS });
    if (!result) return new Response('Not found', { status: 404 });

    return new Response(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Failed to load image', { status: 500 });
  }
}
