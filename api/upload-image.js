import { put } from '@vercel/blob';
import {
  BLOB_ACCESS,
  blobStorageError,
  coverImageApiUrl,
  isBlobStorageReady,
} from './lib/blob.js';

function getAdminPin() {
  return process.env.ADMIN_PIN || 'giesto2026';
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.pin !== getAdminPin()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isBlobStorageReady()) {
    return Response.json({ error: blobStorageError() }, { status: 503 });
  }

  const { imageData, categoryId } = body;
  if (!imageData?.startsWith('data:') || !categoryId) {
    return Response.json({ error: 'Image data and category ID are required' }, { status: 400 });
  }

  const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return Response.json({ error: 'Invalid image data' }, { status: 400 });
  }

  const contentType = match[1];
  const base64 = match[2];
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const buffer = Buffer.from(base64, 'base64');

  if (buffer.length > 800000) {
    return Response.json({ error: 'Image too large (max 800 KB)' }, { status: 400 });
  }

  const pathname = `giesto/covers/${categoryId}.${ext}`;

  try {
    await put(pathname, buffer, {
      access: BLOB_ACCESS,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } catch (err) {
    return Response.json(
      { error: err.message || 'Failed to upload cover photo' },
      { status: 500 }
    );
  }

  return Response.json({ url: coverImageApiUrl(pathname) });
}
