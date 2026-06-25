import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../context/CategoriesContext';
import { useProducts } from '../../context/ProductsContext';
import { categoryImageUrl } from '../../utils/categoryHelpers';

export default function CategoryGrid() {
  const { categoryList, loading, updatedAt } = useCategories();
  const { shopProducts } = useProducts();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const overflow = el.scrollWidth > el.clientWidth + 4;
    setShowControls(overflow);
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [categoryList, loading, updateScrollState]);

  const scrollBy = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 160);
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
    window.setTimeout(updateScrollState, 350);
  };

  if (loading) {
    return <p className="collection-loading">Loading categories…</p>;
  }

  return (
    <div className="category-grid-wrap">
      {showControls && (
        <p className="category-scroll-hint" aria-hidden="true">
          Swipe or tap arrows to see more categories →
        </p>
      )}

      <div className="category-grid-row">
        {showControls && (
          <button
            type="button"
            className="category-scroll-btn category-scroll-btn-prev"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label="Scroll categories left"
          >
            ‹
          </button>
        )}

        <div
          className="category-grid"
          ref={scrollRef}
          onScroll={updateScrollState}
        >
          {categoryList.map((cat) => {
            const count = shopProducts.filter((p) => p.category === cat.id).length;
            return (
              <Link key={cat.id} to={`/shop?cat=${cat.id}`} className="category-card">
                <img
                  src={categoryImageUrl(cat.image, updatedAt)}
                  alt={cat.label}
                  className="category-card-img"
                  loading="lazy"
                />
                <h3>{cat.label}</h3>
                <p>{count} items</p>
              </Link>
            );
          })}
        </div>

        {showControls && (
          <button
            type="button"
            className="category-scroll-btn category-scroll-btn-next"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label="Scroll categories right"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
