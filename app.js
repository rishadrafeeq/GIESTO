/**
 * GIESTO | Core Web Application Logic
 * Premium Men's Atelier & Interactive Styling Curations
 */

document.addEventListener('DOMContentLoaded', async () => {
    if (window.giestoProductsReady) {
        await window.giestoProductsReady;
    }

    // ==========================================================================
    // 0. Prefill booking form from cross-page navigation (Style Advisor / Modal)
    // ==========================================================================
    const bookingNotesField = document.getElementById('booking-notes');
    const bookingServiceField = document.getElementById('booking-service');
    const savedNotes = sessionStorage.getItem('booking-notes');
    const savedService = sessionStorage.getItem('booking-service');

    if (savedNotes && bookingNotesField) {
        bookingNotesField.value = savedNotes;
        sessionStorage.removeItem('booking-notes');
    }
    if (savedService && bookingServiceField) {
        bookingServiceField.value = savedService;
        sessionStorage.removeItem('booking-service');
    }

    // ==========================================================================
    // 1. Navigation & Fixed Header Mechanics
    // ==========================================================================
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const hamburgerBars = document.querySelectorAll('.hamburger-bar');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            hamburgerBars.forEach(bar => bar.classList.toggle('active'));
        });
    }

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            hamburgerBars.forEach(bar => bar.classList.remove('active'));
        });
    });

    // ==========================================================================
    // 2. Collection Filtering (products loaded from JSON / Google Sheets)
    // ==========================================================================
    const collectionEmpty = document.getElementById('collection-empty');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const collectionGrid = document.getElementById('collection-grid');
    let currentFilter = 'all';

    const applyCollectionFilter = (filterValue) => {
        if (!collectionGrid) return;
        currentFilter = filterValue;
        const collectionCards = collectionGrid.querySelectorAll('.collection-card');
        let visibleCount = 0;

        filterButtons.forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-filter') === filterValue);
        });

        collectionCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const show = filterValue === 'all' || category === filterValue;
            card.classList.toggle('fade-out', !show);
            if (show) visibleCount++;
        });

        if (collectionEmpty) {
            collectionEmpty.hidden = visibleCount > 0;
        }
    };

    if (filterButtons.length && collectionGrid) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                applyCollectionFilter(btn.getAttribute('data-filter'));
            });
        });
        document.addEventListener('giesto:products-loaded', () => {
            applyCollectionFilter(currentFilter);
        });
        applyCollectionFilter('all');
    }

    // ==========================================================================
    // 3. Product detail modal (data from products catalog)
    // ==========================================================================
    const getProductData = () => window.GIESTO_PRODUCTS || {};

    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    const closeProductModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    const openProductModal = (productKey) => {
        const productData = getProductData();
        const data = productData[productKey];
        if (!data || !modal || !modalContent) return;

        const specEntries = Object.entries(data.specs || {}).filter(([, v]) => v);
        const specsHtml = specEntries.length
            ? specEntries.map(([key, val]) => `
                <div class="spec-item">
                    <span class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span class="spec-value">${val}</span>
                </div>`).join('')
            : `<div class="spec-item"><span class="spec-label">Details</span><span class="spec-value">Contact atelier for specifications</span></div>`;

        modalContent.innerHTML = `
            <div class="modal-image-wrapper">
                <img src="${data.image}" alt="${data.title}" class="hero-img">
            </div>
            <div class="modal-details">
                <span class="modal-category">${data.category}</span>
                <h3 class="modal-title">${data.title}</h3>
                <div class="modal-price">${data.price}</div>
                <p class="modal-desc">${data.desc}</p>
                <div class="specs-grid">${specsHtml}</div>
                <a href="bespoke.html" class="btn btn-primary" id="btn-modal-book">Secure Fitting Appointment</a>
            </div>
        `;

        document.getElementById('btn-modal-book').addEventListener('click', () => {
            if (data.category.includes('Formal')) {
                sessionStorage.setItem('booking-service', 'bespoke-suit');
            } else {
                sessionStorage.setItem('booking-service', 'personal-styling');
            }
            closeProductModal();
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    if (modal && modalContent && modalCloseBtn) {
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-card-detail');
            if (btn) {
                e.preventDefault();
                openProductModal(btn.getAttribute('data-product'));
            }
        });

        modalCloseBtn.addEventListener('click', closeProductModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeProductModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeProductModal();
            }
        });
    }

    // ==========================================================================
    // 4. Interactive Style Advisor (Engine & Decision Tree)
    // ==========================================================================
    const quizContainer = document.getElementById('quiz-container');
    const quizSteps = document.querySelectorAll('.quiz-step');
    const quizResultSlide = document.getElementById('quiz-result-slide');
    const progressFill = document.getElementById('quiz-progress-fill');
    const currentStepNum = document.getElementById('current-step-num');

    if (quizContainer) {
    let currentStep = 1;
    const quizState = {
        vibe: '',
        shade: '',
        highlight: ''
    };

    // Answer Outcome Database
    const styleOutcomes = {
        'sartorial-emerald': {
            title: 'The Sovereign Emerald Sartorial',
            desc: 'Your preferences indicate a commanding appreciation for tailored posture. We highly recommend our iconic Emerald Double-Breasted Suit crafted from Super 150s Merino Wool. Styled with a crisp white poplin shirt, premium charcoal tie, and rich brown burnished double-monks.',
            colors: ['#0A120E', '#143825', '#50A075', '#D4AF37'],
            service: 'bespoke-suit'
        },
        'sartorial-obsidian': {
            title: 'The Obsidian Sartorial Classic',
            desc: 'You lean toward timeless power with modern contrast. We curate a midnight-black tailored structured suit featuring high armholes, styled with a charcoal eucalyptus silk tie and polished black oxford lace-ups.',
            colors: ['#050505', '#1F1F1F', '#506357', '#A3B899'],
            service: 'bespoke-suit'
        },
        'casual-emerald': {
            title: 'The Forest Sage Knitwear Curation',
            desc: 'A relaxed aesthetic carrying deep luxury signals. We match you with our signature heavy forest green mock-neck knit sweater, paired with cream brushed cotton trousers and rich suede loafers for an elegant architectural day appearance.',
            colors: ['#143825', '#82A994', '#F3F7F5', '#8A7A5F'],
            service: 'personal-styling'
        },
        'casual-sage': {
            title: 'The Modern Sage & Linen Lounge',
            desc: 'You appreciate airy, organic styling with flawless texture. We suggest our relaxed Sage Green unstructured blazer layered over a premium Pima cotton undershirt, anchored by loose cream linen trousers.',
            colors: ['#50A075', '#A3B899', '#F3F7F5', '#C2B095'],
            service: 'personal-styling'
        },
        'evening-emerald': {
            title: 'The Imperial Velvet Tuxedo Curation',
            desc: 'Opulence in deep signature green. We recommend our magnificent deep green double-breasted velvet tuxedo jacket with silk satin shawl lapels. Perfectly accompanied by black wool dinner trousers and silk bow tie.',
            colors: ['#0A120E', '#143825', '#D4AF37', '#000000'],
            service: 'evening-draping'
        },
        'evening-obsidian': {
            title: 'The Obsidian Grand Atelier Tuxedo',
            desc: 'High-contrast nocturnal sophistication. We curate a sleek monochrome black velvet double-breasted dinner jacket, crisp tuxedo shirt, and black satin accessories for a classic dress-code command.',
            colors: ['#000000', '#1A1A1A', '#F3F7F5', '#D4AF37'],
            service: 'evening-draping'
        },
        // Fallback profile
        'default': {
            title: 'The Giesto Signature Atelier Look',
            desc: 'Your profile blends modern clean silhouettes with signature palette details. We suggest our Emerald single-breasted signature sport coat layered over a sage green crewneck knit and luxury grey flannel trousers.',
            colors: ['#143825', '#50A075', '#82A994', '#D4AF37'],
            service: 'personal-styling'
        }
    };

    // Option Clicks
    document.querySelectorAll('.quiz-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const key = button.getAttribute('data-key');
            const value = button.getAttribute('data-value');

            // Set state and select styling class
            const siblingButtons = button.parentNode.querySelectorAll('.quiz-option-btn');
            siblingButtons.forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');

            quizState[key] = value;

            // Delayed transition for organic feedback
            setTimeout(() => {
                advanceQuiz();
            }, 300);
        });
    });

    // Advance Quiz State
    const advanceQuiz = () => {
        if (currentStep < 3) {
            // Fade current
            const activeStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
            activeStep.classList.remove('active');
            
            setTimeout(() => {
                currentStep++;
                // Update Progress UI
                currentStepNum.textContent = currentStep;
                progressFill.style.width = `${(currentStep / 3) * 100}%`;
                
                // Show next step
                const nextStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
                nextStep.classList.add('active');
            }, 300);
        } else {
            // Show Results
            showQuizResults();
        }
    };

    // Quiz Back Button Navigation
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                const activeStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
                activeStep.classList.remove('active');
                
                setTimeout(() => {
                    currentStep--;
                    // Update Progress UI
                    currentStepNum.textContent = currentStep;
                    progressFill.style.width = `${(currentStep / 3) * 100}%`;
                    
                    // Show previous step
                    const prevStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
                    prevStep.classList.add('active');
                }, 300);
            }
        });
    });

    // Calculation Engine
    const showQuizResults = () => {
        // Hide Step 3
        const activeStep = quizContainer.querySelector(`.quiz-step[data-step="3"]`);
        activeStep.classList.remove('active');

        // Formulate lookup key e.g., 'sartorial-emerald'
        let outcomeKey = `${quizState.vibe}-${quizState.shade}`;
        
        // Find matching outcome or default
        let outcome = styleOutcomes[outcomeKey];
        if (!outcome) {
            // Fuzzy match on vibe first
            outcomeKey = `${quizState.vibe}-emerald`;
            outcome = styleOutcomes[outcomeKey] || styleOutcomes['default'];
        }

        // Inject content
        document.getElementById('result-look-title').textContent = outcome.title;
        document.getElementById('result-look-desc').textContent = outcome.desc;

        // Render Color Swatches
        const swatchesContainer = document.getElementById('result-swatches');
        swatchesContainer.innerHTML = '';
        outcome.colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatchesContainer.appendChild(swatch);
        });

        // Setup CTA booking hook
        const btnApply = document.getElementById('btn-apply-look');
        if (btnApply) {
            btnApply.onclick = () => {
                sessionStorage.setItem('booking-service', outcome.service);
                sessionStorage.setItem('booking-notes', `Styled via Giesto Style Advisor: Looking for "${outcome.title}".`);
                window.location.href = 'bespoke.html';
            };
        }

        // Transition to result slide
        setTimeout(() => {
            progressFill.style.backgroundColor = 'var(--color-gold)';
            quizResultSlide.classList.add('active');
        }, 300);
    };

    // Restart Quiz
    const btnRestartQuiz = document.getElementById('btn-restart-quiz');
    if (btnRestartQuiz) {
    btnRestartQuiz.addEventListener('click', () => {
        quizResultSlide.classList.remove('active');
        
        setTimeout(() => {
            // Reset state
            currentStep = 1;
            quizState.vibe = '';
            quizState.shade = '';
            quizState.highlight = '';
            
            // Clear visual selection classes
            document.querySelectorAll('.quiz-option-btn').forEach(btn => btn.classList.remove('selected'));
            
            // Reset Progress bar
            currentStepNum.textContent = currentStep;
            progressFill.style.width = '33.3%';
            progressFill.style.backgroundColor = 'var(--color-sage)';
            
            // Load Step 1
            const stepOne = quizContainer.querySelector('.quiz-step[data-step="1"]');
            stepOne.classList.add('active');
        }, 300);
    });
    }
    }

    // ==========================================================================
    // 5. Booking Concierge Form Submission & Toast Prompts
    // ==========================================================================
    const bookingForm = document.getElementById('booking-form');
    const toast = document.getElementById('custom-toast');
    const toastText = document.getElementById('toast-message-text');

    const showToast = (message) => {
        if (!toast || !toastText) return;
        toastText.textContent = message;
        toast.classList.add('active');
        
        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    };

    if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Capture basic fields for organic representation
        const nameVal = document.getElementById('booking-name').value;
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Button Loading State
        submitBtn.textContent = 'TRANSMITTING REQUEST...';
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        setTimeout(() => {
            // Reset Button State
            submitBtn.textContent = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;

            // Trigger success animations and notifications
            showToast(`Thank you, Mr. ${nameVal.split(' ')[0] || nameVal}. Your concierge request is registered. An atelier coordinator will contact you shortly.`);
            
            // Reset Form fields
            bookingForm.reset();
        }, 1500);
    });
    }

    // ==========================================================================
    // 6. Newsletter Subscription Forms
    // ==========================================================================
    const newsletterForm = document.getElementById('newsletter-form');

    if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'ACTIVE...';
        submitBtn.disabled = true;

        setTimeout(() => {
            showToast('Welcome to the Atelier Letters. The seasonal lookbook details will reach your inbox shortly.');
            emailInput.value = '';
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1200);
    });
    }

    // ==========================================================================
    // 7. Interactive Instagram Cards (Likes, Hearts, Comments)
    // ==========================================================================
    const instagramCards = document.querySelectorAll('.instagram-card');

    if (instagramCards.length) {
    instagramCards.forEach(card => {
        const likeBtn = card.querySelector('.btn-like');
        const bookmarkBtn = card.querySelector('.btn-bookmark');
        const commentForm = card.querySelector('.ig-add-comment-form');
        const commentInput = card.querySelector('.ig-comment-input');
        const commentsList = card.querySelector('.ig-comments-list');
        const imageContainer = card.querySelector('.ig-image-container');
        const heartOverlay = card.querySelector('.ig-heart-overlay');
        const likesNumSpan = card.querySelector('.likes-num');
        const commentFocusBtn = card.querySelector('.btn-comment-focus');

        let isLiked = false;
        let likesCount = parseInt(likesNumSpan.textContent);
        let isBookmarked = false;

        // Sync Like Action
        const toggleLike = (triggerHeartFlash = false) => {
            isLiked = !isLiked;
            if (isLiked) {
                likeBtn.classList.add('liked');
                likesCount++;
                if (triggerHeartFlash) {
                    // Flash Giant Heart Animation
                    heartOverlay.classList.add('active');
                    setTimeout(() => {
                        heartOverlay.classList.remove('active');
                    }, 800);
                }
            } else {
                likeBtn.classList.remove('liked');
                likesCount--;
            }
            likesNumSpan.textContent = likesCount;
        };

        // Like Button click
        likeBtn.addEventListener('click', () => toggleLike(true));

        // Double click image
        imageContainer.addEventListener('dblclick', () => {
            if (!isLiked) {
                toggleLike(true);
            } else {
                // Flash Heart anyway for visual confirmation
                heartOverlay.classList.add('active');
                setTimeout(() => {
                    heartOverlay.classList.remove('active');
                }, 800);
            }
        });

        // Bookmark Toggle
        bookmarkBtn.addEventListener('click', () => {
            isBookmarked = !isBookmarked;
            bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
            if (isBookmarked) {
                showToast('Post bookmarked to your style curation boards.');
            }
        });

        // Comment Input Focus Shortcut
        commentFocusBtn.addEventListener('click', () => {
            commentInput.focus();
        });

        // Live Comment Add Submission
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = commentInput.value.trim();
            if (text) {
                // Append Comment
                const commentItem = document.createElement('div');
                commentItem.className = 'ig-comment-item';
                commentItem.innerHTML = `<span class="comment-username">guest.connoisseur</span> ${text}`;
                
                // Add to list and scroll it into view
                commentsList.appendChild(commentItem);
                commentsList.scrollTop = commentsList.scrollHeight;

                // Success Feedback
                commentInput.value = '';
                showToast('Thank you for your style feedback! Posted.');
            }
        });
    });
    }
});
