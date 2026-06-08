/**
 * 5. Booking Concierge Form Submission & Toast Prompts
 */
import { showToast } from './toast.js';

export const initBookingForm = () => {
    const bookingForm = document.getElementById('booking-form');

    if (!bookingForm) return;

    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Capture basic fields for organic representation
        const nameVal = document.getElementById('booking-name').value;
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        if (!submitBtn) return;
        
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
};
