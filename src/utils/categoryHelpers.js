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

export function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((c) => normalizeCategoryEntry(c.id, c));
      return mapToCategoryList(parsed);
    }
  } catch {
    /* use defaults */
  }
  return mapToCategoryList(getDefaultCategories());
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
