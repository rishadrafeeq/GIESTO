import { useState } from 'react';
import { useCategories } from '../../context/CategoriesContext';
import { useProducts } from '../../context/ProductsContext';

export default function CategoryManager({ onNotify }) {
  const { categoryList, addCategory, removeCategory } = useCategories();
  const { products } = useProducts();
  const [label, setLabel] = useState('');
  const [shopLabel, setShopLabel] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const countFor = (id) => products.filter((p) => p.category === id).length;

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    const result = addCategory({ label, shopLabel, image });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLabel('');
    setShopLabel('');
    setImage('');
    onNotify?.('Category added.');
  };

  const handleRemove = (id) => {
    const count = countFor(id);
    const cat = categoryList.find((c) => c.id === id);
    if (count > 0) {
      onNotify?.(`Cannot remove "${cat?.label}" — ${count} product(s) still use it.`);
      return;
    }
    setRemovingId(id);
  };

  const confirmRemove = () => {
    const result = removeCategory(removingId, countFor(removingId));
    setRemovingId(null);
    if (!result.ok) {
      onNotify?.(result.error);
      return;
    }
    onNotify?.('Category removed.');
  };

  return (
    <div className="admin-categories">
      <form className="admin-category-add" onSubmit={handleAdd}>
        <h3>Add category</h3>
        <p className="field-hint section-hint">
          Add Watches, Sunglasses, or any new collection. It appears on the shop homepage and filters.
        </p>
        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cat-label">Category name</label>
            <input
              id="cat-label"
              className="form-control"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Watches"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cat-shop">Shop tab label (optional)</label>
            <input
              id="cat-shop"
              className="form-control"
              value={shopLabel}
              onChange={(e) => setShopLabel(e.target.value)}
              placeholder="Short name on shop filters"
            />
          </div>
          <div className="form-group">
            <label htmlFor="cat-image">Image path (optional)</label>
            <input
              id="cat-image"
              className="form-control"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/assets/hero_suit.png"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-dark btn-small">+ Add category</button>
      </form>

      <div className="admin-category-list-wrap">
        <h3>Your categories ({categoryList.length})</h3>
        <ul className="admin-category-list">
          {categoryList.map((cat) => {
            const count = countFor(cat.id);
            return (
              <li key={cat.id} className="admin-category-item">
                <div
                  className="admin-category-thumb"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                <div className="admin-category-info">
                  <strong>{cat.label}</strong>
                  <span>Shop tab: {cat.shopLabel}</span>
                  <span>{count} product{count !== 1 ? 's' : ''}</span>
                </div>
                <button
                  type="button"
                  className="btn btn-small btn-danger-outline"
                  onClick={() => handleRemove(cat.id)}
                  disabled={categoryList.length <= 1}
                  title={count > 0 ? 'Move products before removing' : 'Remove category'}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {removingId && (
        <div className="admin-modal-backdrop" onClick={() => setRemovingId(null)} role="presentation">
          <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()} role="dialog">
            <h3>Remove category?</h3>
            <p>
              &quot;{categoryList.find((c) => c.id === removingId)?.label}&quot; will be removed from
              the shop. Products are not affected because none use this category.
            </p>
            <div className="admin-confirm-actions">
              <button type="button" className="btn btn-outline" onClick={() => setRemovingId(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger-solid" onClick={confirmRemove}>
                Remove category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
