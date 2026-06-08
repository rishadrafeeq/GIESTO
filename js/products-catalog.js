/**
 * Loads products from JSON or Google Sheets (CSV) and renders the collection grid.
 */
(function () {
    const CATEGORY_LABELS = {
        formal: 'Formal Wear',
        casual: 'Casual Wear',
        sports: 'Sports Wear'
    };

    function parseCSV(text) {
        const rows = [];
        let row = [];
        let cell = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            const next = text[i + 1];

            if (ch === '"') {
                if (inQuotes && next === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === ',' && !inQuotes) {
                row.push(cell.trim());
                cell = '';
            } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
                if (ch === '\r' && next === '\n') i++;
                row.push(cell.trim());
                if (row.some(v => v !== '')) rows.push(row);
                row = [];
                cell = '';
            } else {
                cell += ch;
            }
        }

        if (cell.length || row.length) {
            row.push(cell.trim());
            if (row.some(v => v !== '')) rows.push(row);
        }

        if (!rows.length) return [];

        const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
        return rows.slice(1).map(cols => {
            const item = {};
            headers.forEach((key, idx) => {
                item[key] = cols[idx] || '';
            });
            return item;
        });
    }

    function sheetRowToProduct(row) {
        const category = (row.category || '').toLowerCase().trim();
        const active = (row.active || 'yes').toLowerCase() !== 'no';

        return {
            id: (row.id || '').trim(),
            name: (row.name || '').trim(),
            category,
            categoryLabel: row.category_label || CATEGORY_LABELS[category] || category,
            price: (row.price || '').trim(),
            image: (row.image || '').trim(),
            description: (row.description || '').trim(),
            specs: {
                fabric: row.spec_fabric || '',
                weight: row.spec_weight || '',
                detail: row.spec_detail || '',
                extra: row.spec_extra || ''
            },
            active
        };
    }

    function normalizeProduct(p) {
        const category = (p.category || '').toLowerCase().trim();
        return {
            id: p.id,
            name: p.name,
            category,
            categoryLabel: p.categoryLabel || CATEGORY_LABELS[category] || category,
            price: p.price,
            image: p.image,
            description: p.description || '',
            specs: p.specs || {},
            active: p.active !== false
        };
    }

    function productsToMap(products) {
        const map = {};
        products.forEach(p => {
            if (!p.id) return;
            map[p.id] = {
                title: p.name,
                category: p.categoryLabel,
                price: p.price,
                image: p.image,
                desc: p.description,
                specs: p.specs
            };
        });
        return map;
    }

    function renderCollectionGrid(products) {
        const grid = document.getElementById('collection-grid');
        const loading = document.getElementById('collection-loading');
        if (!grid) return;

        const active = products.filter(p => p.active && p.id && p.name);
        grid.innerHTML = '';

        active.forEach((p, index) => {
            const card = document.createElement('article');
            card.className = 'collection-card' + (index % 2 === 1 ? ' offset-card' : '');
            card.dataset.category = p.category;

            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
                    <div class="card-hover-overlay">
                        <button class="btn btn-glass btn-card-detail" data-product="${p.id}" type="button">View Details</button>
                    </div>
                </div>
                <div class="card-info">
                    <span class="card-category">${p.categoryLabel}</span>
                    <h3 class="card-title">${p.name}</h3>
                    <p class="card-price">${p.price}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        if (loading) loading.hidden = true;
    }

    async function loadProducts() {
        const config = window.GIESTO_CONFIG || { productsSource: 'json', productsJsonUrl: '../data/products.json' };

        if (config.productsSource === 'sheets' && config.googleSheetCsvUrl) {
            const res = await fetch(config.googleSheetCsvUrl);
            if (!res.ok) throw new Error('Could not load Google Sheet');
            const text = await res.text();
            return parseCSV(text)
                .map(sheetRowToProduct)
                .filter(p => p.id && p.name)
                .map(normalizeProduct);
        }

        const res = await fetch(config.productsJsonUrl || '../data/products.json');
        if (!res.ok) throw new Error('Could not load products.json');
        const data = await res.json();
        return (data.products || []).map(normalizeProduct);
    }

    window.giestoProductsReady = (async () => {
        try {
            const products = await loadProducts();
            const activeProducts = products.filter(p => p.active);
            window.GIESTO_PRODUCTS = productsToMap(activeProducts);
            window.GIESTO_PRODUCTS_LIST = activeProducts;
            renderCollectionGrid(activeProducts);
            document.dispatchEvent(new CustomEvent('giesto:products-loaded'));
        } catch (err) {
            console.error('GIESTO products load failed:', err);
            const loading = document.getElementById('collection-loading');
            if (loading) {
                loading.textContent = 'Could not load products. Please try again later.';
            }
        }
    })();
})();
