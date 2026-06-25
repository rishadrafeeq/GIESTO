/** Vercel Blob: OIDC uses BLOB_STORE_ID + VERCEL_OIDC_TOKEN (auto on deploy). Legacy uses BLOB_READ_WRITE_TOKEN. */
export function isBlobStorageReady() {
  return Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);
}

export const BLOB_ACCESS = 'private';

export function blobStorageError() {
  return 'Storage not connected. In Vercel → Storage → connect giesto-storage to this project, then Redeploy.';
}

export function coverImageApiUrl(pathname) {
  return `/api/cover-image?path=${encodeURIComponent(pathname)}`;
}
