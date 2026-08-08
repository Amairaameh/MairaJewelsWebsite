/* =============================================
   Maira Jewels — Zara Style Auth Modal & Flow
   ============================================= */

(function () {
    'use strict';

    // Inject Auth Modal HTML into body if not present
    function createAuthModalHTML() {
        if (document.getElementById('auth-modal')) return;

        const modalDiv = document.createElement('div');
        modalDiv.id = 'auth-modal';
        modalDiv.className = 'auth-modal-overlay';
        modalDiv.setAttribute('aria-hidden', 'true');
        modalDiv.innerHTML = `
            <div class="auth-modal-panel">
                <button class="auth-modal__close" id="auth-modal-close" aria-label="Close modal">&times;</button>
                
                <div class="auth-modal__header">
                    <span class="auth-modal__eyebrow">Maira Jewels Concierge</span>
                    <h2 class="auth-modal__title" id="auth-title">Welcome Back</h2>
                </div>

                <!-- Tabs -->
                <div class="auth-modal__tabs">
                    <button class="auth-tab auth-tab--active" id="tab-login" data-target="form-login">LOG IN</button>
                    <button class="auth-tab" id="tab-register" data-target="form-register">CREATE ACCOUNT</button>
                </div>

                <!-- Log In Form -->
                <form id="form-login" class="auth-form auth-form--active">
                    <div class="auth-group">
                        <label class="auth-label" for="login-email">Email Address</label>
                        <input class="auth-input" type="email" id="login-email" placeholder="client@example.com" required>
                    </div>
                    <div class="auth-group">
                        <label class="auth-label" for="login-password">Password</label>
                        <input class="auth-input" type="password" id="login-password" placeholder="••••••••" required>
                    </div>

                    <div class="auth-options">
                        <label class="auth-checkbox-label">
                            <input type="checkbox" checked>
                            <span>Remember Me</span>
                        </label>
                        <a href="#" class="auth-forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit" class="auth-submit-btn">LOG IN TO MAIRA JEWELS</button>
                </form>

                <!-- Register Form -->
                <form id="form-register" class="auth-form">
                    <div class="auth-group">
                        <label class="auth-label" for="reg-name">Full Name</label>
                        <input class="auth-input" type="text" id="reg-name" placeholder="Maira Khan" required>
                    </div>
                    <div class="auth-group">
                        <label class="auth-label" for="reg-email">Email Address</label>
                        <input class="auth-input" type="email" id="reg-email" placeholder="client@example.com" required>
                    </div>
                    <div class="auth-group">
                        <label class="auth-label" for="reg-password">Create Password</label>
                        <input class="auth-input" type="password" id="reg-password" placeholder="Min 6 characters" required>
                    </div>

                    <div class="auth-options">
                        <label class="auth-checkbox-label">
                            <input type="checkbox" checked>
                            <span>Subscribe to Maira Privé Jewels Gazette</span>
                        </label>
                    </div>

                    <button type="submit" class="auth-submit-btn">CREATE MY ACCOUNT</button>
                </form>

                <div class="auth-modal__footer">
                    <p>By continuing, you agree to Maira Jewels Privacy Policy & Terms of Service.</p>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem('maira_user')) || null;
        } catch (e) {
            return null;
        }
    }

    function updateUserNav() {
        const user = getUser();
        const accountBtns = document.querySelectorAll('.nav-account-btn, #login-trigger, #login-nav-btn');
        const navLoginText = document.getElementById('nav-login-text');
        const mobileLoginText = document.getElementById('mobile-login-text');

        const labelText = (user && user.name) ? user.name.split(' ')[0].toUpperCase() : 'LOG IN';

        if (navLoginText) navLoginText.textContent = labelText;
        if (mobileLoginText) mobileLoginText.textContent = labelText;

        accountBtns.forEach(btn => {
            if (user && user.name) {
                const firstName = user.name.split(' ')[0];
                btn.innerHTML = `
                    <svg class="nav-account-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>${firstName.toUpperCase()}</span>
                `;
            } else {
                btn.innerHTML = `
                    <svg class="nav-account-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>LOG IN</span>
                `;
            }
        });
    }

    function showToast(msg) {
        let toast = document.getElementById('auth-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'auth-toast';
            toast.className = 'auth-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function initAuthEvents() {
        const overlay = document.getElementById('auth-modal');
        const closeBtn = document.getElementById('auth-modal-close');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        const formLogin = document.getElementById('form-login');
        const formRegister = document.getElementById('form-register');
        const titleEl = document.getElementById('auth-title');

        if (!overlay) return;

        function openModal() {
            const user = getUser();
            if (user) {
                // If logged in, ask to sign out
                if (confirm(`Logged in as ${user.name} (${user.email}). Would you like to sign out?`)) {
                    localStorage.removeItem('maira_user');
                    updateUserNav();
                    showToast('Signed out successfully');
                }
                return;
            }
            overlay.classList.add('open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            overlay.classList.remove('open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        // Attach trigger listener
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.nav-account-btn, #login-trigger, #login-nav-btn');
            if (trigger) {
                e.preventDefault();
                openModal();
            }
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        // Tab switching
        if (tabLogin && tabRegister) {
            tabLogin.addEventListener('click', () => {
                tabLogin.classList.add('auth-tab--active');
                tabRegister.classList.remove('auth-tab--active');
                formLogin.classList.add('auth-form--active');
                formRegister.classList.remove('auth-form--active');
                if (titleEl) titleEl.textContent = 'Welcome Back';
            });

            tabRegister.addEventListener('click', () => {
                tabRegister.classList.add('auth-tab--active');
                tabLogin.classList.remove('auth-tab--active');
                formRegister.classList.add('auth-form--active');
                formLogin.classList.remove('auth-form--active');
                if (titleEl) titleEl.textContent = 'Join Maira Privé';
            });
        }

        // Form login submit
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const name = email.split('@')[0];
                const userObj = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
                localStorage.setItem('maira_user', JSON.stringify(userObj));
                updateUserNav();
                closeModal();
                showToast(`Welcome back, ${userObj.name}!`);
            });
        }

        // Form register submit
        if (formRegister) {
            formRegister.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('reg-name').value;
                const email = document.getElementById('reg-email').value;
                const userObj = { name, email };
                localStorage.setItem('maira_user', JSON.stringify(userObj));
                updateUserNav();
                closeModal();
                showToast(`Account created. Welcome to Maira Jewels, ${name}!`);
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        createAuthModalHTML();
        initAuthEvents();
        updateUserNav();
    });

    // Fallback if script loads after DOMContentLoaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        createAuthModalHTML();
        initAuthEvents();
        updateUserNav();
    }
})();
