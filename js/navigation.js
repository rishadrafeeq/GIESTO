/**
 * 1. Navigation & Fixed Header Mechanics
 */
export const initNavigation = () => {
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const hamburgerBars = document.querySelectorAll('.hamburger-bar');

    if (!header || !mobileToggle || !navMenu) return;

    // Sticky Nav Shrink on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Navigation Toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburgerBars.forEach(bar => bar.classList.toggle('active'));
    });

    // Close Mobile Menu on Nav Link Clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburgerBars.forEach(bar => bar.classList.remove('active'));
        });
    });
};
