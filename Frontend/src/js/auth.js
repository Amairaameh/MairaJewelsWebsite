/* =============================================
   Maira Jewels - Zara Style Auth Modal & Flow (API Integrated)
   ============================================= */

import api from './api.js';

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

                <!-- Fixed Header -->
                <div class="auth-modal__header">
                    <span class="auth-modal__eyebrow">Maira Jewels</span>
                    <h2 class="auth-modal__title" id="auth-title">Welcome Back</h2>
                </div>

                <!-- Fixed Tabs -->
                <div class="auth-modal__tabs">
                    <button class="auth-tab auth-tab--active" id="tab-login">Log In</button>
                    <button class="auth-tab" id="tab-register">Create Account</button>
                </div>

                <!-- Scrollable Body -->
                <div class="auth-modal__body">
                    <div id="auth-error-msg" style="display:none; color:#9b2219; background:#fdf3f2; padding:8px 12px; font-size:0.82rem; margin-bottom:12px; border:1px solid rgba(155,34,25,0.2); border-radius:3px;"></div>

                    <!-- Log In Form -->
                    <form id="form-login" class="auth-form auth-form--active">
                        <div class="auth-group">
                            <label class="auth-label" for="login-email">Email Address</label>
                            <input class="auth-input" type="email" id="login-email" placeholder="your@email.com" required>
                        </div>
                        <div class="auth-group">
                            <label class="auth-label" for="login-password">Password</label>
                            <input class="auth-input" type="password" id="login-password" placeholder="Enter password" minlength="8" maxlength="15" required>
                        </div>
                        <div class="auth-options">
                            <label class="auth-checkbox-label">
                                <input type="checkbox" checked>
                                <span>Remember Me</span>
                            </label>
                            <a href="#" class="auth-forgot-link">Forgot Password?</a>
                        </div>
                        <button type="submit" class="auth-submit-btn" id="modal-login-btn">Log In to Maira Jewels</button>
                    </form>

                    <!-- Register Form -->
                    <form id="form-register" class="auth-form">
                        <div class="auth-group">
                            <label class="auth-label" for="reg-name">Full Name</label>
                            <input class="auth-input" type="text" id="reg-name" placeholder="Your full name" required>
                        </div>
                        <div class="auth-group">
                            <label class="auth-label" for="reg-email">Email Address</label>
                            <input class="auth-input" type="email" id="reg-email" placeholder="your@email.com" required>
                        </div>
                        <div class="auth-group">
                            <label class="auth-label" for="reg-password">Create Password <span style="opacity:0.6; font-size:0.9em;">(8–15 chars)</span></label>
                            <input class="auth-input" type="password" id="reg-password" placeholder="Choose a password" required minlength="8" maxlength="15">
                        </div>
                        <button type="submit" class="auth-submit-btn" id="modal-reg-btn">Create My Account</button>
                    </form>
                </div>

                <!-- Fixed Footer -->
                <div class="auth-modal__footer">
                    <span>By continuing you agree to Maira Jewels&rsquo; Privacy Policy &amp; Terms.</span>
                </div>
            </div>
        `;
        document.body.appendChild(modalDiv);
    }


    // Inject Profile Management Modal HTML
    function createProfileModalHTML() {
        if (document.getElementById('profile-modal')) return;

        const profileModalDiv = document.createElement('div');
        profileModalDiv.id = 'profile-modal';
        profileModalDiv.className = 'auth-modal-overlay';
        profileModalDiv.setAttribute('aria-hidden', 'true');
        profileModalDiv.innerHTML = `
            <div class="auth-modal-panel profile-modal-panel" style="max-width: 460px;">
                <button class="auth-modal__close" id="profile-modal-close" aria-label="Close modal">&times;</button>

                <!-- Fixed Header -->
                <div class="auth-modal__header">
                    <span class="auth-modal__eyebrow">Client Portal</span>
                    <h2 class="auth-modal__title" id="profile-modal-title">My Account</h2>
                </div>

                <!-- Fixed Tabs -->
                <div class="auth-modal__tabs">
                    <button class="auth-tab auth-tab--active" id="tab-profile-info">Profile</button>
                    <button class="auth-tab" id="tab-profile-security">Security</button>
                    <button class="auth-tab" id="tab-profile-orders">My Orders</button>
                </div>

                <!-- Scrollable Body -->
                <div class="auth-modal__body">
                    <div id="profile-status-msg" style="display:none; padding:8px 12px; font-size:0.82rem; margin-bottom:12px; border-radius:3px;"></div>

                    <!-- Profile Info — Read Only Display -->
                    <div id="form-profile-info" class="auth-form auth-form--active">
                        <div class="profile-info-row">
                            <span class="auth-label">Full Name</span>
                            <span class="profile-info-value" id="profile-name-display">—</span>
                        </div>
                        <div class="profile-info-row">
                            <span class="auth-label">Email Address</span>
                            <span class="profile-info-value" id="profile-email-display">—</span>
                        </div>
                        <p class="profile-info-notice">To update your account details, please contact our support team.</p>
                    </div>

                    <!-- Password & Security Form -->
                    <form id="form-profile-security" class="auth-form">
                        <div class="auth-group">
                            <label class="auth-label" for="profile-current-password">Current Password</label>
                            <input class="auth-input" type="password" id="profile-current-password" placeholder="Enter current password" required>
                        </div>
                        <div class="auth-group">
                            <label class="auth-label" for="profile-new-password">New Password <span style="opacity:0.6; font-size:0.9em;">(8–15 chars)</span></label>
                            <input class="auth-input" type="password" id="profile-new-password" placeholder="Enter new password" minlength="8" maxlength="15" required>
                        </div>
                        <div class="auth-group">
                            <label class="auth-label" for="profile-confirm-password">Confirm New Password</label>
                            <input class="auth-input" type="password" id="profile-confirm-password" placeholder="Confirm new password" minlength="8" maxlength="15" required>
                        </div>
                        <button type="submit" class="auth-submit-btn" id="password-save-btn">Update Password</button>
                    </form>

                    <!-- Order History Panel -->
                    <div id="panel-profile-orders" class="auth-form">
                        <div id="profile-orders-list">
                            <p style="color:#9a8c7a; font-size:0.85rem; text-align:center; padding:2.5rem 0;">Loading your order history...</p>
                        </div>
                    </div>
                </div>

                <!-- Fixed Footer -->
                <div class="auth-modal__footer">
                    <span>Maira Jewels Fine Jewellery</span>
                    <button type="button" id="profile-modal-logout" style="background:none; border:none; color:#b0392b; font-size:0.65rem; letter-spacing:0.14em; text-transform:uppercase; font-weight:700; cursor:pointer; font-family:inherit; padding:0;">Sign Out</button>
                </div>
            </div>
        `;
        document.body.appendChild(profileModalDiv);
    }


    function getUser() {
        return api.getUser();
    }

    function showAuthError(msg) {
        const errEl = document.getElementById('auth-error-msg');
        if (errEl) {
            errEl.textContent = msg;
            errEl.style.display = msg ? 'block' : 'none';
        }
    }

    function showProfileStatus(msg, isSuccess = false) {
        const statusEl = document.getElementById('profile-status-msg');
        if (statusEl) {
            statusEl.textContent = msg;
            statusEl.style.display = msg ? 'block' : 'none';
            if (isSuccess) {
                statusEl.style.color = '#155724';
                statusEl.style.background = '#d4edda';
                statusEl.style.border = '1px solid #c3e6cb';
            } else {
                statusEl.style.color = '#e53e3e';
                statusEl.style.background = '#fff5f5';
                statusEl.style.border = '1px solid #feb2b2';
            }
        }
    }

    function getInitials(name) {
        if (!name) return 'MJ';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    function showToast(msg) {
        const toast = document.getElementById('toast') || document.getElementById('login-page-toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function isValidPassword(password) {
        return typeof password === 'string' && password.length >= 8 && password.length <= 15;
    }

    // Render Luxury Profile Badge & Dropdown in Navbar
    function updateUserNav() {
        const user = getUser();
        // Collect distinct top-nav login anchors
        const processed = new Set();
        const rawElements = document.querySelectorAll('.nav-account-btn, #nav-login-text, a[href="login.html"], a[href="login.html"]:not(.mobile-drawer__btn)');

        rawElements.forEach(el => {
            if (el.closest('.mobile-drawer') || el.closest('.auth-modal-overlay') || el.closest('.login-page-section')) return;
            const link = el.tagName === 'A' ? el : (el.closest('a') || el);
            if (processed.has(link)) return;
            processed.add(link);

            const container = link.parentElement;

            if (!user) {
                // Not logged in -> Show Clean Log In
                link.className = 'nav-account-btn';
                link.innerHTML = `
                    <svg class="nav-account-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span id="nav-login-text" style="font-size:0.75rem; letter-spacing:0.15em; text-transform:uppercase;">LOG IN</span>
                `;
                link.classList.remove('nav-profile-badge-link');
                const existingMenu = container ? container.querySelector('.profile-dropdown-menu') : null;
                if (existingMenu) existingMenu.remove();
                link.onclick = (e) => {
                    if (!window.location.pathname.includes('login.html')) {
                        e.preventDefault();
                        if (typeof window.openAuthModal === 'function') window.openAuthModal('login');
                    }
                };
            } else {
                // Logged in -> Show Luxury Profile Badge with Avatar & Dropdown Menu
                const initials = getInitials(user.name);
                link.className = 'nav-account-btn nav-profile-badge-link';
                link.style.cssText = 'position:relative; display:inline-flex; align-items:center; gap:5px; cursor:pointer; text-decoration:none;';
                link.setAttribute('href', '#');
                link.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const dropdown = container ? container.querySelector('.profile-dropdown-menu') : null;
                    if (dropdown) dropdown.classList.toggle('profile-dropdown-menu--open');
                };
                link.innerHTML = `
                    <div class="user-avatar-badge" title="${user.name}">
                        ${initials}
                    </div>
                    <svg class="dropdown-chevron" width="9" height="5" viewBox="0 0 9 5" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 1L4.5 4L8 1" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `;

                // Build Premium Dropdown Menu
                if (container) {
                    container.style.position = 'relative';
                    let dropdown = container.querySelector('.profile-dropdown-menu');
                    if (!dropdown) {
                        dropdown = document.createElement('div');
                        dropdown.className = 'profile-dropdown-menu';
                        container.appendChild(dropdown);
                    }
                    dropdown.innerHTML = `
                        <div class="profile-dropdown-header">
                            <div class="dropdown-avatar-lg">${initials}</div>
                            <div class="dropdown-user-details">
                                <strong class="dropdown-name">${user.name || 'Valued Client'}</strong>
                                <span class="dropdown-email">${user.email || ''}</span>
                                <span class="dropdown-member-tag">Maira Jewels Client</span>
                            </div>
                        </div>
                        <div class="profile-dropdown-divider"></div>
                        <a href="#" class="profile-dropdown-item" id="menu-opt-profile">
                            <span class="dropdown-item-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </span>
                            <span class="dropdown-item-label">Manage Profile</span>
                        </a>
                        <a href="#" class="profile-dropdown-item" id="menu-opt-password">
                            <span class="dropdown-item-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            </span>
                            <span class="dropdown-item-label">Security & Password</span>
                        </a>
                        <a href="#" class="profile-dropdown-item" id="menu-opt-orders">
                            <span class="dropdown-item-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            </span>
                            <span class="dropdown-item-label">Order History</span>
                        </a>
                        <div class="profile-dropdown-divider"></div>
                        <a href="#" class="profile-dropdown-item profile-dropdown-item--logout" id="menu-opt-logout">
                            <span class="dropdown-item-icon">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </span>
                            <span class="dropdown-item-label">Sign Out</span>
                        </a>
                    `;
                }
            }
        });


        // Mobile drawer update
        const mobileLoginText = document.getElementById('mobile-login-text');
        if (mobileLoginText) {
            mobileLoginText.textContent = user ? `MY ACCOUNT (${(user.name || 'User').split(' ')[0]})` : 'LOG IN';
        }
    }

    /* ---------- Profile Management Modal Events ---------- */
    function initProfileModalEvents() {
        const profileModal = document.getElementById('profile-modal');
        const closeBtn = document.getElementById('profile-modal-close');
        const logoutBtn = document.getElementById('profile-modal-logout');

        const tabInfo = document.getElementById('tab-profile-info');
        const tabSecurity = document.getElementById('tab-profile-security');
        const tabOrders = document.getElementById('tab-profile-orders');

        const formInfo = document.getElementById('form-profile-info');
        const formSecurity = document.getElementById('form-profile-security');
        const panelOrders = document.getElementById('panel-profile-orders');

        if (!profileModal) return;

        function openProfileModal(activeTab = 'info') {
            const user = getUser();
            if (!user) {
                if (typeof window.openAuthModal === 'function') {
                    window.openAuthModal('login');
                }
                return;
            }

            // Close any open dropdowns
            document.querySelectorAll('.profile-dropdown-menu--open').forEach(m => m.classList.remove('profile-dropdown-menu--open'));

            // Populate read-only profile display
            showProfileStatus('');
            const nameDisplay = document.getElementById('profile-name-display');
            const emailDisplay = document.getElementById('profile-email-display');
            const phoneDisplay = document.getElementById('profile-phone-display');

            if (nameDisplay) nameDisplay.textContent = user.name || '—';
            if (emailDisplay) emailDisplay.textContent = user.email || '—';
            if (phoneDisplay) phoneDisplay.textContent = user.phone || 'Not provided';

            // Switch to requested tab
            if (activeTab === 'security' && tabSecurity) {
                tabSecurity.click();
            } else if (activeTab === 'orders' && tabOrders) {
                tabOrders.click();
            } else if (tabInfo) {
                tabInfo.click();
            }

            profileModal.classList.add('auth-modal-overlay--open');
            profileModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        window.openProfileModal = openProfileModal;

        function closeProfileModal() {
            profileModal.classList.remove('auth-modal-overlay--open');
            profileModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.addEventListener('click', closeProfileModal);
        profileModal.addEventListener('click', (e) => {
            if (e.target === profileModal) closeProfileModal();
        });

        // Tab switching in Profile Modal
        if (tabInfo && tabSecurity && tabOrders) {
            tabInfo.addEventListener('click', () => {
                showProfileStatus('');
                tabInfo.classList.add('auth-tab--active');
                tabSecurity.classList.remove('auth-tab--active');
                tabOrders.classList.remove('auth-tab--active');
                formInfo.classList.add('auth-form--active');
                formSecurity.classList.remove('auth-form--active');
                panelOrders.classList.remove('auth-form--active');
            });

            tabSecurity.addEventListener('click', () => {
                showProfileStatus('');
                tabSecurity.classList.add('auth-tab--active');
                tabInfo.classList.remove('auth-tab--active');
                tabOrders.classList.remove('auth-tab--active');
                formSecurity.classList.add('auth-form--active');
                formInfo.classList.remove('auth-form--active');
                panelOrders.classList.remove('auth-form--active');
            });

            tabOrders.addEventListener('click', () => {
                showProfileStatus('');
                tabOrders.classList.add('auth-tab--active');
                tabInfo.classList.remove('auth-tab--active');
                tabSecurity.classList.remove('auth-tab--active');
                panelOrders.classList.add('auth-form--active');
                formInfo.classList.remove('auth-form--active');
                formSecurity.classList.remove('auth-form--active');
                loadOrderHistory();
            });
        }

        // Profile Info is read-only — no submit handler needed

        // Security / Password Submit
        if (formSecurity) {
            formSecurity.addEventListener('submit', async (e) => {
                e.preventDefault();
                showProfileStatus('');
                const currentPassword = document.getElementById('profile-current-password').value;
                const newPassword = document.getElementById('profile-new-password').value;
                const confirmPassword = document.getElementById('profile-confirm-password').value;
                const saveBtn = document.getElementById('password-save-btn');

                if (!currentPassword) {
                    showProfileStatus('Please enter your current password.');
                    return;
                }
                if (!newPassword || !isValidPassword(newPassword)) {
                    showProfileStatus('New password must be between 8 and 15 characters.');
                    return;
                }
                if (newPassword !== confirmPassword) {
                    showProfileStatus('New passwords do not match.');
                    return;
                }

                const origText = saveBtn.textContent;
                saveBtn.textContent = 'UPDATING...';
                saveBtn.disabled = true;

                try {
                    await api.updatePassword({ currentPassword, newPassword });
                    showProfileStatus('Password updated successfully ✓', true);
                    formSecurity.reset();
                    showToast('Password updated securely ✓');
                } catch (err) {
                    showProfileStatus(err.message || 'Unable to update password. Please check your current password.');
                } finally {
                    saveBtn.textContent = origText;
                    saveBtn.disabled = false;
                }
            });
        }

        // Sign Out from Profile Modal
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                api.logout();
                updateUserNav();
                closeProfileModal();
                showToast('You have been signed out.');
                window.dispatchEvent(new CustomEvent('maira:auth_logout'));
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 350);
            });
        }

        // Fetch Order History
        async function loadOrderHistory() {
            const listEl = document.getElementById('profile-orders-list');
            if (!listEl) return;

            try {
                const res = await api.getMyOrders();
                const orders = res.data?.orders || [];

                if (orders.length === 0) {
                    listEl.innerHTML = `
                        <div style="text-align:center; padding:2.5rem 1rem;">
                            <p style="color:var(--color-muted); font-size:0.9rem; margin-bottom:1rem;">You have not placed any orders yet.</p>
                            <a href="collections.html" class="btn btn--small btn--primary" style="display:inline-flex; font-size:0.75rem; padding:0.4rem 1rem;">Explore Collections</a>
                        </div>
                    `;
                    return;
                }

                listEl.innerHTML = orders.map(order => {
                    const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                    const statusClass = order.status === 'Delivered' ? 'color:#27ae60;' : order.status === 'Cancelled' ? 'color:#e53e3e;' : 'color:var(--color-gold-dark);';
                    const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
                    const totalStr = 'R ' + Number(order.totalAmount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 });

                    return `
                        <div style="border: 1px solid var(--color-border); padding: 1rem 1.25rem; margin-bottom: 0.85rem; background: var(--color-white); border-radius: 2px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                                <strong style="font-family:var(--font-serif); font-size:1.05rem; color:var(--color-charcoal);">${order.orderNumber || 'Order #' + order._id?.slice(-6)}</strong>
                                <span style="font-size:0.75rem; font-weight:600; text-transform:uppercase; ${statusClass}">${order.status || 'Processing'}</span>
                            </div>
                            <div style="font-size:0.8rem; color:var(--color-muted); display:flex; justify-content:space-between;">
                                <span>${dateStr} &bull; ${itemsCount} item(s)</span>
                                <strong style="color:var(--color-charcoal);">${totalStr}</strong>
                            </div>
                        </div>
                    `;
                }).join('');
            } catch (err) {
                listEl.innerHTML = `
                    <div style="text-align:center; padding:2rem 1rem;">
                        <p style="color:var(--color-muted); font-size:0.88rem;">No past order history found for your account.</p>
                        <a href="collections.html" class="btn btn--small btn--primary" style="margin-top:0.8rem; display:inline-flex; font-size:0.72rem; padding:0.4rem 1rem;">Shop High Jewellery</a>
                    </div>
                `;
            }
        }
    }

    // Auth Modal Events (login / register forms)
    function initAuthEvents() {
        const overlay = document.getElementById('auth-modal');
        const closeBtn = document.getElementById('auth-modal-close');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        const formLogin = document.getElementById('form-login');
        const formRegister = document.getElementById('form-register');
        const titleEl = document.getElementById('auth-title');

        if (!overlay) return;

        function openModal(defaultTab = 'login') {
            const user = getUser();
            if (user) return; // already logged in
            showAuthError('');
            if (defaultTab === 'register' && tabRegister) {
                tabRegister.click();
            } else if (tabLogin) {
                tabLogin.click();
            }
            overlay.classList.add('auth-modal-overlay--open');
            overlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            overlay.classList.remove('auth-modal-overlay--open');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        window.openAuthModal = openModal;
        window.closeAuthModal = closeModal;

        // Click backdrop to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        // Tab switching
        if (tabLogin && tabRegister) {
            tabLogin.addEventListener('click', () => {
                showAuthError('');
                tabLogin.classList.add('auth-tab--active');
                tabRegister.classList.remove('auth-tab--active');
                if (formLogin) formLogin.classList.add('auth-form--active');
                if (formRegister) formRegister.classList.remove('auth-form--active');
                if (titleEl) titleEl.textContent = 'Welcome Back';
            });

            tabRegister.addEventListener('click', () => {
                showAuthError('');
                tabRegister.classList.add('auth-tab--active');
                tabLogin.classList.remove('auth-tab--active');
                if (formRegister) formRegister.classList.add('auth-form--active');
                if (formLogin) formLogin.classList.remove('auth-form--active');
                if (titleEl) titleEl.textContent = 'Join Maira Jewels';
            });
        }

        // Login form submit
        if (formLogin) {
            formLogin.addEventListener('submit', async (e) => {
                e.preventDefault();
                showAuthError('');
                const email = document.getElementById('login-email').value.trim();
                const password = document.getElementById('login-password').value;
                const submitBtn = document.getElementById('modal-login-btn');

                if (!email || !isValidEmail(email)) { showAuthError('Please enter a valid email address.'); return; }
                if (!isValidPassword(password)) { showAuthError('Password must be between 8 and 15 characters.'); return; }

                const orig = submitBtn.textContent;
                submitBtn.textContent = 'AUTHENTICATING...';
                submitBtn.disabled = true;

                try {
                    const rememberCheckbox = document.getElementById('login-remember') || document.getElementById('remember-me');
                    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

                    const res = await api.login({ email, password, rememberMe });
                    console.log('[Modal Login Response]', JSON.stringify(res));
                    const userObj = res.user || (res.data && res.data.user) || (res.data && res.data.name ? res.data : null);
                    const token = res.token || (res.data && res.data.token) || res.jwt || (res.data && res.data.jwt) || res.accessToken || (res.data && res.data.accessToken) || (userObj ? `user_token_client_${userObj._id || userObj.id || Date.now()}` : null);
                    
                    if (token) api.setToken(token, rememberMe);
                    if (userObj) api.setUser(userObj);

                    updateUserNav();
                    closeModal();
                    const name = (userObj && userObj.name) || 'Client';
                    showToast(`Welcome back, ${name}!`);
                    window.dispatchEvent(new CustomEvent('maira:auth_success'));
                } catch (err) {
                    showAuthError(err.message || 'Login failed. Please check your credentials.');
                } finally {
                    submitBtn.textContent = orig;
                    submitBtn.disabled = false;
                }
            });
        }

        // Register form submit
        if (formRegister) {
            formRegister.addEventListener('submit', async (e) => {
                e.preventDefault();
                showAuthError('');
                const name = document.getElementById('reg-name').value.trim();
                const email = document.getElementById('reg-email').value.trim();
                const password = document.getElementById('reg-password').value;
                const submitBtn = document.getElementById('modal-reg-btn');

                if (!name) { showAuthError('Please enter your full name.'); return; }
                if (!email || !isValidEmail(email)) { showAuthError('Please enter a valid email address.'); return; }
                if (!isValidPassword(password)) { showAuthError('Password must be between 8 and 15 characters.'); return; }

                const orig = submitBtn.textContent;
                submitBtn.textContent = 'CREATING ACCOUNT...';
                submitBtn.disabled = true;

                try {
                    const res = await api.register({ name, email, password });
                    console.log('[Modal Register Response]', JSON.stringify(res));
                    const userObj = res.user || (res.data && res.data.user) || (res.data && res.data.name ? res.data : null);
                    const token = res.token || (res.data && res.data.token) || res.jwt || (res.data && res.data.jwt) || res.accessToken || (res.data && res.data.accessToken) || (userObj ? `maira_token_client_${userObj._id || userObj.id || Date.now()}` : null);
                    
                    if (token) api.setToken(token);
                    if (userObj) api.setUser(userObj);

                    // Sync customer to Admin Storage (maira_admin_customers)
                    try {
                        const currentAdminCustomers = JSON.parse(localStorage.getItem('maira_admin_customers') || '[]');
                        const userRec = userObj || { name, email };
                        const existingIdx = currentAdminCustomers.findIndex(c => c.email && c.email.toLowerCase() === email.toLowerCase());
                        const custData = {
                            id: `CUST-${(userRec._id || userRec.id || Date.now()).toString().slice(-6).toUpperCase()}`,
                            name: userRec.name || name,
                            email: userRec.email || email,
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

                    updateUserNav();
                    closeModal();
                    showToast(`Welcome to Maira Jewels, ${name}!`);
                    window.dispatchEvent(new CustomEvent('maira:auth_success'));
                } catch (err) {
                    showAuthError(err.message || 'Registration failed. Please try again.');
                } finally {
                    submitBtn.textContent = orig;
                    submitBtn.disabled = false;
                }
            });
        }
    }

    // Global Delegated Click Handler for Profile Badge & Dropdown Options
    function initGlobalDropdownEvents() {
        document.addEventListener('click', (e) => {
            const badge = e.target.closest('.nav-profile-badge-link');
            const dropdownItem = e.target.closest('.profile-dropdown-item');

            if (badge) {
                e.preventDefault();
                e.stopPropagation();
                const parentLi = badge.parentElement;
                const dropdown = parentLi ? parentLi.querySelector('.profile-dropdown-menu') : null;
                if (dropdown) {
                    dropdown.classList.toggle('profile-dropdown-menu--open');
                }
                return;
            }

            if (dropdownItem) {
                e.preventDefault();
                const optId = dropdownItem.id;
                document.querySelectorAll('.profile-dropdown-menu--open').forEach(m => m.classList.remove('profile-dropdown-menu--open'));

                if (optId === 'menu-opt-profile') {
                    if (typeof window.openProfileModal === 'function') window.openProfileModal('info');
                } else if (optId === 'menu-opt-password') {
                    if (typeof window.openProfileModal === 'function') window.openProfileModal('security');
                } else if (optId === 'menu-opt-orders') {
                    if (typeof window.openProfileModal === 'function') window.openProfileModal('orders');
                } else if (optId === 'menu-opt-logout') {
                    api.logout();
                    updateUserNav();
                    showToast('You have been signed out.');
                    window.dispatchEvent(new CustomEvent('maira:auth_logout'));
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 350);
                }
                return;
            }

            // Click outside closes dropdown
            if (!e.target.closest('.profile-dropdown-menu')) {
                document.querySelectorAll('.profile-dropdown-menu--open').forEach(m => m.classList.remove('profile-dropdown-menu--open'));
            }
        });
    }

    function syncUserToAdminCustomers(user) {
        if (!user || !user.email) return;
        try {
            const currentAdminCustomers = JSON.parse(localStorage.getItem('maira_admin_customers') || '[]');
            const existingIdx = currentAdminCustomers.findIndex(c => c.email && c.email.toLowerCase() === user.email.toLowerCase());
            const custData = {
                id: `CUST-${(user._id || user.id || Date.now()).toString().slice(-6).toUpperCase()}`,
                name: user.name || 'Valued Client',
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                createdAt: user.createdAt || new Date().toISOString()
            };
            if (existingIdx !== -1) {
                currentAdminCustomers[existingIdx] = { ...currentAdminCustomers[existingIdx], ...custData };
            } else {
                currentAdminCustomers.unshift(custData);
            }
            localStorage.setItem('maira_admin_customers', JSON.stringify(currentAdminCustomers));
        } catch (e) {
            console.warn('[Admin Customer Sync]', e.message);
        }
    }

    async function syncBackendSession() {
        const existingToken = api.getToken();
        const existingUser = api.getUser();

        if (!existingToken) {
            // Strict token check: No token = Instant Logout & Reset UI
            api.logout();
            updateUserNav();
            return;
        }

        // Sync logged in user into Admin Panel storage so customer displays immediately
        if (existingUser) {
            syncUserToAdminCustomers(existingUser);
        }

        // User already in localStorage - nav is already rendered, background-sync only
        if (existingUser) {
            // Already showing badge. Verify token silently.
            try {
                await api.getMe();
                updateUserNav(); // refresh with latest backend data
            } catch (err) {
                console.warn('[Session Sync]', err.message);
                // Only clear if backend explicitly says unauthorized
                if (err.status === 401 || err.status === 403) {
                    api.logout();
                    updateUserNav();
                }
                // For any other error (network, format), keep existing session
            }
        } else {
            // Token exists but no user in storage — try to recover from backend
            try {
                const res = await api.getMe();
                // Extract user from any possible response shape
                const userObj = res.user || (res.data && res.data.user) ||
                    (res.data && res.data.name ? res.data : null) ||
                    (res.name ? res : null);
                if (userObj) {
                    api.setUser(userObj);
                    updateUserNav();
                } else {
                    console.warn('[Session Sync] Could not extract user from /me response:', JSON.stringify(res));
                }
            } catch (err) {
                console.warn('[Session Sync Error]', err.message);
                if (err.status === 401 || err.status === 403) {
                    api.logout();
                    updateUserNav();
                }
            }
        }
    }

    window.addEventListener('maira:user_updated', () => updateUserNav());
    window.addEventListener('maira:auth_success', () => updateUserNav());
    window.addEventListener('maira:auth_logout', () => updateUserNav());
    window.addEventListener('storage', (e) => {
        if (e.key === 'user_data' || e.key === 'user_token' || e.key === 'user' || e.key === 'token') {
            updateUserNav();
        }
    });

    function init() {
        createAuthModalHTML();
        createProfileModalHTML();
        initAuthEvents();
        initProfileModalEvents();
        initGlobalDropdownEvents();
        // Immediately render from localStorage — no need to wait for network
        updateUserNav();
        // Background sync: validate token with backend silently
        syncBackendSession();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
