import { useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/home/HeroSlider';
import CategoryGrid from '../components/shop/CategoryGrid';
import ProductGrid from '../components/shop/ProductGrid';
import ProductModal from '../components/shop/ProductModal';
import { useProducts } from '../context/ProductsContext';
import { siteConfig } from '../config/siteConfig';

export default function HomePage() {
  const { shopProducts, loading } = useProducts();
  const [selected, setSelected] = useState(null);

  const featured = shopProducts.filter((p) => p.featured);
  const display = featured.length ? featured : shopProducts.slice(0, 8);

  return (
    <main>
      <HeroSlider />

      <section className="section categories-section">
        <div className="container">
          <h2 className="section-heading text-center">Shop by Categories</h2>
          <CategoryGrid />
        </div>
      </section>

      <section className="section products-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-heading">New Arrivals</h2>
            <Link to="/shop" className="link-more">Shop all →</Link>
          </div>
          {loading ? (
            <p className="collection-loading">Loading products…</p>
          ) : (
            <ProductGrid products={display} onSelectProduct={setSelected} />
          )}
        </div>
      </section>

      <section className="promo-banner">
        <div className="container promo-inner">
          <span className="promo-badge">Limited Offer</span>
          <h2>Upgrade Your Wardrobe</h2>
          <p>Select your size and order on WhatsApp — no online payment needed.</p>
          <Link to="/shop" className="btn btn-light">Shop Now</Link>
        </div>
      </section>

      <section className="section ig-section text-center">
        <div className="container">
          <h2 className="section-heading">Stay Connected on Instagram</h2>
          <p className="section-sub">
            Follow <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">@geistooffical</a>
          </p>
          <Link to="/lookbook" className="btn btn-outline">Explore Lookbook</Link>
        </div>
      </section>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
