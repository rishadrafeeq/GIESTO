import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import AdminLogin, { isAdminAuthed, setAdminAuthed } from '../components/admin/AdminLogin';

import CategoryManager from '../components/admin/CategoryManager';

import ProductList from '../components/admin/ProductList';

import ProductForm from '../components/admin/ProductForm';

import { useCategories } from '../context/CategoriesContext';

import { useProducts } from '../context/ProductsContext';

import { exportJson, normalizeProduct, totalStock } from '../utils/productHelpers';

import { mapToCategoryList, saveCategoriesToStorage } from '../utils/categoryHelpers';

import { siteConfig } from '../config/siteConfig';



const LOW_STOCK_THRESHOLD = 3;



function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {

  return (

    <div className="admin-modal-backdrop" onClick={onCancel} role="presentation">

      <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">

        <h3>{title}</h3>

        <p>{message}</p>

        <div className="admin-confirm-actions">

          <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>

          <button type="button" className="btn btn-danger-solid" onClick={onConfirm}>{confirmLabel}</button>

        </div>

      </div>

    </div>

  );

}



export default function AdminPage() {

  const { products, saveProducts, resetProducts } = useProducts();

  const { categoryList, categories, resetCategories } = useCategories();

  const [authed, setAuthed] = useState(isAdminAuthed());

  const [tab, setTab] = useState('products');

  const [editing, setEditing] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('all');

  const [confirmAction, setConfirmAction] = useState(null);

  const [toolsOpen, setToolsOpen] = useState(false);



  const notify = (msg) => {

    setToast(msg);

    setTimeout(() => setToast(''), 3500);

  };



  const stats = useMemo(() => {

    let inStock = 0;

    let lowStock = 0;

    let soldOut = 0;

    let hidden = 0;



    products.forEach((p) => {

      const stock = totalStock(p);

      if (!p.active) hidden += 1;

      else if (stock === 0) soldOut += 1;

      else {

        inStock += 1;

        if (stock <= LOW_STOCK_THRESHOLD) lowStock += 1;

      }

    });



    return { total: products.length, inStock, lowStock, soldOut, hidden };

  }, [products]);



  const filteredProducts = useMemo(() => {

    const q = search.trim().toLowerCase();

    return products.filter((p) => {

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;

      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);

      return matchesCat && matchesSearch;

    });

  }, [products, search, categoryFilter]);



  const existingIds = useMemo(() => products.map((p) => p.id), [products]);



  const openAddForm = () => {

    setEditing(null);

    setShowForm(true);

  };



  const openEditForm = (id) => {

    setEditing(products.find((p) => p.id === id));

    setShowForm(true);

  };



  const handleSave = (product) => {

    const list = [...products];

    const idx = list.findIndex((p) => p.id === product.id);

    if (idx >= 0) list[idx] = product;

    else list.push(product);

    saveProducts(list);

    setShowForm(false);

    setEditing(null);

    notify(idx >= 0 ? 'Product updated successfully.' : 'Product added to your shop.');

  };



  const handleDelete = (id) => {

    const product = products.find((p) => p.id === id);

    setConfirmAction({

      title: 'Remove product?',

      message: `"${product?.name || id}" will be removed from your catalog. You can restore it later from a backup.`,

      confirmLabel: 'Remove product',

      onConfirm: () => {

        saveProducts(products.filter((p) => p.id !== id));

        setConfirmAction(null);

        notify('Product removed.');

      },

    });

  };



  const handleImport = async (e) => {

    const file = e.target.files?.[0];

    e.target.value = '';

    if (!file) return;

    try {

      const data = JSON.parse(await file.text());

      const list = (data.products || data).map((p) => normalizeProduct(p, categories));

      saveProducts(list);

      if (data.categories) {
        const cats = Array.isArray(data.categories)
          ? data.categories
          : mapToCategoryList(data.categories);
        saveCategoriesToStorage(cats);
        window.location.reload();
        return;
      }

      notify(`Imported ${list.length} products.`);

    } catch {

      notify('Import failed — please use a valid JSON backup file.');

    }

    setToolsOpen(false);

  };



  const handleReset = () => {

    setConfirmAction({

      title: 'Reset to defaults?',

      message: 'This replaces all products and categories with the original catalog. Download a backup first if you need to keep your changes.',

      confirmLabel: 'Reset catalog',

      onConfirm: () => {

        resetProducts();

        resetCategories();

        setConfirmAction(null);

        notify('Catalog reset to defaults.');

      },

    });

    setToolsOpen(false);

  };



  if (!authed) {

    return <AdminLogin onSuccess={() => setAuthed(true)} />;

  }



  return (

    <div className="admin-page">

      <header className="admin-topbar">

        <div className="container admin-topbar-inner">

          <div className="admin-brand">

            <Link to="/" className="admin-brand-link">{siteConfig.shopName}</Link>

            <span className="admin-brand-sub">Admin Panel</span>

          </div>

          <div className="admin-top-actions">

            <Link to="/shop" className="btn btn-small btn-ghost admin-view-shop" target="_blank" rel="noreferrer">

              View shop ↗

            </Link>

            {tab === 'products' && (

              <button type="button" className="btn btn-dark" onClick={openAddForm}>+ Add product</button>

            )}

            <button

              type="button"

              className="btn btn-small btn-outline"

              onClick={() => { setAdminAuthed(false); setAuthed(false); }}

            >

              Sign out

            </button>

          </div>

        </div>

      </header>



      <div className="container admin-body">

        <div className="admin-stats">

          <div className="admin-stat-card">

            <span className="admin-stat-value">{stats.total}</span>

            <span className="admin-stat-label">Total products</span>

          </div>

          <div className="admin-stat-card admin-stat-success">

            <span className="admin-stat-value">{stats.inStock}</span>

            <span className="admin-stat-label">In stock</span>

          </div>

          <div className="admin-stat-card admin-stat-warning">

            <span className="admin-stat-value">{stats.lowStock}</span>

            <span className="admin-stat-label">Low stock</span>

          </div>

          <div className="admin-stat-card">

            <span className="admin-stat-value">{categoryList.length}</span>

            <span className="admin-stat-label">Categories</span>

          </div>

        </div>



        <div className="admin-tabs">

          <button

            type="button"

            className={`admin-tab${tab === 'products' ? ' active' : ''}`}

            onClick={() => setTab('products')}

          >

            Products

          </button>

          <button

            type="button"

            className={`admin-tab${tab === 'categories' ? ' active' : ''}`}

            onClick={() => setTab('categories')}

          >

            Categories

          </button>

        </div>



        {tab === 'products' ? (

          <div className="admin-panel">

            <div className="admin-panel-toolbar">

              <div className="admin-search-wrap">

                <input

                  type="search"

                  className="form-control admin-search"

                  placeholder="Search by name or barcode…"

                  value={search}

                  onChange={(e) => setSearch(e.target.value)}

                />

              </div>

              <select

                className="form-control admin-filter"

                value={categoryFilter}

                onChange={(e) => setCategoryFilter(e.target.value)}

              >

                <option value="all">All categories</option>

                {categoryList.map((c) => (

                  <option key={c.id} value={c.id}>{c.label}</option>

                ))}

              </select>

              <div className="admin-tools">

                <button

                  type="button"

                  className="btn btn-outline btn-small"

                  onClick={() => setToolsOpen((o) => !o)}

                  aria-expanded={toolsOpen}

                >

                  Tools ▾

                </button>

                {toolsOpen && (

                  <div className="admin-tools-menu">

                    <button

                      type="button"

                      onClick={() => {

                        exportJson(products, categoryList);

                        setToolsOpen(false);

                        notify('Backup downloaded (products + categories).');

                      }}

                    >

                      Download backup

                    </button>

                    <label>

                      Import backup

                      <input type="file" accept=".json" hidden onChange={handleImport} />

                    </label>

                    <button type="button" className="admin-tools-danger" onClick={handleReset}>

                      Reset to defaults

                    </button>

                  </div>

                )}

              </div>

            </div>



            <div className="admin-quick-guide">

              <details>

                <summary>Quick guide — products &amp; barcode scanner</summary>

                <ol>

                  <li>Click <strong>Add product</strong> → click <strong>Scan</strong> → scan the barcode with your USB scanner.</li>

                  <li>USB scanners work like a keyboard — the barcode fills in automatically when you scan.</li>

                  <li>Pick category (Formal, Watches, Sunglasses, etc.), price, photo, and stock per size.</li>

                  <li>Use <strong>Download backup</strong> regularly to save products and categories.</li>

                </ol>

              </details>

            </div>



            {filteredProducts.length === 0 && products.length > 0 ? (

              <div className="admin-empty-state admin-empty-filter">

                <h3>No matches</h3>

                <p>Try a different search or category filter.</p>

                <button type="button" className="btn btn-outline btn-small" onClick={() => { setSearch(''); setCategoryFilter('all'); }}>

                  Clear filters

                </button>

              </div>

            ) : (

              <ProductList

                products={filteredProducts}

                onEdit={openEditForm}

                onDelete={handleDelete}

              />

            )}

          </div>

        ) : (

          <div className="admin-panel admin-panel-padded">

            <CategoryManager onNotify={notify} />

          </div>

        )}

      </div>



      {showForm && (

        <ProductForm

          product={editing}

          existingIds={existingIds}

          onSave={handleSave}

          onCancel={() => { setShowForm(false); setEditing(null); }}

        />

      )}



      {confirmAction && (

        <ConfirmDialog

          {...confirmAction}

          onCancel={() => setConfirmAction(null)}

        />

      )}



      <div className={`admin-toast${toast ? ' show' : ''}`} role="status" aria-live="polite">

        {toast}

      </div>

    </div>

  );

}

