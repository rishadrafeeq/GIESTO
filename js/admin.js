/**
 * Admin panel — add/edit products, sizes, stock, photos (no coding needed)
 */
(function () {
    const PIN_KEY = 'giesto_admin_auth';
    let allProducts = [];
    let editingId = null;

    const $ = (sel) => document.querySelector(sel);
    const getConfig = () => window.GIESTO_CONFIG || {};

    function isAuthed() {
        return sessionStorage.getItem(PIN_KEY) === '1';
    }

    function showLogin() {
        $('#admin-login').hidden = false;
        $('#admin-panel').hidden = true;
    }

    function showPanel() {
        $('#admin-login').hidden = true;
        $('#admin-panel').hidden = false;
    }

    async function loadAll() {
        allProducts = await window.GiestoStore.loadProducts();
        renderProductList();
    }

    function renderProductList() {
        const list = $('#product-list');
        if (!list) return;

        if (!allProducts.length) {
            list.innerHTML = '<p class="admin-empty">No products yet. Click "Add new product".</p>';
            return;
        }

        list.innerHTML = allProducts.map(p => {
            const stock = window.GiestoStore.totalStock(p);
            const status = !p.active ? 'Hidden' : stock === 0 ? 'Sold out' : `${stock} in stock`;
            return `
                <div class="admin-product-row">
                    <img src="${p.image}" alt="" class="admin-thumb">
                    <div class="admin-product-meta">
                        <strong>${p.name}</strong>
                        <span>${p.categoryLabel} · ${window.GiestoStore.getDisplayPrice(p)} · ${status}</span>
                        <div class="size-chips">${p.sizes.map(s => `<span class="chip ${s.stock === 0 ? 'chip-out' : ''}">${s.size}:${s.stock}</span>`).join('')}</div>
                    </div>
                    <div class="admin-product-actions">
                        <button type="button" class="btn btn-small" data-edit="${p.id}">Edit</button>
                        <button type="button" class="btn btn-small btn-danger" data-delete="${p.id}">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => openForm(btn.dataset.edit));
        });
        list.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', () => deleteProduct(btn.dataset.delete));
        });
    }

    function openForm(id = null) {
        editingId = id;
        const form = $('#product-form');
        const title = $('#form-title');
        const p = id ? allProducts.find(x => x.id === id) : null;

        title.textContent = id ? 'Edit product' : 'Add new product';
        $('#f-id').value = p?.id || '';
        $('#f-id').disabled = !!id;
        $('#f-name').value = p?.name || '';
        $('#f-category').value = p?.category || 'casual';
        $('#f-price').value = p?.price ?? '';
        $('#f-sale').value = p?.salePrice ?? '';
        $('#f-desc').value = p?.description || '';
        $('#f-featured').checked = p?.featured === true;
        $('#f-active').checked = p?.active !== false;
        $('#f-image-preview').src = p?.image || '../assets/hero_suit.png';
        $('#f-image-data').value = p?.image?.startsWith('data:') ? p.image : '';

        renderSizeRows(p?.sizes || [{ size: 'S', stock: 0 }, { size: 'M', stock: 0 }, { size: 'L', stock: 0 }, { size: 'XL', stock: 0 }]);
        form.hidden = false;
        form.scrollIntoView({ behavior: 'smooth' });
    }

    function renderSizeRows(sizes) {
        const wrap = $('#size-rows');
        wrap.innerHTML = sizes.map((s, i) => `
            <div class="size-row" data-idx="${i}">
                <input type="text" class="form-control size-input" placeholder="Size" value="${s.size}" maxlength="6">
                <input type="number" class="form-control stock-input" placeholder="Qty" value="${s.stock}" min="0">
                <button type="button" class="btn btn-small btn-danger remove-size" title="Remove size">×</button>
            </div>
        `).join('');

        wrap.querySelectorAll('.remove-size').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.size-row').remove();
            });
        });
    }

    function collectSizes() {
        return [...document.querySelectorAll('.size-row')].map(row => ({
            size: row.querySelector('.size-input').value.trim().toUpperCase(),
            stock: parseInt(row.querySelector('.stock-input').value, 10) || 0
        })).filter(s => s.size);
    }

    function saveForm(e) {
        e.preventDefault();
        const id = ($('#f-id').value || '').trim().toLowerCase().replace(/\s+/g, '-');
        if (!id) return alert('Product ID is required (e.g. linen-shirt-blue)');

        const category = $('#f-category').value;
        const imageData = $('#f-image-data').value;
        const imagePath = $('#f-image-path').value.trim();

        const product = window.GiestoStore.normalizeProduct({
            id,
            name: $('#f-name').value.trim(),
            category,
            price: parseFloat($('#f-price').value) || 0,
            salePrice: $('#f-sale').value ? parseFloat($('#f-sale').value) : null,
            description: $('#f-desc').value.trim(),
            image: imageData || imagePath || '../assets/hero_suit.png',
            sizes: collectSizes(),
            featured: $('#f-featured').checked,
            active: $('#f-active').checked
        });

        const idx = allProducts.findIndex(x => x.id === id);
        if (idx >= 0) allProducts[idx] = product;
        else allProducts.push(product);

        window.GiestoStore.saveProducts(allProducts);
        $('#product-form').hidden = true;
        editingId = null;
        renderProductList();
        showToast('Product saved! Refresh the shop page to see changes.');
    }

    function deleteProduct(id) {
        if (!confirm('Remove this product from the shop?')) return;
        allProducts = allProducts.filter(p => p.id !== id);
        window.GiestoStore.saveProducts(allProducts);
        renderProductList();
        showToast('Product removed.');
    }

    function showToast(msg) {
        const t = $('#admin-toast');
        if (!t) return;
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3000);
    }

    function setupImageUpload() {
        $('#f-image-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (file.size > 800000) {
                alert('Image too large. Use under 800KB or upload to assets folder and paste path.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                $('#f-image-data').value = reader.result;
                $('#f-image-preview').src = reader.result;
            };
            reader.readAsDataURL(file);
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        if (!window.GiestoStore) return;

        $('#login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const pin = $('#login-pin').value;
            if (pin === getConfig().adminPin) {
                sessionStorage.setItem(PIN_KEY, '1');
                showPanel();
                loadAll();
            } else {
                alert('Wrong PIN. Ask your developer for the admin PIN.');
            }
        });

        if (isAuthed()) {
            showPanel();
            await loadAll();
        } else {
            showLogin();
        }

        $('#btn-add')?.addEventListener('click', () => openForm());
        $('#btn-cancel')?.addEventListener('click', () => { $('#product-form').hidden = true; });
        $('#product-form')?.addEventListener('submit', saveForm);
        $('#btn-add-size')?.addEventListener('click', () => {
            const wrap = $('#size-rows');
            const div = document.createElement('div');
            div.className = 'size-row';
            div.innerHTML = `
                <input type="text" class="form-control size-input" placeholder="Size" maxlength="6">
                <input type="number" class="form-control stock-input" placeholder="Qty" value="0" min="0">
                <button type="button" class="btn btn-small btn-danger remove-size">×</button>
            `;
            div.querySelector('.remove-size').addEventListener('click', () => div.remove());
            wrap.appendChild(div);
        });

        $('#btn-export')?.addEventListener('click', () => {
            window.GiestoStore.exportProductsJson(allProducts);
            showToast('Downloaded products.json — send to developer for permanent backup.');
        });

        $('#import-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const text = await file.text();
            const data = JSON.parse(text);
            allProducts = (data.products || data).map(window.GiestoStore.normalizeProduct);
            window.GiestoStore.saveProducts(allProducts);
            renderProductList();
            showToast('Products imported.');
        });

        $('#btn-reset')?.addEventListener('click', () => {
            if (!confirm('Reset to default products.json? This clears your saved changes.')) return;
            window.GiestoStore.clearSavedProducts();
            loadAll();
            showToast('Reset to default catalog.');
        });

        $('#btn-logout')?.addEventListener('click', () => {
            sessionStorage.removeItem(PIN_KEY);
            showLogin();
        });

        $('#f-category')?.addEventListener('change', (e) => {
            const hint = $('#category-hint');
            const labels = { formal: 'Formal Wear', casual: 'Casual Wear', sports: 'Sports Wear' };
            if (hint) hint.textContent = `Shows under: ${labels[e.target.value] || e.target.value}`;
        });

        setupImageUpload();
    });
})();
