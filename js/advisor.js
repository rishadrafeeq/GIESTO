/**
 * 4. Interactive Style Advisor (Engine & Decision Tree)
 */
const styleOutcomes = {
    'sartorial-emerald': {
        title: 'The Sovereign Emerald Sartorial',
        desc: 'Your preferences indicate a commanding appreciation for tailored posture. We highly recommend our iconic Emerald Double-Breasted Suit crafted from Super 150s Merino Wool. Styled with a signature white poplin shirt, premium charcoal tie, and rich brown burnished double-monks.',
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

export const initStyleAdvisor = () => {
    const quizContainer = document.getElementById('quiz-container');
    const quizResultSlide = document.getElementById('quiz-result-slide');
    const progressFill = document.getElementById('quiz-progress-fill');
    const currentStepNum = document.getElementById('current-step-num');

    if (!quizContainer || !quizResultSlide || !progressFill || !currentStepNum) return;

    let currentStep = 1;
    const quizState = {
        vibe: '',
        shade: '',
        highlight: ''
    };

    // Calculation Engine
    const showQuizResults = () => {
        // Hide Step 3
        const activeStep = quizContainer.querySelector(`.quiz-step[data-step="3"]`);
        if (activeStep) activeStep.classList.remove('active');

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
        const resultLookTitle = document.getElementById('result-look-title');
        const resultLookDesc = document.getElementById('result-look-desc');
        if (resultLookTitle) resultLookTitle.textContent = outcome.title;
        if (resultLookDesc) resultLookDesc.textContent = outcome.desc;

        // Render Color Swatches
        const swatchesContainer = document.getElementById('result-swatches');
        if (swatchesContainer) {
            swatchesContainer.innerHTML = '';
            outcome.colors.forEach(color => {
                const swatch = document.createElement('div');
                swatch.className = 'swatch';
                swatch.style.backgroundColor = color;
                swatch.title = color;
                swatchesContainer.appendChild(swatch);
            });
        }

        // Setup CTA booking hook
        const btnApply = document.getElementById('btn-apply-look');
        if (btnApply) {
            btnApply.onclick = () => {
                const serviceSelect = document.getElementById('booking-service');
                const bookingNotes = document.getElementById('booking-notes');
                const bespokeSection = document.getElementById('bespoke');
                const bookingContainer = document.querySelector('.consultation-container');

                if (serviceSelect) serviceSelect.value = outcome.service;
                if (bookingNotes) bookingNotes.value = `Styled via Giesto Style Advisor: Looking for "${outcome.title}".`;
                
                // Scroll to bookings form
                if (bespokeSection) bespokeSection.scrollIntoView({ behavior: 'smooth' });
                
                // Subtle pulse glow on the booking module to anchor user's eye
                if (bookingContainer) {
                    bookingContainer.style.boxShadow = '0 0 40px var(--glass-glow)';
                    setTimeout(() => {
                        bookingContainer.style.boxShadow = '';
                    }, 2500);
                }
            };
        }

        // Transition to result slide
        setTimeout(() => {
            progressFill.style.backgroundColor = 'var(--color-gold)';
            quizResultSlide.classList.add('active');
        }, 300);
    };

    // Advance Quiz State
    const advanceQuiz = () => {
        if (currentStep < 3) {
            // Fade current
            const activeStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
            if (activeStep) activeStep.classList.remove('active');
            
            setTimeout(() => {
                currentStep++;
                // Update Progress UI
                currentStepNum.textContent = currentStep;
                progressFill.style.width = `${(currentStep / 3) * 100}%`;
                
                // Show next step
                const nextStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
                if (nextStep) nextStep.classList.add('active');
            }, 300);
        } else {
            // Show Results
            showQuizResults();
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

    // Quiz Back Button Navigation
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                const activeStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
                if (activeStep) activeStep.classList.remove('active');
                
                setTimeout(() => {
                    currentStep--;
                    // Update Progress UI
                    currentStepNum.textContent = currentStep;
                    progressFill.style.width = `${(currentStep / 3) * 100}%`;
                    
                    // Show previous step
                    const prevStep = quizContainer.querySelector(`.quiz-step[data-step="${currentStep}"]`);
                    if (prevStep) prevStep.classList.add('active');
                }, 300);
            }
        });
    });

    // Restart Quiz
    const restartBtn = document.getElementById('btn-restart-quiz');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
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
                if (stepOne) stepOne.classList.add('active');
            }, 300);
        });
    }
};
