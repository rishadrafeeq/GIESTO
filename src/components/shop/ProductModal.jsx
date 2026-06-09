import { useState } from 'react';
import { getDisplayPrice, getOriginalPrice, isSoldOut } from '../../utils/productHelpers';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

export default function ProductModal({ product, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);

  if (!product) return null;

  const soldOut = isSoldOut(product);

  const handleWhatsApp = () => {
    if (!selectedSize) return;
    window.open(buildWhatsAppUrl(product, selectedSize), '_blank');
  };

  return (
    <div className="modal-backdrop active" onClick={onClose} role="presentation">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">&times;</button>
        <div className="modal-product">
          <div className="modal-product-img">
            <img src={product.image} alt={product.name} />
          </div>
          <div className="modal-product-info">
            <span className="product-brand">{product.categoryLabel}</span>
            <h2>{product.name}</h2>
            <div className="product-prices modal-prices">
              <span className="price-sale">{getDisplayPrice(product)}</span>
              {getOriginalPrice(product) && (
                <span className="price-was">{getOriginalPrice(product)}</span>
              )}
            </div>
            <p className="modal-desc">{product.description}</p>

            <div className="size-section">
              <span className="size-label">Select size</span>
              <div className="size-grid">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    className={`size-btn${s.stock === 0 ? ' disabled' : ''}${selectedSize === s.size ? ' selected' : ''}`}
                    disabled={s.stock === 0}
                    onClick={() => setSelectedSize(s.size)}
                  >
                    {s.size}
                    <small>{s.stock === 0 ? 'Out' : `${s.stock} left`}</small>
                  </button>
                ))}
              </div>
            </div>

            {soldOut ? (
              <p className="stock-msg sold">This item is currently sold out.</p>
            ) : (
              <p className="stock-msg">
                {selectedSize ? `Size ${selectedSize} selected` : 'Please select a size'}
              </p>
            )}

            <button
              type="button"
              className="btn btn-whatsapp"
              disabled={!selectedSize || soldOut}
              onClick={handleWhatsApp}
            >
              Order on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
