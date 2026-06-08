/**
 * 6. Newsletter Subscription Forms
 */
import { showToast } from './toast.js';

export const initNewsletterForm = () => {
    const newsletterForm = document.getElementById('newsletter-form');

    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const emailInput = document.getElementById('newsletter-email');
        const submitBtn = newsletterForm.querySelector('button[type="submit"]');
        if (!submitBtn || !emailInput) return;
        
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
};
