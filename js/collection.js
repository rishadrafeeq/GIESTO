/**
 * 2. Collection Filtering (Editorial Grid Transitions)
 */
export const initCollectionFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const collectionCards = document.querySelectorAll('.collection-card');

    if (!filterButtons.length || !collectionCards.length) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Set active class
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            collectionCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    // Reveal with smooth scaling and fading
                    card.classList.remove('fade-out');
                } else {
                    // Fade out card
                    card.classList.add('fade-out');
                }
            });
        });
    });
};
