import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useCategories } from './CategoriesContext';
import {
  fetchDefaultProducts,
  loadFromStorage,
  saveToStorage,
  clearStorage,
  normalizeProduct,
} from '../utils/productHelpers';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const stored = loadFromStorage(categories);
    if (stored) {
      setProducts(stored);
    } else {
      const defaults = await fetchDefaultProducts();
      setProducts(defaults.map((p) => normalizeProduct(p, categories)));
    }
    setLoading(false);
  }, [categories]);

  useEffect(() => {
    load();
  }, [load]);

  const saveProducts = useCallback((list) => {
    const saved = saveToStorage(list, categories);
    setProducts(saved);
    return saved;
  }, [categories]);

  const resetProducts = useCallback(async () => {
    clearStorage();
    await load();
  }, [load]);

  const shopProducts = products.filter((p) => p.active);

  return (
    <ProductsContext.Provider
      value={{ products, shopProducts, loading, saveProducts, resetProducts, reload: load }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider');
  return ctx;
}

export { normalizeProduct };
