/**
 * Shared Toast Notification Utility
 */
const toast = document.getElementById('custom-toast');
const toastText = document.getElementById('toast-message-text');

export const showToast = (message) => {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
};
