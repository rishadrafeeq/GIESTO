import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  getDefaultCategories,
  getCategoriesMap,
  getCategoryLabel,
  getCategoryShopLabel,
  loadCategories,
  mapToCategoryList,
  normalizeCategoryEntry,
  saveCategoriesToStorage,
  slugifyCategoryKey,
  clearCategoriesStorage,
} from '../utils/categoryHelpers';

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categoryList, setCategoryList] = useState(() => {
    const loaded = loadCategories();
    if (!localStorage.getItem('giesto_categories_v1')) {
      saveCategoriesToStorage(loaded);
    }
    return loaded;
  });

  const categories = useMemo(() => getCategoriesMap(categoryList), [categoryList]);

  const saveCategories = useCallback((list) => {
    const saved = saveCategoriesToStorage(list);
    setCategoryList(saved);
    return saved;
  }, []);

  const addCategory = useCallback(
    ({ label, shopLabel, image }) => {
      const trimmed = String(label || '').trim();
      if (!trimmed) return { ok: false, error: 'Category name is required.' };

      const id = slugifyCategoryKey(trimmed);
      if (!id) return { ok: false, error: 'Enter a valid category name.' };
      if (categoryList.some((c) => c.id === id)) {
        return { ok: false, error: 'A category with this name already exists.' };
      }

      const next = [
        ...categoryList,
        normalizeCategoryEntry(id, {
          label: trimmed,
          shopLabel: shopLabel?.trim() || trimmed,
          image: image?.trim() || '/assets/hero_suit.png',
        }),
      ];
      saveCategories(next);
      return { ok: true };
    },
    [categoryList, saveCategories]
  );

  const removeCategory = useCallback(
    (id, productCount = 0) => {
      if (categoryList.length <= 1) {
        return { ok: false, error: 'You must keep at least one category.' };
      }
      if (productCount > 0) {
        return {
          ok: false,
          error: `${productCount} product(s) use this category. Move or remove them first.`,
        };
      }
      saveCategories(categoryList.filter((c) => c.id !== id));
      return { ok: true };
    },
    [categoryList, saveCategories]
  );

  const resetCategories = useCallback(() => {
    clearCategoriesStorage();
    const defaults = mapToCategoryList(getDefaultCategories());
    saveCategories(defaults);
    return defaults;
  }, [saveCategories]);

  const value = useMemo(
    () => ({
      categoryList,
      categories,
      saveCategories,
      addCategory,
      removeCategory,
      resetCategories,
      getLabel: (id) => getCategoryLabel(id, categories),
      getShopLabel: (id) => getCategoryShopLabel(id, categories),
    }),
    [categoryList, categories, saveCategories, addCategory, removeCategory, resetCategories]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error('useCategories must be used inside CategoriesProvider');
  return ctx;
}
