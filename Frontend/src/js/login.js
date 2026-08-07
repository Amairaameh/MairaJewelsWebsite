/* =============================================
   Maira Jewels — Dedicated Login Page Logic
   ============================================= */

(function () {
    'use strict';

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('maira_cart')) || [];
        } catch (e) {
            return [];
        }
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('maira_user')) || null;
        } catch (e) {
            return null;
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('login-page-toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Update cart badge
        const cartCountBadge = document.getElementById('cart-count-badge');
        if (cartCountBadge) {
            const cart = getCart();
            const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCountBadge.textContent = totalCount;
        }

        // Tab Switching
        const tabLoginBtn = document.getElementById('tab-login-btn');
        const tabRegisterBtn = document.getElementById('tab-register-btn');
        const formLogin = document.getElementById('page-login-form');
        const formRegister = document.getElementById('page-register-form');
        const pageTitle = document.getElementById('page-auth-title');

        if (tabLoginBtn && tabRegisterBtn) {
            tabLoginBtn.addEventListener('click', () => {
                tabLoginBtn.classList.add('auth-tab-btn--active');
                tabRegisterBtn.classList.remove('auth-tab-btn--active');
                formLogin.classList.add('page-auth-form--active');
                formRegister.classList.remove('page-auth-form--active');
                if (pageTitle) pageTitle.textContent = 'Welcome to Maira Jewels';
            });

            tabRegisterBtn.addEventListener('click', () => {
                tabRegisterBtn.classList.add('auth-tab-btn--active');
                tabLoginBtn.classList.remove('auth-tab-btn--active');
                formRegister.classList.add('page-auth-form--active');
                formLogin.classList.remove('page-auth-form--active');
                if (pageTitle) pageTitle.textContent = 'Create Maira Privé Account';
            });
        }

        // Login Submit
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('user-email').value.trim();
                if (!emailInput) return;

                const namePart = emailInput.split('@')[0];
                const userName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                const userObj = { name: userName, email: emailInput };

                localStorage.setItem('maira_user', JSON.stringify(userObj));
                showToast(`Welcome back, ${userName}! Redirecting...`);

                setTimeout(() => {
                    window.location.href = '/';
                }, 1200);
            });
        }

        // Register Submit
        if (formRegister) {
            formRegister.addEventListener('submit', (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('reg-user-name').value.trim();
                const emailInput = document.getElementById('reg-user-email').value.trim();
                if (!nameInput || !emailInput) return;

                const userObj = { name: nameInput, email: emailInput };
                localStorage.setItem('maira_user', JSON.stringify(userObj));
                showToast(`Welcome to Maira Jewels, ${nameInput}! Redirecting...`);

                setTimeout(() => {
                    window.location.href = '/';
                }, 1200);
            });
        }
    });
})();
