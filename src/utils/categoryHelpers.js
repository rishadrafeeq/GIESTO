import { siteConfig } from '../config/siteConfig';

export const CATEGORIES_STORAGE_KEY = 'giesto_categories_v1';

export function getDefaultCategories() {
  return { ...siteConfig.categories };
}

export function slugifyCategoryKey(label) {
  return String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function normalizeCategoryEntry(key, entry) {
  const id = slugifyCategoryKey(key);
  return {
    id,
    label: String(entry.label || id).trim(),
    shopLabel: String(entry.shopLabel || entry.label || id).trim(),
    image: entry.image || '/assets/hero_suit.png',
  };
}

export function categoriesToMap(list) {
  const map = {};
  list.forEach((c) => {
    map[c.id] = {
      label: c.label,
      shopLabel: c.shopLabel,
      image: c.image,
    };
  });
  return map;
}

export function mapToCategoryList(map) {
  return Object.entries(map).map(([id, entry]) =>
    normalizeCategoryEntry(id, { ...entry, label: entry.label || id })
  );
}

function parseCategoriesPayload(data) {
  const list = data.categories || data;
  const categories = (Array.isArray(list) ? list : mapToCategoryList(list)).map((c) =>
    normalizeCategoryEntry(c.id, c)
  );
  return { categories, updatedAt: data.updatedAt || null };
}

export function loadCategoriesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((c) => normalizeCategoryEntry(c.id, c));
      }
      return mapToCategoryList(parsed);
    }
  } catch {
    /* use defaults */
  }
  return null;
}

/** @deprecated Use fetchCategoriesFromServer — kept for legacy callers */
export function loadCategories() {
  return loadCategoriesFromLocalStorage() || mapToCategoryList(getDefaultCategories());
}

export async function fetchCategoriesFromServer() {
  try {
    const res = await fetch('/api/categories', { cache: 'no-store' });
    if (res.ok) return parseCategoriesPayload(await res.json());
  } catch {
    /* try static file */
  }

  const res = await fetch(`/data/categories.json?t=${Date.now()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load categories');
  return parseCategoriesPayload(await res.json());
}

export async function saveCategoriesToServer(categoryList, pin) {
  const normalized = categoryList.map((c) => normalizeCategoryEntry(c.id, c));
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({ pin, categories: normalized }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save categories for all devices');
  }

  return { categories: normalized, updatedAt: data.updatedAt || new Date().toISOString() };
}

export async function uploadCategoryImage(imageData, categoryId, pin) {
  if (!imageData?.startsWith('data:')) return imageData;

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, imageData, categoryId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload cover photo');
  }

  return data.url;
}

export function categoryImageUrl(image, updatedAt) {
  if (!image) return '/assets/hero_suit.png';
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  if (!updatedAt) return image;
  const sep = image.includes('?') ? '&' : '?';
  return `${image}${sep}v=${encodeURIComponent(updatedAt)}`;
}

export function saveCategoriesToStorage(categoryList) {
  const normalized = categoryList.map((c) => normalizeCategoryEntry(c.id, c));
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearCategoriesStorage() {
  localStorage.removeItem(CATEGORIES_STORAGE_KEY);
}

export function getCategoriesMap(categoryList = null) {
  const list = categoryList || loadCategories();
  return categoriesToMap(list);
}

export function getCategoryLabel(cat, categoriesMap = null) {
  const map = categoriesMap || getCategoriesMap();
  return map[cat]?.label || cat;
}

export function getCategoryShopLabel(cat, categoriesMap = null) {
  const map = categoriesMap || getCategoriesMap();
  return map[cat]?.shopLabel || map[cat]?.label || cat;
}
