/**
 * Shop UI — product grids, filters, size picker, WhatsApp order
 */
async function initShop() {
    if (window.giestoProductsReady) await window.giestoProductsReady;

    initNavigation();
    initHeroSlider();
    renderCategoryCards();
    renderHomeProducts();
    initShopPage();
    initProductModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShop);
} else {
    initShop();
}

function getProducts() {
    return window.GIESTO_PRODUCTS_LIST || [];
}

function getConfig() {
    return window.GIESTO_CONFIG || {};
}

function initNavigation() {
    const toggle = document.getElementById('mobile-toggle');
    const nav = document.getElementById('nav-menu');
    const header = document.getElementById('header');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
        });
    }

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 30);
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (nav) nav.classList.remove('active');
            if (toggle) toggle.classList.remove('active');
        });
    });
}

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length < 2) return;

    let idx = 0;
    setInterval(() => {
        slides[idx].classList.remove('active');
        idx = (idx + 1) % slides.length;
        slides[idx].classList.add('active');
    }, 5000);
}

function productCardHtml(p, index = 0) {
    const S = window.GiestoStore;
    const soldOut = S.isSoldOut(p);
    const stock = S.totalStock(p);
    const lowStock = !soldOut && stock <= 3;

    return `
        <article class="product-card" data-id="${p.id}" data-category="${p.category}" style="animation-delay:${(index % 8) * 0.05}s">
            <div class="product-card-media">
                ${soldOut ? '<span class="badge badge-sold">Sold Out</span>' : ''}
                ${lowStock ? `<span class="badge badge-low">Only ${stock} left</span>` : ''}
                <img src="${p.image}" alt="${p.name}" loading="lazy">
                <button type="button" class="product-quick-btn" data-open-product="${p.id}">Select options</button>
            </div>
            <div class="product-card-body">
                <span class="product-brand">${getConfig().shopName || 'GIESTO'}</span>
                <h3 class="product-name">${p.name}</h3>
                <div class="product-prices">
                    <span class="price-sale">${S.getDisplayPrice(p)}</span>
                    ${S.getOriginalPrice(p) ? `<span class="price-was">${S.getOriginalPrice(p)}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

function renderCategoryCards() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    const products = getProducts();
    const cats = getConfig().categories || {
        formal: { label: 'Formal Wear' },
        casual: { label: 'Casual Wear' },
        sports: { label: 'Sports Wear' }
    };

    grid.innerHTML = Object.entries(cats).map(([key, val]) => {
        const count = products.filter(p => p.category === key).length;
        return `
            <a href="collection.html?cat=${key}" class="category-card">
                <div class="category-card-img category-card-img--${key}"></div>
                <h3>${val.label}</h3>
                <p>${count} items</p>
            </a>
        `;
    }).join('');
}

function renderHomeProducts() {
    const grid = document.getElementById('home-products');
    if (!grid) return;

    const featured = getProducts().filter(p => p.featured);
    const list = featured.length ? featured : getProducts().slice(0, 8);
    grid.innerHTML = list.map((p, i) => productCardHtml(p, i)).join('');
    bindProductButtons(grid);
}

let shopFilterInitialized = false;

function initShopPage() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;

    const params = new URLSearchParams(location.search);
    const catParam = params.get('cat');
    let currentFilter = catParam || 'all';

    const tabs = document.querySelectorAll('.shop-tab');
    const applyFilter = (filter) => {
        currentFilter = filter;
        const products = getProducts();
        const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

        tabs.forEach(t => t.classList.toggle('active', t.dataset.filter === filter));
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.filter === filter);
        });

        grid.innerHTML = filtered.length
            ? filtered.map((p, i) => productCardHtml(p, i)).join('')
            : '<p class="shop-empty">No products in this category.</p>';

        bindProductButtons(grid);

        const empty = document.getElementById('collection-empty');
        if (empty) empty.hidden = filtered.length > 0;
    };

    if (!shopFilterInitialized) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
        });
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
        });
        shopFilterInitialized = true;
    }

    applyFilter(currentFilter);
}

function bindProductButtons(container) {
    container.querySelectorAll('[data-open-product]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openProductModal(btn.getAttribute('data-open-product'));
        });
    });
}

function initProductModal() {
    const modal = document.getElementById('product-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    if (!modal) return;

    const close = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) close();
    });
}

function openProductModal(productId) {
    const modal = document.getElementById('product-modal');
    const body = document.getElementById('modal-body-content');
    if (!modal || !body) return;

    const p = getProducts().find(x => x.id === productId);
    if (!p) return;

    const S = window.GiestoStore;
    const soldOut = S.isSoldOut(p);
    const availableSizes = p.sizes.filter(s => s.stock > 0);

    body.innerHTML = `
        <div class="modal-product">
            <div class="modal-product-img">
                <img src="${p.image}" alt="${p.name}">
            </div>
            <div class="modal-product-info">
                <span class="product-brand">${p.categoryLabel}</span>
                <h2>${p.name}</h2>
                <div class="product-prices modal-prices">
                    <span class="price-sale">${S.getDisplayPrice(p)}</span>
                    ${S.getOriginalPrice(p) ? `<span class="price-was">${S.getOriginalPrice(p)}</span>` : ''}
                </div>
                <p class="modal-desc">${p.description}</p>

                <div class="size-section">
                    <label class="size-label">Select size</label>
                    <div class="size-grid" id="size-grid">
                        ${p.sizes.map(s => `
                            <button type="button" class="size-btn ${s.stock === 0 ? 'disabled' : ''}"
                                data-size="${s.size}" data-stock="${s.stock}" ${s.stock === 0 ? 'disabled' : ''}>
                                ${s.size}
                                <small>${s.stock === 0 ? 'Out' : s.stock + ' left'}</small>
                            </button>
                        `).join('')}
                    </div>
                </div>

                ${soldOut
                    ? '<p class="stock-msg sold">This item is currently sold out.</p>'
                    : '<p class="stock-msg" id="size-hint">Please select a size</p>'}

                <button type="button" class="btn btn-whatsapp" id="btn-whatsapp-order" disabled>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Order on WhatsApp
                </button>
            </div>
        </div>
    `;

    let selectedSize = null;
    const waBtn = document.getElementById('btn-whatsapp-order');
    const hint = document.getElementById('size-hint');

    body.querySelectorAll('.size-btn:not(.disabled)').forEach(btn => {
        btn.addEventListener('click', () => {
            body.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
            if (waBtn) waBtn.disabled = false;
            if (hint) hint.textContent = `Size ${selectedSize} selected — ${btn.dataset.stock} in stock`;
        });
    });

    waBtn?.addEventListener('click', () => {
        if (!selectedSize) return;
        const sizeRow = p.sizes.find(s => s.size === selectedSize);
        const price = S.getDisplayPrice(p);
        const msg = encodeURIComponent(
            `Hi ${getConfig().shopName}! I want to order:\n\n` +
            `Product: ${p.name}\n` +
            `Size: ${selectedSize}\n` +
            `Price: ${price}\n` +
            `Category: ${p.categoryLabel}\n\n` +
            `Please confirm availability.`
        );
        const phone = (getConfig().whatsappNumber || '').replace(/\D/g, '');
        window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.openProductModal = openProductModal;
