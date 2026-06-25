import { useState } from 'react';
import { useCategories } from '../../context/CategoriesContext';
import { useProducts } from '../../context/ProductsContext';

function CategoryCoverField({ image, imagePath, onImageChange, onPathChange, error, idPrefix }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800000) {
      onImageChange(null, 'Image too large (max 800 KB). Use an /assets/ path instead.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onImageChange(reader.result, '');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="image-upload-row">
      <div className="admin-preview-box admin-preview-box-category">
        <img src={image} alt="Category cover preview" className="admin-preview-img" />
      </div>
      <div className="admin-upload-fields">
        <label className="admin-upload-btn" htmlFor={`${idPrefix}-file`}>
          Choose cover photo
          <input
            id={`${idPrefix}-file`}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />
        </label>
        <p className="field-hint">JPG or PNG, max 800 KB</p>
        <label htmlFor={`${idPrefix}-path`} className="sr-only">Image path</label>
        <input
          id={`${idPrefix}-path`}
          className={`form-control${error ? ' is-error' : ''}`}
          value={imagePath}
          onChange={(e) => onPathChange(e.target.value)}
          placeholder="Or paste path: /assets/my-cover.png"
        />
        {error && <span className="field-error">{error}</span>}
      </div>
    </div>
  );
}

export default function CategoryManager({ onNotify }) {
  const { categoryList, addCategory, removeCategory, updateCategory } = useCategories();
  const { products } = useProducts();
  const [label, setLabel] = useState('');
  const [shopLabel, setShopLabel] = useState('');
  const [image, setImage] = useState('/assets/hero_suit.png');
  const [imagePath, setImagePath] = useState('');
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editImage, setEditImage] = useState('');
  const [editImagePath, setEditImagePath] = useState('');
  const [editImageError, setEditImageError] = useState('');

  const countFor = (id) => products.filter((p) => p.category === id).length;

  const handleAddImageChange = (nextImage, nextError = '') => {
    if (nextImage) setImage(nextImage);
    setImageError(nextError);
    if (nextImage && !nextImage.startsWith('data:')) setImagePath(nextImage);
    else if (nextImage?.startsWith('data:')) setImagePath('');
  };

  const handleAddPathChange = (path) => {
    setImagePath(path);
    setImageError('');
    if (path.trim()) setImage(path.trim());
  };

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
    setImage('/assets/hero_suit.png');
    setImagePath('');
    setImageError('');
    onNotify?.('Category added.');
  };

  const openEditCover = (cat) => {
    setEditingId(cat.id);
    setEditImage(cat.image);
    setEditImagePath(cat.image.startsWith('data:') ? '' : cat.image);
    setEditImageError('');
  };

  const closeEditCover = () => {
    setEditingId(null);
    setEditImage('');
    setEditImagePath('');
    setEditImageError('');
  };

  const handleEditImageChange = (nextImage, nextError = '') => {
    if (nextImage) setEditImage(nextImage);
    setEditImageError(nextError);
    if (nextImage && !nextImage.startsWith('data:')) setEditImagePath(nextImage);
    else if (nextImage?.startsWith('data:')) setEditImagePath('');
  };

  const handleEditPathChange = (path) => {
    setEditImagePath(path);
    setEditImageError('');
    if (path.trim()) setEditImage(path.trim());
  };

  const saveEditCover = () => {
    if (!editImage.trim()) {
      setEditImageError('Choose a cover photo or enter an image path.');
      return;
    }
    const result = updateCategory(editingId, { image: editImage });
    if (!result.ok) {
      onNotify?.(result.error);
      return;
    }
    onNotify?.('Category cover updated.');
    closeEditCover();
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

  const editingCategory = categoryList.find((c) => c.id === editingId);

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
        </div>
        <div className="form-group">
          <label>Cover photo</label>
          <CategoryCoverField
            idPrefix="cat-add"
            image={image}
            imagePath={imagePath}
            onImageChange={handleAddImageChange}
            onPathChange={handleAddPathChange}
            error={imageError}
          />
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
                <div className="admin-category-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-outline"
                    onClick={() => openEditCover(cat)}
                  >
                    Edit cover
                  </button>
                  <button
                    type="button"
                    className="btn btn-small btn-danger-outline"
                    onClick={() => handleRemove(cat.id)}
                    disabled={categoryList.length <= 1}
                    title={count > 0 ? 'Move products before removing' : 'Remove category'}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {editingCategory && (
        <div className="admin-modal-backdrop" onClick={closeEditCover} role="presentation">
          <div
            className="admin-confirm-dialog admin-category-cover-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3>Edit cover — {editingCategory.label}</h3>
            <p className="field-hint section-hint">
              This image appears on the shop homepage category cards.
            </p>
            <CategoryCoverField
              idPrefix="cat-edit"
              image={editImage}
              imagePath={editImagePath}
              onImageChange={handleEditImageChange}
              onPathChange={handleEditPathChange}
              error={editImageError}
            />
            <div className="admin-confirm-actions">
              <button type="button" className="btn btn-outline" onClick={closeEditCover}>
                Cancel
              </button>
              <button type="button" className="btn btn-dark" onClick={saveEditCover}>
                Save cover
              </button>
            </div>
          </div>
        </div>
      )}

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
