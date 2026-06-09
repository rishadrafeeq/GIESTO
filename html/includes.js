(async function loadPartials() {
    const slots = document.querySelectorAll('[data-include]');
    await Promise.all([...slots].map(async (slot) => {
        const path = slot.getAttribute('data-include');
        try {
            const res = await fetch(path);
            if (res.ok) slot.outerHTML = await res.text();
        } catch (err) {
            console.warn('Partial load failed:', path);
        }
    }));

    const page = document.body.dataset.page;
    if (page) {
        document.querySelector(`.nav-link[data-nav="${page}"]`)?.classList.add('active');
    }

    const script = document.createElement('script');
    script.src = '../js/shop-ui.js';
    document.body.appendChild(script);
})();
