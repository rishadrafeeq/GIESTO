/**
 * Loads shared HTML partials (header, footer, etc.) into each page.
 * Requires a local server (e.g. Live Server) — fetch does not work on file://
 */
(async function loadPartials() {
    const slots = document.querySelectorAll('[data-include]');

    await Promise.all([...slots].map(async (slot) => {
        const path = slot.getAttribute('data-include');
        try {
            const response = await fetch(path);
            if (response.ok) {
                slot.outerHTML = await response.text();
            }
        } catch (err) {
            console.warn('Could not load partial:', path, err);
        }
    }));

    // Highlight current page in navigation
    const currentPage = document.body.dataset.page;
    if (currentPage) {
        document.querySelector(`.nav-link[data-nav="${currentPage}"]`)?.classList.add('active');
    }

    // Load main app logic after partials are in place
    const script = document.createElement('script');
    script.src = '../app.js';
    document.body.appendChild(script);
})();
