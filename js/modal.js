/**
 * 3. Product Concierge Detail Modal Injector
 */
const productData = {
    'emerald-suit': {
        title: 'The Giesto Emerald Suit',
        category: 'Sartorial Tailoring',
        price: '$1,450 / Tailored',
        image: 'assets/hero_suit.png',
        desc: 'A masterwork in signature coloration. This double-breasted coat features structured roped shoulders, hand-carved horn buttons, and wide peak lapels. Tailored from premium Super 150s Australian wool blended with fine Italian silk for an exquisite, natural sheen.',
        specs: {
            fabric: '85% Merino Wool, 15% Mulberry Silk',
            weight: '240g/m (All-Season)',
            lapel: '10.5cm Peak Lapel',
            lining: '100% Cupro Bemberg (Sage Green)'
        }
    },
    'luxe-knit': {
        title: 'Luxe Sage Knit & Linen Set',
        category: 'Luxe Casual',
        price: '$620 / Curation Set',
        image: 'assets/casual_luxe.png',
        desc: 'Understated luxury designed for architecture, travel, and leisure. The heavy crewneck sweater offers a gorgeous three-dimensional weave that retains its shape, while our tailored off-white trousers feature double pleats, side adjusters, and an elegant formal cuff.',
        specs: {
            fabric: 'Sweater: 100% Organic Pima Cotton',
            weight: 'Medium-Heavy Gauge',
            trousers: '100% Belgian Flax Linen',
            fit: 'Relaxed Atelier Curation'
        }
    },
    'velvet-tux': {
        title: 'Midnight Emerald Velvet Tuxedo',
        category: 'Imperial Evening',
        price: '$1,850 / Tailored',
        image: 'assets/evening_tux.png',
        desc: 'For high-society evenings and opulent Galas. Crafted from dynamic, light-absorbing cotton velvet in our signature deep green shade. Features a structural silk satin shawl lapel, matching satin pocket welts, and sleek satin-striped wool dinner trousers.',
        specs: {
            fabric: '100% Cotton Velvet (Tuxedo Jacket)',
            lapel: 'Silk Grosgrain Shawl',
            trousers: 'Super 120s Wool with Satin Stripe',
            closure: 'Satin-Covered Single Button'
        }
    }
};

export const initProductModal = () => {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (!modal || !modalContent || !modalCloseBtn) return;

    const closeProductModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Unlock background scrolling
    };

    // Open Modal and Inject Details
    document.querySelectorAll('.btn-card-detail').forEach(button => {
        button.addEventListener('click', (e) => {
            const productKey = e.target.getAttribute('data-product');
            const data = productData[productKey];

            if (data) {
                // Populate Modal Markup
                modalContent.innerHTML = `
                    <div class="modal-image-wrapper">
                        <img src="${data.image}" alt="${data.title}" class="hero-img">
                    </div>
                    <div class="modal-details">
                        <span class="modal-category">${data.category}</span>
                        <h3 class="modal-title">${data.title}</h3>
                        <div class="modal-price">${data.price}</div>
                        <p class="modal-desc">${data.desc}</p>
                        
                        <div class="specs-grid">
                            <div class="spec-item">
                                <span class="spec-label">Composition</span>
                                <span class="spec-value">${data.specs.fabric || 'Premium Blend'}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Atelier Detail</span>
                                <span class="spec-value">${data.specs.lapel || data.specs.fit || 'Bespoke Cut'}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Lining / Trim</span>
                                <span class="spec-value">${data.specs.lining || data.specs.trousers || 'Atelier Standard'}</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Weight Class</span>
                                <span class="spec-value">${data.specs.weight || data.specs.closure || 'Heavy drape'}</span>
                            </div>
                        </div>

                        <a href="#bespoke" class="btn btn-primary" id="btn-modal-book">Secure Fitting Appointment</a>
                    </div>
                `;

                // Add scroll listener inside the modal's booking button
                document.getElementById('btn-modal-book').addEventListener('click', () => {
                    closeProductModal();
                    // Pre-select service based on category
                    const serviceSelect = document.getElementById('booking-service');
                    if (serviceSelect) {
                        if (data.category.includes('Sartorial')) {
                            serviceSelect.value = 'bespoke-suit';
                        } else if (data.category.includes('Casual')) {
                            serviceSelect.value = 'personal-styling';
                        } else if (data.category.includes('Evening')) {
                            serviceSelect.value = 'evening-draping';
                        }
                    }
                });

                // Show modal with animation
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Lock background scrolling
            }
        });
    });

    // Close Modal Events
    modalCloseBtn.addEventListener('click', closeProductModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeProductModal();
        }
    });
};
