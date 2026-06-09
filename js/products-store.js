/**
 * Product data — loads from localStorage (admin saves) or products.json
 */
(function () {
    const STORAGE_KEY = 'giesto_products_v2';

    const getConfig = () => window.GIESTO_CONFIG || {};

    const categoryLabel = (cat) => {
        const cfg = getConfig().categories || {};
        return cfg[cat]?.label || cat;
    };

    const normalizeProduct = (p) => {
        const category = (p.category || 'casual').toLowerCase().trim();
        const sizes = Array.isArray(p.sizes) ? p.sizes.map(s => ({
            size: String(s.size || '').toUpperCase(),
            stock: Math.max(0, parseInt(s.stock, 10) || 0)
        })) : [];

        return {
            id: String(p.id || '').trim(),
            name: String(p.name || '').trim(),
            category,
            categoryLabel: p.categoryLabel || categoryLabel(category),
            price: Number(p.price) || 0,
            salePrice: p.salePrice != null && p.salePrice !== '' ? Number(p.salePrice) : null,
            image: p.image || '../assets/hero_suit.png',
            description: p.description || '',
            sizes,
            active: p.active !== false,
            featured: p.featured === true
        };
    };

    const totalStock = (product) => product.sizes.reduce((sum, s) => sum + s.stock, 0);

    const isSoldOut = (product) => totalStock(product) === 0;

    const formatPrice = (amount) => {
        const sym = getConfig().currency || '₹';
        return sym + Number(amount).toLocaleString('en-IN');
    };

    const getDisplayPrice = (product) => {
        const price = product.salePrice != null && product.salePrice < product.price
            ? product.salePrice
            : product.price;
        return formatPrice(price);
    };

    const getOriginalPrice = (product) => {
        if (product.salePrice != null && product.salePrice < product.price) {
            return formatPrice(product.price);
        }
        return null;
    };

    async function loadProducts() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored).map(normalizeProduct);
            }
        } catch (e) {
            console.warn('Could not read saved products', e);
        }

        const url = getConfig().productsJsonUrl || '../data/products.json';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        return (data.products || []).map(normalizeProduct);
    }

    function saveProducts(products) {
        const normalized = products.map(normalizeProduct);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
    }

    function clearSavedProducts() {
        localStorage.removeItem(STORAGE_KEY);
    }

    function exportProductsJson(products) {
        const blob = new Blob([JSON.stringify({ products }, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'products.json';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    window.GiestoStore = {
        STORAGE_KEY,
        loadProducts,
        saveProducts,
        clearSavedProducts,
        exportProductsJson,
        normalizeProduct,
        categoryLabel,
        totalStock,
        isSoldOut,
        formatPrice,
        getDisplayPrice,
        getOriginalPrice
    };

    window.giestoProductsReady = loadProducts().then(products => {
        window.GIESTO_PRODUCTS_LIST = products.filter(p => p.active);
        document.dispatchEvent(new CustomEvent('giesto:products-loaded', { detail: products }));
        return products;
    }).catch(err => {
        console.error(err);
        window.GIESTO_PRODUCTS_LIST = [];
        return [];
    });
})();
