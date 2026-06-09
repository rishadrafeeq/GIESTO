import { useCategories } from '../../context/CategoriesContext';
import { getDisplayPrice, totalStock } from '../../utils/productHelpers';

function StatusBadge({ product }) {
  const stock = totalStock(product);
  if (!product.active) {
    return <span className="admin-badge admin-badge-muted">Hidden</span>;
  }
  if (stock === 0) {
    return <span className="admin-badge admin-badge-danger">Sold out</span>;
  }
  if (stock <= 3) {
    return <span className="admin-badge admin-badge-warning">Low stock</span>;
  }
  return <span className="admin-badge admin-badge-success">In stock</span>;
}

export default function ProductList({ products, onEdit, onDelete }) {
  const { getLabel } = useCategories();

  if (!products.length) {
    return (
      <div className="admin-empty-state">
        <div className="admin-empty-icon" aria-hidden="true">+</div>
        <h3>No products yet</h3>
        <p>Add your first product to start selling on the shop.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Sizes</th>
            <th>Status</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const stock = totalStock(p);
            return (
              <tr key={p.id} className={!p.active ? 'admin-row-hidden' : ''}>
                <td>
                  <div className="admin-table-product">
                    <img src={p.image} alt="" className="admin-thumb" />
                    <div>
                      <strong>{p.name}</strong>
                      <span className="admin-table-id">{p.id}</span>
                      {p.featured && <span className="admin-badge admin-badge-featured">New arrival</span>}
                    </div>
                  </div>
                </td>
                <td><span className="admin-cat-pill">{getLabel(p.category)}</span></td>
                <td className="admin-table-price">{getDisplayPrice(p)}</td>
                <td>
                  <div className="size-chips">
                    {p.sizes.map((s) => (
                      <span key={s.size} className={`chip${s.stock === 0 ? ' chip-out' : ''}`}>
                        {s.size} · {s.stock}
                      </span>
                    ))}
                  </div>
                  <span className="admin-stock-total">{stock} total</span>
                </td>
                <td><StatusBadge product={p} /></td>
                <td>
                  <div className="admin-product-actions">
                    <button type="button" className="btn btn-small btn-ghost" onClick={() => onEdit(p.id)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-small btn-danger-outline" onClick={() => onDelete(p.id)}>
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="admin-cards-mobile">
        {products.map((p) => {
          const stock = totalStock(p);
          return (
            <article key={p.id} className={`admin-product-card${!p.active ? ' admin-row-hidden' : ''}`}>
              <img src={p.image} alt="" className="admin-card-img" />
              <div className="admin-card-body">
                <div className="admin-card-top">
                  <strong>{p.name}</strong>
                  <StatusBadge product={p} />
                </div>
                <p className="admin-card-meta">
                  {getLabel(p.category)} · {getDisplayPrice(p)} · {stock} in stock
                </p>
                <div className="size-chips">
                  {p.sizes.map((s) => (
                    <span key={s.size} className={`chip${s.stock === 0 ? ' chip-out' : ''}`}>
                      {s.size}:{s.stock}
                    </span>
                  ))}
                </div>
                <div className="admin-product-actions">
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => onEdit(p.id)}>Edit</button>
                  <button type="button" className="btn btn-small btn-danger-outline" onClick={() => onDelete(p.id)}>Remove</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
