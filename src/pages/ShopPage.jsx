import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ShopFilters from '../components/shop/ShopFilters';
import ProductGrid from '../components/shop/ProductGrid';
import ProductModal from '../components/shop/ProductModal';
import { useProducts } from '../context/ProductsContext';

export default function ShopPage() {
  const { shopProducts, loading } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState(null);

  const filter = searchParams.get('cat') || 'all';

  const filtered = useMemo(() => {
    if (filter === 'all') return shopProducts;
    return shopProducts.filter((p) => p.category === filter);
  }, [shopProducts, filter]);

  const setFilter = (cat) => {
    if (cat === 'all') setSearchParams({});
    else setSearchParams({ cat });
  };

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <h1>Shop All Products</h1>
          <p>Select a product, choose your size, order on WhatsApp</p>
        </div>
      </section>

      <section className="section shop-section">
        <div className="container">
          <ShopFilters active={filter} onChange={setFilter} />
          {loading ? (
            <p className="collection-loading">Loading…</p>
          ) : (
            <ProductGrid products={filtered} onSelectProduct={setSelected} />
          )}
        </div>
      </section>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
