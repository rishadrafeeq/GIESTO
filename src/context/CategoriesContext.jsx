import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import {
  getDefaultCategories,
  getCategoriesMap,
  getCategoryLabel,
  getCategoryShopLabel,
  mapToCategoryList,
  normalizeCategoryEntry,
  saveCategoriesToStorage,
  clearCategoriesStorage,
  slugifyCategoryKey,
  fetchCategoriesFromServer,
  saveCategoriesToServer,
  uploadCategoryImage,
} from '../utils/categoryHelpers';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { categories, updatedAt: remoteUpdatedAt } = await fetchCategoriesFromServer();
      setCategoryList(categories);
      setUpdatedAt(remoteUpdatedAt);
      saveCategoriesToStorage(categories);
    } catch {
      const defaults = mapToCategoryList(getDefaultCategories());
      setCategoryList(defaults);
      setUpdatedAt(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persistCategories = useCallback(async (list, { imageUploads = [] } = {}) => {
    let next = list.map((c) => normalizeCategoryEntry(c.id, c));

    for (const { id, image } of imageUploads) {
      if (!image?.startsWith('data:')) continue;
      const url = await uploadCategoryImage(image, id, siteConfig.adminPin);
      next = next.map((c) => (c.id === id ? { ...c, image: url } : c));
    }

    const result = await saveCategoriesToServer(next, siteConfig.adminPin);
    setCategoryList(result.categories);
    setUpdatedAt(result.updatedAt);
    saveCategoriesToStorage(result.categories);
    return { ok: true, categories: result.categories };
  }, []);

  const saveCategories = useCallback(
    async (list, options) => {
      try {
        return await persistCategories(list, options);
      } catch (err) {
        return { ok: false, error: err.message || 'Failed to save categories' };
      }
    },
    [persistCategories]
  );

  const addCategory = useCallback(
    async ({ label, shopLabel, image }) => {
      const trimmed = String(label || '').trim();
      if (!trimmed) return { ok: false, error: 'Category name is required.' };

      const id = slugifyCategoryKey(trimmed);
      if (!id) return { ok: false, error: 'Enter a valid category name.' };
      if (categoryList.some((c) => c.id === id)) {
        return { ok: false, error: 'A category with this name already exists.' };
      }

      const entry = normalizeCategoryEntry(id, {
        label: trimmed,
        shopLabel: shopLabel?.trim() || trimmed,
        image: image?.trim() || '/assets/hero_suit.png',
      });

      const next = [...categoryList, entry];
      return saveCategories(next, {
        imageUploads: image?.startsWith('data:') ? [{ id, image }] : [],
      });
    },
    [categoryList, saveCategories]
  );

  const removeCategory = useCallback(
    async (id, productCount = 0) => {
      if (categoryList.length <= 1) {
        return { ok: false, error: 'You must keep at least one category.' };
      }
      if (productCount > 0) {
        return {
          ok: false,
          error: `${productCount} product(s) use this category. Move or remove them first.`,
        };
      }
      return saveCategories(categoryList.filter((c) => c.id !== id));
    },
    [categoryList, saveCategories]
  );

  const updateCategory = useCallback(
    async (id, updates) => {
      const index = categoryList.findIndex((c) => c.id === id);
      if (index === -1) return { ok: false, error: 'Category not found.' };

      const current = categoryList[index];
      const next = [...categoryList];
      next[index] = normalizeCategoryEntry(id, {
        ...current,
        label: updates.label?.trim() || current.label,
        shopLabel: updates.shopLabel?.trim() || current.shopLabel,
        image: updates.image?.trim() || current.image,
      });

      const image = updates.image?.trim();
      return saveCategories(next, {
        imageUploads: image?.startsWith('data:') ? [{ id, image }] : [],
      });
    },
    [categoryList, saveCategories]
  );

  const resetCategories = useCallback(async () => {
    clearCategoriesStorage();
    const defaults = mapToCategoryList(getDefaultCategories());
    const result = await saveCategories(defaults);
    if (!result.ok) {
      setCategoryList(defaults);
      setUpdatedAt(null);
      saveCategoriesToStorage(defaults);
    }
    return defaults;
  }, [saveCategories]);

  const value = useMemo(
    () => ({
      categoryList,
      categories: getCategoriesMap(categoryList),
      loading,
      updatedAt,
      reload: load,
      saveCategories,
      addCategory,
      removeCategory,
      updateCategory,
      resetCategories,
      getLabel: (id) => getCategoryLabel(id, getCategoriesMap(categoryList)),
      getShopLabel: (id) => getCategoryShopLabel(id, getCategoriesMap(categoryList)),
    }),
    [categoryList, loading, updatedAt, load, saveCategories, addCategory, removeCategory, updateCategory, resetCategories]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories must be used inside CategoriesProvider');
  return ctx;
}
