import { siteConfig } from '../../config/siteConfig';
import { isSoldOut, totalStock, getDisplayPrice, getOriginalPrice } from '../../utils/productHelpers';

export default function ProductCard({ product, index = 0, onSelect }) {
  const soldOut = isSoldOut(product);
  const stock = totalStock(product);
  const lowStock = !soldOut && stock <= 3;

  return (
    <article className="product-card" style={{ animationDelay: `${(index % 8) * 0.05}s` }}>
      <div className="product-card-media">
        {soldOut && <span className="badge badge-sold">Sold Out</span>}
        {lowStock && <span className="badge badge-low">Only {stock} left</span>}
        <img src={product.image} alt={product.name} loading="lazy" />
        <button type="button" className="product-quick-btn" onClick={() => onSelect(product)}>
          Select options
        </button>
      </div>
      <div className="product-card-body">
        <span className="product-brand">{siteConfig.shopName}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-prices">
          <span className="price-sale">{getDisplayPrice(product)}</span>
          {getOriginalPrice(product) && (
            <span className="price-was">{getOriginalPrice(product)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
