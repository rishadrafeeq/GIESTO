import { useState, useEffect } from 'react';
import { useCategories } from '../../context/CategoriesContext';
import { useBarcodeInput } from '../../hooks/useBarcodeInput';
import { normalizeProduct, normalizeProductId } from '../../utils/productHelpers';

const EMPTY_SIZES = [
  { size: 'S', stock: 0 },
  { size: 'M', stock: 0 },
  { size: 'L', stock: 0 },
  { size: 'XL', stock: 0 },
];

const WATCH_SIZES = [{ size: 'OS', stock: 0 }];

export default function ProductForm({ product, existingIds = [], onSave, onCancel }) {
  const isEdit = Boolean(product);
  const { categoryList, getLabel } = useCategories();
  const defaultCategory = categoryList[0]?.id || 'casual';

  const [form, setForm] = useState({
    id: '',
    name: '',
    category: defaultCategory,
    price: '',
    salePrice: '',
    description: '',
    image: '/assets/hero_suit.png',
    imagePath: '',
    featured: false,
    active: true,
    sizes: EMPTY_SIZES,
  });
  const [errors, setErrors] = useState({});
  const [scannedFlash, setScannedFlash] = useState(false);

  const {
    inputRef: barcodeRef,
    scanReady,
    focusForScan,
    handleKeyDown: handleBarcodeKeyDown,
    handleBlur: handleBarcodeBlur,
    handleFocus: handleBarcodeFocus,
  } = useBarcodeInput({
    autoFocus: !isEdit,
    enabled: !isEdit,
    onScan: (value) => {
      set('id', value);
      setScannedFlash(true);
      setTimeout(() => setScannedFlash(false), 2000);
    },
  });

  useEffect(() => {
    if (product) {
      setForm({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        salePrice: product.salePrice ?? '',
        description: product.description,
        image: product.image,
        imagePath: product.image.startsWith('data:') ? '' : product.image,
        featured: product.featured,
        active: product.active,
        sizes: product.sizes.length ? [...product.sizes] : EMPTY_SIZES,
      });
    } else {
      setForm((f) => ({ ...f, category: defaultCategory }));
    }
    setErrors({});
  }, [product, defaultCategory]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const applyCategoryPresets = (category) => {
    if (isEdit) return;
    if (category === 'watches' || category === 'sunglasses') {
      set('sizes', [...WATCH_SIZES]);
    }
  };

  const updateSize = (i, field, val) => {
    const sizes = [...form.sizes];
    sizes[i] = { ...sizes[i], [field]: field === 'stock' ? parseInt(val, 10) || 0 : val.toUpperCase() };
    set('sizes', sizes);
  };

  const addSize = () => set('sizes', [...form.sizes, { size: '', stock: 0 }]);
  const removeSize = (i) => set('sizes', form.sizes.filter((_, idx) => idx !== i));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 800000) {
      setErrors((err) => ({ ...err, image: 'Image too large (max 800 KB). Use an /assets/ path instead.' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set('image', reader.result);
      setErrors((err) => ({ ...err, image: '' }));
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const next = {};
    const id = normalizeProductId(form.id);
    if (!id) next.id = 'Scan or enter a barcode / product ID';
    else if (!isEdit && existingIds.includes(id)) {
      next.id = 'This barcode is already used by another product';
    }
    if (!form.name.trim()) next.name = 'Product name is required';
    if (!form.price && form.price !== 0) next.price = 'Price is required';
    const validSizes = form.sizes.filter((s) => s.size);
    if (!validSizes.length) next.sizes = 'Add at least one size with stock';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const saved = normalizeProduct({
      id: normalizeProductId(form.id),
      name: form.name.trim(),
      category: form.category,
      price: parseFloat(form.price) || 0,
      salePrice: form.salePrice !== '' ? parseFloat(form.salePrice) : null,
      description: form.description.trim(),
      image: form.image.startsWith('data:') ? form.image : form.imagePath || form.image,
      sizes: form.sizes.filter((s) => s.size),
      featured: form.featured,
      active: form.active,
    });

    onSave(saved);
  };

  const categoryHint = form.category
    ? `Shows in ${getLabel(form.category)} on the shop`
    : '';

  return (
    <div className="admin-modal-backdrop" onClick={onCancel} role="presentation">
      <form
        className="admin-form admin-modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-form-header">
          <div>
            <p className="admin-form-eyebrow">{isEdit ? 'Editing product' : 'New product'}</p>
            <h2>{isEdit ? form.name || 'Edit product' : 'Add product'}</h2>
          </div>
          <button type="button" className="admin-modal-close" onClick={onCancel} aria-label="Close">
            ×
          </button>
        </header>

        <div className="admin-form-body">
          <section className="admin-form-section">
            <h3>Basic details</h3>

            <div className="form-group">
              <label htmlFor="f-id">Barcode / Product ID</label>
              <div className={`admin-barcode-field${scanReady ? ' is-ready' : ''}${scannedFlash ? ' is-scanned' : ''}`}>
                <input
                  id="f-id"
                  ref={barcodeRef}
                  className={`form-control${errors.id ? ' is-error' : ''}`}
                  value={form.id}
                  onChange={(e) => set('id', e.target.value)}
                  onKeyDown={!isEdit ? handleBarcodeKeyDown : undefined}
                  onFocus={!isEdit ? handleBarcodeFocus : undefined}
                  onBlur={!isEdit ? handleBarcodeBlur : undefined}
                  disabled={isEdit}
                  placeholder="Scan barcode or type ID"
                  autoComplete="off"
                  inputMode="numeric"
                  required
                />
                {!isEdit && (
                  <button type="button" className="btn btn-small btn-ghost admin-scan-btn" onClick={focusForScan}>
                    {scanReady ? 'Ready to scan…' : 'Scan'}
                  </button>
                )}
              </div>
              {errors.id ? (
                <span className="field-error">{errors.id}</span>
              ) : (
                <small className="field-hint">
                  {isEdit
                    ? 'Barcode cannot be changed after saving'
                    : 'Click Scan, then scan with your USB barcode scanner — or type the code manually'}
                </small>
              )}
              {scannedFlash && <span className="admin-scan-ok">Barcode captured</span>}
            </div>

            <div className="form-group">
              <label htmlFor="f-name">Product name</label>
              <input
                id="f-name"
                className={`form-control${errors.name ? ' is-error' : ''}`}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Navy Linen Shirt"
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="f-category">Category</label>
              <select
                id="f-category"
                className="form-control"
                value={form.category}
                onChange={(e) => {
                  set('category', e.target.value);
                  applyCategoryPresets(e.target.value);
                }}
              >
                {categoryList.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <small className="field-hint">{categoryHint}</small>
            </div>

            <div className="form-group">
              <label htmlFor="f-desc">Description</label>
              <textarea
                id="f-desc"
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Fabric, fit, and style notes customers will see…"
              />
            </div>
          </section>

          <section className="admin-form-section">
            <h3>Pricing</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="f-price">Regular price (₹)</label>
                <input
                  id="f-price"
                  type="number"
                  className={`form-control${errors.price ? ' is-error' : ''}`}
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  min="0"
                  required
                />
                {errors.price && <span className="field-error">{errors.price}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="f-sale">Sale price (optional)</label>
                <input
                  id="f-sale"
                  type="number"
                  className="form-control"
                  value={form.salePrice}
                  onChange={(e) => set('salePrice', e.target.value)}
                  min="0"
                  placeholder="Leave blank if not on sale"
                />
              </div>
            </div>
          </section>

          <section className="admin-form-section">
            <h3>Photo</h3>
            <div className="image-upload-row">
              <div className="admin-preview-box">
                <img src={form.image} alt="Preview" className="admin-preview-img" />
              </div>
              <div className="admin-upload-fields">
                <label className="admin-upload-btn">
                  Choose image
                  <input type="file" accept="image/*" hidden onChange={handleImage} />
                </label>
                <p className="field-hint">JPG or PNG, max 800 KB</p>
                <label htmlFor="f-image-path" className="sr-only">Image path</label>
                <input
                  id="f-image-path"
                  className={`form-control${errors.image ? ' is-error' : ''}`}
                  value={form.imagePath}
                  onChange={(e) => {
                    set('imagePath', e.target.value);
                    if (e.target.value) set('image', e.target.value);
                  }}
                  placeholder="Or paste path: /assets/my-product.png"
                />
                {errors.image && <span className="field-error">{errors.image}</span>}
              </div>
            </div>
          </section>

          <section className="admin-form-section">
            <h3>Sizes &amp; stock</h3>
            <p className="field-hint section-hint">
              Clothing: S, M, L, XL. Watches/sunglasses: use OS (one size) or model code.
            </p>
            {errors.sizes && <span className="field-error">{errors.sizes}</span>}
            <div className="size-rows">
              <div className="size-row size-row-head">
                <span>Size</span>
                <span>Quantity</span>
                <span />
              </div>
              {form.sizes.map((s, i) => (
                <div key={i} className="size-row">
                  <input
                    className="form-control"
                    placeholder="e.g. M or OS"
                    value={s.size}
                    maxLength={6}
                    onChange={(e) => updateSize(i, 'size', e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={s.stock}
                    min={0}
                    onChange={(e) => updateSize(i, 'stock', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-small btn-icon-danger"
                    onClick={() => removeSize(i)}
                    aria-label="Remove size"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-outline btn-small" onClick={addSize}>+ Add size</button>
          </section>

          <section className="admin-form-section admin-form-section-last">
            <h3>Visibility</h3>
            <div className="form-toggles">
              <label className="admin-toggle">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                <span className="admin-toggle-ui" />
                <span>
                  <strong>Show on shop</strong>
                  <small>Turn off to hide without deleting</small>
                </span>
              </label>
              <label className="admin-toggle">
                <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
                <span className="admin-toggle-ui" />
                <span>
                  <strong>New Arrivals</strong>
                  <small>Highlight on the homepage</small>
                </span>
              </label>
            </div>
          </section>
        </div>

        <footer className="admin-form-footer">
          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn btn-dark">
            {isEdit ? 'Save changes' : 'Add product'}
          </button>
        </footer>
      </form>
    </div>
  );
}
