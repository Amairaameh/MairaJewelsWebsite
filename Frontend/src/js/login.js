/* =============================================
   Maira Jewels - Dedicated Login Page Logic (API Integrated)
   ============================================= */

import api from './api.js';

(function () {
    'use strict';

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('maira_cart')) || [];
        } catch (e) {
            return [];
        }
    }

    function showToast(msg) {
        const toast = document.getElementById('login-page-toast') || document.getElementById('toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    function showPageAuthError(msg) {
        let errDiv = document.getElementById('page-auth-error');
        if (!errDiv) {
            errDiv = document.createElement('div');
            errDiv.id = 'page-auth-error';
            errDiv.style.cssText = 'color:#9b2219; background:#fdf3f2; padding:11px 16px; font-size:0.85rem; margin-bottom:18px; border:1px solid rgba(155,34,25,0.3); text-align:center; border-radius:3px; font-weight:500;';
            const card = document.querySelector('.login-form-card, .login-page__form-container, .auth-page-box');
            if (card) {
                const tabs = card.querySelector('.auth-tabs-row, .login-header');
                if (tabs) {
                    tabs.insertAdjacentElement('afterend', errDiv);
                } else {
                    card.insertBefore(errDiv, card.firstChild);
                }
            } else {
                const fallbackMain = document.querySelector('main');
                if (fallbackMain) fallbackMain.insertBefore(errDiv, fallbackMain.firstChild);
            }
        }
        if (errDiv) {
            errDiv.textContent = msg;
            errDiv.style.display = msg ? 'block' : 'none';
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPassword(password) {
        return typeof password === 'string' && password.length >= 8 && password.length <= 15;
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Update cart badge
        const cartCountBadge = document.getElementById('cart-count-badge');
        if (cartCountBadge) {
            const cart = getCart();
            const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCountBadge.textContent = totalCount;
        }

        // Get redirect parameter (e.g., redirect=checkout.html)
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTarget = urlParams.get('redirect') || 'index.html';

        // If redirected specifically from checkout, show an inviting notification
        if (redirectTarget.includes('checkout')) {
            const formsWrap = document.querySelector('.login-form-card, .login-page__form-container, .auth-page-box');
            const noticeDiv = document.createElement('div');
            noticeDiv.className = 'checkout-login-notice';
            noticeDiv.style.cssText = 'background: rgba(200, 169, 126, 0.12); border: 1px solid rgba(200, 169, 126, 0.4); padding: 12px 16px; margin-bottom: 18px; font-size: 0.85rem; color: #222; text-align: center; border-radius: 2px;';
            noticeDiv.innerHTML = '<strong>Account Required:</strong> Please log in or create an account to complete your checkout securely.';
            if (formsWrap) {
                const headerEl = formsWrap.querySelector('.login-header');
                if (headerEl) {
                    headerEl.insertAdjacentElement('afterend', noticeDiv);
                } else {
                    formsWrap.insertBefore(noticeDiv, formsWrap.firstChild);
                }
            }
        }

        // Tab Switching
        const tabLoginBtn = document.getElementById('tab-login-btn');
        const tabRegisterBtn = document.getElementById('tab-register-btn');
        const formLogin = document.getElementById('page-login-form');
        const formRegister = document.getElementById('page-register-form');
        const pageTitle = document.getElementById('page-auth-title');

        if (tabLoginBtn && tabRegisterBtn) {
            tabLoginBtn.addEventListener('click', () => {
                showPageAuthError('');
                tabLoginBtn.classList.add('auth-tab-btn--active');
                tabRegisterBtn.classList.remove('auth-tab-btn--active');
                formLogin.classList.add('page-auth-form--active');
                formRegister.classList.remove('page-auth-form--active');
                if (pageTitle) pageTitle.textContent = 'Welcome to Maira Jewels';
            });

            tabRegisterBtn.addEventListener('click', () => {
                showPageAuthError('');
                tabRegisterBtn.classList.add('auth-tab-btn--active');
                tabLoginBtn.classList.remove('auth-tab-btn--active');
                formRegister.classList.add('page-auth-form--active');
                formLogin.classList.remove('page-auth-form--active');
                if (pageTitle) pageTitle.textContent = 'Create Maira Jewels Account';
            });
        }

        // Login Submit
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                showPageAuthError('');
                const emailInput = document.getElementById('user-email').value.trim();
                const passwordInput = document.getElementById('user-password').value;
                const submitBtn = formLogin.querySelector('button[type="submit"]');

                if (!emailInput) {
                    showPageAuthError('Please enter your email address.');
                    return;
                }
                if (!isValidEmail(emailInput)) {
                    showPageAuthError('Please enter a valid email address (e.g. name@example.com).');
                    return;
                }
                if (!passwordInput) {
                    showPageAuthError('Please enter your password.');
                    return;
                }
                if (!isValidPassword(passwordInput)) {
                    showPageAuthError('Password must be between 8 and 15 characters.');
                    return;
                }

                const origText = submitBtn.textContent;
                submitBtn.textContent = 'Authenticating...';
                submitBtn.disabled = true;

                try {
                    const rememberCheckbox = document.getElementById('remember-me') || document.getElementById('login-remember');
                    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

                    const res = await api.login({ email: emailInput, password: passwordInput, rememberMe });

                    // DEBUG: log response to console so we can see the exact structure
                    console.log('[Login Response]', JSON.stringify(res));

                    const token = res.token || (res.data && res.data.token) || res.jwt || (res.data && res.data.jwt) || res.accessToken || (res.data && res.data.accessToken);
                    const userObj = res.user || (res.data && res.data.user) ||
                                    (res.data && res.data.name ? res.data : null);

                    if (token) api.setToken(token, rememberMe);
                    if (userObj) api.setUser(userObj);
                    if (!api.getToken() && userObj) {
                        api.setToken(`user_token_client_${userObj._id || userObj.id || Date.now()}`, rememberMe);
                    }

                    const userName = (userObj && userObj.name) ||
                                     (res.data && res.data.user && res.data.user.name) ||
                                     'Client';

                    showToast(`Welcome back, ${userName}! Redirecting...`);
                    // Slight delay so localStorage write completes before navigation
                    setTimeout(() => {
                        window.location.href = redirectTarget;
                    }, 800);
                } catch (err) {
                    console.error('[Login Error]', err);
                    showPageAuthError(err.message || 'Login failed. Please check your credentials.');
                } finally {
                    submitBtn.textContent = origText;
                    submitBtn.disabled = false;
                }
            });
        }

        // Register Submit
        if (formRegister) {
            formRegister.addEventListener('submit', async (e) => {
                e.preventDefault();
                showPageAuthError('');
                const nameInput = document.getElementById('reg-user-name').value.trim();
                const emailInput = document.getElementById('reg-user-email').value.trim();
                const passwordInput = document.getElementById('reg-user-password').value;
                const submitBtn = formRegister.querySelector('button[type="submit"]');

                if (!nameInput) {
                    showPageAuthError('Please enter your full name.');
                    return;
                }
                if (!emailInput) {
                    showPageAuthError('Please enter your email address.');
                    return;
                }
                if (!isValidEmail(emailInput)) {
                    showPageAuthError('Please enter a valid email address (e.g. name@example.com).');
                    return;
                }
                if (!passwordInput) {
                    showPageAuthError('Please create a password.');
                    return;
                }
                if (!isValidPassword(passwordInput)) {
                    showPageAuthError('Password must be between 8 and 15 characters.');
                    return;
                }

                const origText = submitBtn.textContent;
                submitBtn.textContent = 'Creating Account...';
                submitBtn.disabled = true;

                try {
                    const res = await api.register({
                        name: nameInput,
                        email: emailInput,
                        password: passwordInput,
                        newsletter: true
                    });

                    console.log('[Register Response]', JSON.stringify(res));

                    const token = res.token || (res.data && res.data.token) || res.jwt || (res.data && res.data.jwt) || res.accessToken || (res.data && res.data.accessToken);
                    const userObj = res.user || (res.data && res.data.user) ||
                                    (res.data && res.data.name ? res.data : null);

                    if (token) api.setToken(token);
                    if (userObj) api.setUser(userObj);
                    if (!api.getToken() && userObj) {
                        api.setToken(`user_token_client_${userObj._id || userObj.id || Date.now()}`);
                    }

                    // Sync customer to Admin Storage (maira_admin_customers)
                    try {
                        const currentAdminCustomers = JSON.parse(localStorage.getItem('maira_admin_customers') || '[]');
                        const userRec = userObj || { name: nameInput, email: emailInput };
                        const existingIdx = currentAdminCustomers.findIndex(c => c.email && c.email.toLowerCase() === userRec.email.toLowerCase());
                        const custData = {
                            id: `CUST-${(userRec._id || userRec.id || Date.now()).toString().slice(-6).toUpperCase()}`,
                            name: userRec.name || nameInput,
                            email: userRec.email || emailInput,
                            phone: userRec.phone || '',
                            address: userRec.address || '',
                            createdAt: userRec.createdAt || new Date().toISOString()
                        };
                        if (existingIdx !== -1) {
                            currentAdminCustomers[existingIdx] = { ...currentAdminCustomers[existingIdx], ...custData };
                        } else {
                            currentAdminCustomers.unshift(custData);
                        }
                        localStorage.setItem('maira_admin_customers', JSON.stringify(currentAdminCustomers));
                    } catch (e) {
                        console.warn('[Admin Storage Sync Notice]', e.message);
                    }

                    showToast(`Welcome to Maira Jewels, ${nameInput}! Redirecting...`);
                    setTimeout(() => {
                        window.location.href = redirectTarget;
                    }, 800);
                } catch (err) {
                    console.error('[Register Error]', err);
                    showPageAuthError(err.message || 'Registration failed. Please try again.');
                } finally {
                    submitBtn.textContent = origText;
                    submitBtn.disabled = false;
                }
            });
        }
    });
})();
