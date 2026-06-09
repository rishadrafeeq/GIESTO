import { useCategories } from '../../context/CategoriesContext';

export default function ShopFilters({ active, onChange }) {
  const { categoryList, getShopLabel } = useCategories();

  const filters = [
    { id: 'all', label: 'All' },
    ...categoryList.map((c) => ({ id: c.id, label: getShopLabel(c.id) })),
  ];

  return (
    <div className="shop-tabs">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          className={`shop-tab${active === f.id ? ' active' : ''}`}
          onClick={() => onChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function getCategoryLabel(id) {
  if (id === 'all') return 'All Products';
  try {
    const raw = localStorage.getItem('giesto_categories_v1');
    if (raw) {
      const list = JSON.parse(raw);
      const found = list.find((c) => c.id === id);
      if (found) return found.label;
    }
  } catch {
    /* fallback */
  }
  return id;
}
