import { siteConfig } from '../config/siteConfig';
import { getCategoriesMap, getCategoryLabel } from './categoryHelpers';

export const STORAGE_KEY = 'giesto_products_v2';

export function categoryLabel(cat, categoriesMap = null) {
  return getCategoryLabel(cat, categoriesMap || getCategoriesMap());
}

/** Keep barcodes as scanned; slugify only manual text IDs with spaces. */
export function normalizeProductId(id) {
  const trimmed = String(id || '').trim();
  if (!trimmed) return '';
  if (!/\s/.test(trimmed)) return trimmed;
  return trimmed.toLowerCase().replace(/\s+/g, '-');
}

export function normalizeProduct(p, categoriesMap = null) {
  const cats = categoriesMap || getCategoriesMap();
  const category = (p.category || 'casual').toLowerCase().trim();
  const sizes = Array.isArray(p.sizes)
    ? p.sizes.map((s) => ({
        size: String(s.size || '').toUpperCase(),
        stock: Math.max(0, parseInt(s.stock, 10) || 0),
      }))
    : [];

  return {
    id: normalizeProductId(p.id),
    name: String(p.name || '').trim(),
    category,
    categoryLabel: getCategoryLabel(category, cats),
    price: Number(p.price) || 0,
    salePrice: p.salePrice != null && p.salePrice !== '' ? Number(p.salePrice) : null,
    image: p.image || '/assets/hero_suit.png',
    description: p.description || '',
    sizes,
    active: p.active !== false,
    featured: p.featured === true,
  };
}

export function totalStock(product) {
  return product.sizes.reduce((sum, s) => sum + s.stock, 0);
}

export function isSoldOut(product) {
  return totalStock(product) === 0;
}

export function formatPrice(amount) {
  return siteConfig.currency + Number(amount).toLocaleString('en-IN');
}

export function getDisplayPrice(product) {
  const price =
    product.salePrice != null && product.salePrice < product.price
      ? product.salePrice
      : product.price;
  return formatPrice(price);
}

export function getOriginalPrice(product) {
  if (product.salePrice != null && product.salePrice < product.price) {
    return formatPrice(product.price);
  }
  return null;
}

export async function fetchDefaultProducts() {
  const res = await fetch('/data/products.json');
  if (!res.ok) throw new Error('Failed to load products');
  const data = await res.json();
  return (data.products || []).map(normalizeProduct);
}

export function loadFromStorage(categoriesMap = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw).map((p) => normalizeProduct(p, categoriesMap));
  } catch {
    /* use default */
  }
  return null;
}

export function saveToStorage(products, categoriesMap = null) {
  const cats = categoriesMap || getCategoriesMap();
  const normalized = products.map((p) => normalizeProduct(p, cats));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportJson(products, categories = null) {
  const payload = { products };
  if (categories) payload.categories = categories;
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'giesto-backup.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
