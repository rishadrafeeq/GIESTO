import ProductCard from './ProductCard';

/** Grid of product cards */
export default function ProductGrid({ products, onSelectProduct }) {
  if (!products.length) {
    return <p className="shop-empty">No products in this category.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} onSelect={onSelectProduct} />
      ))}
    </div>
  );
}
