/* =============================================
   MairaJewels - Checkout Page JS (API Integrated with Auth Guard)
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

    function clearCart() {
        localStorage.removeItem('maira_cart');
    }

    function parsePrice(priceVal) {
        if (typeof priceVal === 'number') return priceVal;
        if (!priceVal) return 0;
        let s = String(priceVal).trim();
        if (s.includes(',') && s.includes('.')) {
            s = s.replace(/,/g, '');
        } else if (s.includes(',')) {
            s = s.replace(',', '.');
        }
        const cleaned = s.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function formatPrice(val) {
        const num = (typeof val === 'number' && !isNaN(val)) ? val : parseFloat(val) || 0;
        return 'R ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderCheckoutSummary() {
        const cart = getCart();
        const itemsList = document.getElementById('checkout-items-list');
        const subtotalEl = document.getElementById('checkout-subtotal');
        const totalEl = document.getElementById('checkout-total');
        const cartBadge = document.getElementById('cart-count-badge');

        const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (cartBadge) cartBadge.textContent = totalQty;

        if (cart.length === 0) {
            if (itemsList) {
                itemsList.innerHTML = '<p style="color:var(--color-muted); font-size:0.9rem;">No items in cart.</p>';
            }
            if (subtotalEl) subtotalEl.textContent = 'R 0.00';
            if (totalEl) totalEl.textContent = 'R 0.00';
            return;
        }

        if (itemsList) {
            itemsList.innerHTML = '';
            let subtotal = 0;

            cart.forEach(item => {
                const itemPriceNum = item.priceNum || parsePrice(item.price);
                const qty = item.quantity || 1;
                const lineTotal = itemPriceNum * qty;
                subtotal += lineTotal;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'checkout-summary__item';
                const imgSrc = (item.image && item.image.trim()) ? item.image : 'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80';
                const specsText = item.specs || item.metal || item.category || '18K Gold';

                itemDiv.innerHTML = `
                    <div class="checkout-summary__item-img">
                        <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80'">
                    </div>
                    <div style="flex:1; min-width:0; padding-right:10px;">
                        <h4 class="checkout-summary__item-name">${item.name}</h4>
                        <span class="checkout-summary__item-specs" style="display:block; font-size:0.75rem; color:var(--color-muted); margin-top:2px;">${specsText}</span>
                        <span class="checkout-summary__item-meta" style="font-size:0.75rem; color:var(--color-muted);">Qty: ${qty} &bull; ${formatPrice(itemPriceNum)} each</span>
                    </div>
                    <div class="checkout-summary__item-price">${formatPrice(lineTotal)}</div>
                `;
                itemsList.appendChild(itemDiv);
            });

            const total = subtotal;

            if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
            if (totalEl) totalEl.textContent = formatPrice(total);
        }
    }

    // Attach numeric filter to phone and alternate phone inputs
    ['phone', 'alt-phone'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9+\s\-]/g, '');
            });
        }
    });

    // Authentication Guard - Checkout is strictly for authenticated clients
    const currentUser = api.getUser();
    const currentToken = api.getToken();
    if (!currentUser || !currentToken) {
        // Redirect to login with return parameter
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }

    // Prefill user data if logged in
    function prefillUserData() {
        const user = api.getUser();
        const firstNameInput = document.getElementById('first-name');
        const lastNameInput = document.getElementById('last-name');
        const phoneInput = document.getElementById('phone');

        if (user) {
            if (user.name) {
                const parts = user.name.trim().split(' ');
                if (firstNameInput && !firstNameInput.value) firstNameInput.value = parts[0] || '';
                if (lastNameInput && !lastNameInput.value) lastNameInput.value = parts.slice(1).join(' ') || '';
            }
            if (phoneInput && user.phone && !phoneInput.value) phoneInput.value = user.phone;
        }

        // Render / Update Auth Banner on Checkout
        renderAuthBanner(user);
    }

    function renderAuthBanner(user) {
        let authBanner = document.getElementById('checkout-auth-banner');
        const formSection = document.querySelector('.checkout-form-section');

        if (!user) {
            if (!authBanner && formSection) {
                authBanner = document.createElement('div');
                authBanner.id = 'checkout-auth-banner';
                authBanner.style.cssText = 'background: #fff8f0; border: 1px solid var(--color-gold); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-radius: 2px;';
                authBanner.innerHTML = `
                    <div style="font-size: 0.85rem; color: var(--color-charcoal);">
                        <strong>Sign In Required:</strong> You must be signed in to place your fine jewellery order.
                    </div>
                    <a href="login.html?redirect=checkout.html" class="btn btn--small btn--primary" style="padding: 0.45rem 1rem; font-size: 0.75rem; white-space: nowrap; text-decoration: none;">LOG IN NOW</a>
                `;
                formSection.insertBefore(authBanner, formSection.firstChild);
            }
        } else {
            if (!authBanner && formSection) {
                authBanner = document.createElement('div');
                authBanner.id = 'checkout-auth-banner';
                formSection.insertBefore(authBanner, formSection.firstChild);
            }
            if (authBanner) {
                authBanner.style.cssText = 'background: rgba(200, 169, 126, 0.08); border: 1px solid rgba(200, 169, 126, 0.35); padding: 0.9rem 1.25rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-radius: 2px;';
                authBanner.innerHTML = `
                    <div style="font-size: 0.85rem; color: var(--color-charcoal);">
                        Logged in as <strong>${user.name}</strong> <span style="color:var(--color-muted);">(${user.email})</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--color-gold-dark); font-weight: 600; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        AUTHENTICATED CLIENT
                    </span>
                `;
            }
        }
    }

    // Listen for auth events to update checkout in real time
    window.addEventListener('maira:auth_success', (e) => {
        prefillUserData();
    });

    window.addEventListener('maira:auth_logout', () => {
        prefillUserData();
    });

    renderCheckoutSummary();
    prefillUserData();

    // Validation Helpers
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
    }

    function isValidSAPhone(phone) {
        const cleaned = String(phone).replace(/[\s\-\(\)]/g, '');
        // South Africa: starts with 0 (10 digits) or +27 (12 chars total)
        return /^(?:\+27|0)[1-8]\d{8}$/.test(cleaned);
    }

    function isValidSAPostalCode(zip) {
        const cleaned = String(zip).trim();
        return /^\d{4}$/.test(cleaned);
    }

    function isValidCardNumber(cardNumber) {
        const cleaned = String(cardNumber).replace(/\s+/g, '');
        return /^\d{13,19}$/.test(cleaned);
    }

    function isValidExpiry(expiry) {
        const match = String(expiry).trim().match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
        if (!match) return false;
        const expMonth = parseInt(match[1], 10);
        const expYear = 2000 + parseInt(match[2], 10);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        return true;
    }

    function isValidCVV(cvv) {
        const cleaned = String(cvv).trim();
        return /^\d{3,4}$/.test(cleaned);
    }

    // Inline Field Validation Helpers
    function setFieldError(fieldId, msg) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        input.style.borderColor = '#c53030';
        input.style.backgroundColor = '#fff8f8';
        
        const parent = input.parentElement;
        let errSpan = parent.querySelector('.field-error-msg');
        if (!errSpan) {
            errSpan = document.createElement('span');
            errSpan.className = 'field-error-msg';
            errSpan.style.cssText = 'color: #c53030; font-size: 0.73rem; margin-top: 4px; display: block; font-weight: 500; letter-spacing: 0.02em;';
            parent.appendChild(errSpan);
        }
        errSpan.textContent = msg;
    }

    function clearFieldError(fieldId) {
        const input = document.getElementById(fieldId);
        if (!input) return;
        
        input.style.borderColor = '';
        input.style.backgroundColor = '';
        
        const parent = input.parentElement;
        const errSpan = parent.querySelector('.field-error-msg');
        if (errSpan) {
            errSpan.remove();
        }
    }

    function clearAllFieldErrors() {
        const allFieldIds = ['first-name', 'last-name', 'phone', 'alt-phone', 'address', 'apartment', 'landmark', 'city', 'zip', 'card-number', 'expiry', 'cvv'];
        allFieldIds.forEach(id => clearFieldError(id));
    }

    function showFormError(msg) {
        let errBanner = document.getElementById('checkout-global-error-banner');
        const form = document.getElementById('checkout-form');
        if (!errBanner && form) {
            errBanner = document.createElement('div');
            errBanner.id = 'checkout-global-error-banner';
            errBanner.style.cssText = 'background:#fff5f5; border:1px solid #feb2b2; color:#c53030; padding:12px 16px; border-radius:4px; font-size:0.85rem; margin-bottom:1rem; text-align:center; font-weight:500;';
            form.prepend(errBanner);
        }
        if (errBanner) {
            errBanner.textContent = msg;
            errBanner.style.display = 'block';
            errBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            alert(msg);
        }
    }

    function clearGlobalError() {
        const errBanner = document.getElementById('checkout-global-error-banner');
        if (errBanner) errBanner.style.display = 'none';
    }

    // Payment Method Selection Toggle
    const radioPayFast = document.getElementById('pay-method-payfast');
    const radioEFT = document.getElementById('pay-method-eft');
    const radioWhatsApp = document.getElementById('pay-method-whatsapp');
    const panelCardDetails = document.getElementById('panel-card-details');
    const panelEFTDetails = document.getElementById('panel-eft-details');
    const panelWhatsAppDetails = document.getElementById('panel-whatsapp-details');
    const labelPayFast = document.getElementById('opt-payfast-label');
    const labelEFT = document.getElementById('opt-eft-label');
    const labelWhatsApp = document.getElementById('opt-whatsapp-label');

    function updatePaymentMethodUI() {
        if (radioPayFast && radioPayFast.checked) {
            if (panelCardDetails) panelCardDetails.style.display = 'grid';
            if (panelEFTDetails) panelEFTDetails.style.display = 'none';
            if (panelWhatsAppDetails) panelWhatsAppDetails.style.display = 'none';
            if (labelPayFast) {
                labelPayFast.style.borderColor = '#c8a97e';
                labelPayFast.style.background = 'rgba(200,169,126,0.06)';
            }
            if (labelEFT) {
                labelEFT.style.borderColor = 'rgba(200,169,126,0.3)';
                labelEFT.style.background = '#faf7f2';
            }
            if (labelWhatsApp) {
                labelWhatsApp.style.borderColor = 'rgba(200,169,126,0.3)';
                labelWhatsApp.style.background = '#faf7f2';
            }
        } else if (radioEFT && radioEFT.checked) {
            if (panelCardDetails) panelCardDetails.style.display = 'none';
            if (panelEFTDetails) panelEFTDetails.style.display = 'block';
            if (panelWhatsAppDetails) panelWhatsAppDetails.style.display = 'none';
            if (labelEFT) {
                labelEFT.style.borderColor = '#c8a97e';
                labelEFT.style.background = 'rgba(200,169,126,0.06)';
            }
            if (labelPayFast) {
                labelPayFast.style.borderColor = 'rgba(200,169,126,0.3)';
                labelPayFast.style.background = '#faf7f2';
            }
            if (labelWhatsApp) {
                labelWhatsApp.style.borderColor = 'rgba(200,169,126,0.3)';
                labelWhatsApp.style.background = '#faf7f2';
            }
            ['card-number', 'expiry', 'cvv'].forEach(id => clearFieldError(id));
        } else if (radioWhatsApp && radioWhatsApp.checked) {
            if (panelCardDetails) panelCardDetails.style.display = 'none';
            if (panelEFTDetails) panelEFTDetails.style.display = 'none';
            if (panelWhatsAppDetails) panelWhatsAppDetails.style.display = 'block';
            if (labelWhatsApp) {
                labelWhatsApp.style.borderColor = '#25D366';
                labelWhatsApp.style.background = 'rgba(37,211,102,0.06)';
            }
            if (labelPayFast) {
                labelPayFast.style.borderColor = 'rgba(200,169,126,0.3)';
                labelPayFast.style.background = '#faf7f2';
            }
            if (labelEFT) {
                labelEFT.style.borderColor = 'rgba(200,169,126,0.3)';
                labelEFT.style.background = '#faf7f2';
            }
            ['card-number', 'expiry', 'cvv'].forEach(id => clearFieldError(id));
        }
    }

    if (radioPayFast) radioPayFast.addEventListener('change', updatePaymentMethodUI);
    if (radioEFT) radioEFT.addEventListener('change', updatePaymentMethodUI);
    if (radioWhatsApp) radioWhatsApp.addEventListener('change', updatePaymentMethodUI);
    updatePaymentMethodUI();

    function getSelectedPaymentMethodName() {
        if (radioWhatsApp && radioWhatsApp.checked) return 'Pay via WhatsApp (Manual)';
        if (radioEFT && radioEFT.checked) return 'Direct Bank Transfer / Instant EFT';
        return 'PayFast (Credit/Debit Card)';
    }

    function validateField(fieldId) {
        const input = document.getElementById(fieldId);
        if (!input) return true;
        const val = input.value.trim();
        const isBypassCard = !radioPayFast || !radioPayFast.checked || (radioEFT && radioEFT.checked) || (radioWhatsApp && radioWhatsApp.checked);

        switch (fieldId) {
            case 'first-name':
                if (!val) { setFieldError(fieldId, 'Please enter your first name.'); return false; }
                break;
            case 'last-name':
                if (!val) { setFieldError(fieldId, 'Please enter your last name.'); return false; }
                break;
            case 'phone':
                if (!val) { setFieldError(fieldId, 'Please enter your primary phone number.'); return false; }
                if (!isValidSAPhone(val)) { setFieldError(fieldId, 'Enter a valid SA phone number (e.g. 082 123 4567 or +27 82 123 4567).'); return false; }
                break;
            case 'alt-phone':
                if (val && !isValidSAPhone(val)) { setFieldError(fieldId, 'Enter a valid alternate SA phone number (e.g. 082 987 6543).'); return false; }
                break;
            case 'address':
                if (!val) { setFieldError(fieldId, 'Please enter your address.'); return false; }
                break;
            case 'apartment':
                break;
            case 'landmark':
                break;
            case 'city':
                if (!val) { setFieldError(fieldId, 'Please enter your city.'); return false; }
                break;
            case 'zip':
                if (!val) { setFieldError(fieldId, 'Please enter your postal code.'); return false; }
                if (!isValidSAPostalCode(val)) { setFieldError(fieldId, 'South African postal code must be 4 digits (e.g. 2000 or 2196).'); return false; }
                break;
            case 'card-number':
                if (isBypassCard) return true;
                if (!val) { setFieldError(fieldId, 'Please enter your card number.'); return false; }
                if (!isValidCardNumber(val)) { setFieldError(fieldId, 'Enter a valid card number (13-19 digits).'); return false; }
                break;
            case 'expiry':
                if (isBypassCard) return true;
                if (!val) { setFieldError(fieldId, 'Please enter expiry date.'); return false; }
                if (!isValidExpiry(val)) { setFieldError(fieldId, 'Enter a valid future expiry date (MM/YY format).'); return false; }
                break;
            case 'cvv':
                if (isBypassCard) return true;
                if (!val) { setFieldError(fieldId, 'Please enter CVV code.'); return false; }
                if (!isValidCVV(val)) { setFieldError(fieldId, 'Enter valid CVV (3 or 4 digits).'); return false; }
                break;
        }

        clearFieldError(fieldId);
        return true;
    }

    // Attach real-time validation listeners to all form inputs
    const allFieldIds = ['first-name', 'last-name', 'phone', 'alt-phone', 'address', 'apartment', 'landmark', 'city', 'zip', 'card-number', 'expiry', 'cvv'];
    allFieldIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('blur', () => validateField(id));
            el.addEventListener('input', () => {
                const parent = el.parentElement;
                if (parent && parent.querySelector('.field-error-msg')) {
                    validateField(id);
                }
            });
        }
    });

    // Form Handling
    const form = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const checkoutLayout = document.getElementById('checkout-layout');
    const checkoutSuccess = document.getElementById('checkout-success');

    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            clearAllFieldErrors();
            clearGlobalError();

            const cart = getCart();
            if (cart.length === 0) {
                alert('Your bag is empty! Please add items before checking out.');
                return;
            }

            // Auth Check: If not logged in, redirect to login page
            const currentUser = api.getUser();
            const currentToken = api.getToken();
            if (!currentUser || !currentToken) {
                window.location.href = 'login.html?redirect=checkout.html';
                return;
            }

            // Validate all fields in real time
            let isFormValid = true;
            let firstInvalidInput = null;

            allFieldIds.forEach(id => {
                const valid = validateField(id);
                if (!valid) {
                    isFormValid = false;
                    if (!firstInvalidInput) firstInvalidInput = document.getElementById(id);
                }
            });

            if (!isFormValid) {
                if (firstInvalidInput) {
                    firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstInvalidInput.focus();
                }
                return;
            }

            const firstName = document.getElementById('first-name')?.value.trim() || '';
            const lastName = document.getElementById('last-name')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';
            const altPhone = document.getElementById('alt-phone')?.value.trim() || '';
            const userEmail = currentUser?.email || api.getUser()?.email || '';

            const street = document.getElementById('address')?.value.trim() || '';
            const apartment = document.getElementById('apartment')?.value.trim() || '';
            const landmark = document.getElementById('landmark')?.value.trim() || '';
            const city = document.getElementById('city')?.value.trim() || '';
            const zip = document.getElementById('zip')?.value.trim() || '';
            const country = document.getElementById('country')?.value || 'South Africa';

            const cardNumber = document.getElementById('card-number')?.value.trim() || '';
            const expiry = document.getElementById('expiry')?.value.trim() || '';
            const cvv = document.getElementById('cvv')?.value.trim() || '';

            if (placeOrderBtn) {
                placeOrderBtn.textContent = 'Securing & Placing Order...';
                placeOrderBtn.disabled = true;
            }

            // Calculate totals
            let subtotal = 0;
            const items = cart.map(item => {
                const priceNum = item.priceNum || parsePrice(item.price);
                const qty = item.quantity || 1;
                subtotal += (priceNum * qty);
                return {
                    product: item.id || undefined,
                    name: item.name,
                    price: item.price,
                    priceNum,
                    quantity: qty,
                    image: item.image,
                    specs: item.specs || ''
                };
            });

            const totalAmount = subtotal;

            const fullStreetAddress = [street, apartment, landmark ? `(Landmark: ${landmark})` : ''].filter(Boolean).join(', ');

            const selectedMethod = getSelectedPaymentMethodName();
            const backendPaymentMethod = 'PayFast (Credit/Debit Card)';

            const orderPayload = {
                customer: {
                    name: `${firstName} ${lastName}`.trim(),
                    email: userEmail,
                    phone: altPhone ? `${phone} (Alt: ${altPhone})` : phone,
                    primaryPhone: phone,
                    altPhone: altPhone || ''
                },
                shippingAddress: {
                    street: fullStreetAddress,
                    address: street,
                    apartment: apartment || '',
                    building: apartment || '',
                    landmark: landmark || '',
                    city: city,
                    state: '',
                    zip: zip,
                    postalCode: zip,
                    country: 'South Africa'
                },
                items,
                subtotal,
                shippingFee: 0,
                paymentMethod: backendPaymentMethod
            };

            let generatedOrderNumber = `MJ-${Date.now().toString().slice(-6)}`;
            let backendOrderId = null;

            try {
                const res = await api.createOrder(orderPayload);
                if (res && res.data && res.data.order) {
                    if (res.data.order.orderNumber) generatedOrderNumber = res.data.order.orderNumber;
                    if (res.data.order._id) backendOrderId = res.data.order._id;
                }
            } catch (err) {
                console.warn('Order creation API notice:', err.message);
            }

            // Dual-Sync to Admin Panel Storage (maira_admin_orders & maira_admin_customers)
            try {
                const adminOrderObj = {
                    id: generatedOrderNumber,
                    _id: backendOrderId || generatedOrderNumber,
                    orderNumber: generatedOrderNumber,
                    customer: {
                        name: `${firstName} ${lastName}`.trim(),
                        email: userEmail,
                        phone: `${phone}${altPhone ? ` (Alt: ${altPhone})` : ''}`,
                        address: fullStreetAddress,
                        shippingAddress: fullStreetAddress
                    },
                    shippingAddress: fullStreetAddress,
                    items: items.map(i => ({ ...i, image: i.image || '' })),
                    subtotal,
                    total: totalAmount,
                    totalAmount,
                    paymentMethod: getSelectedPaymentMethodName(),
                    status: 'pending',
                    orderStatus: 'pending',
                    date: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                };

                // 1. Sync Orders to Admin Storage
                const currentAdminOrders = JSON.parse(localStorage.getItem('maira_admin_orders') || '[]');
                currentAdminOrders.unshift(adminOrderObj);
                localStorage.setItem('maira_admin_orders', JSON.stringify(currentAdminOrders));

                // 2. Sync Customer to Admin Storage
                const currentAdminCustomers = JSON.parse(localStorage.getItem('maira_admin_customers') || '[]');
                const existingCustIdx = currentAdminCustomers.findIndex(c => c.email && c.email.toLowerCase() === userEmail.toLowerCase());
                
                const custRecord = {
                    id: `CUST-${(currentUser?._id || currentUser?.id || Date.now()).toString().slice(-6).toUpperCase()}`,
                    name: `${firstName} ${lastName}`.trim(),
                    email: userEmail,
                    phone: phone,
                    address: fullStreetAddress,
                    createdAt: currentUser?.createdAt || new Date().toISOString()
                };

                if (existingCustIdx !== -1) {
                    currentAdminCustomers[existingCustIdx] = { ...currentAdminCustomers[existingCustIdx], ...custRecord };
                } else {
                    currentAdminCustomers.unshift(custRecord);
                }
                localStorage.setItem('maira_admin_customers', JSON.stringify(currentAdminCustomers));
            } catch (syncErr) {
                console.warn('[Admin Storage Sync Notice]', syncErr.message);
            }

            clearCart();
            if (checkoutLayout) checkoutLayout.style.display = 'none';
            if (checkoutSuccess) {
                const orderNumEl = checkoutSuccess.querySelector('.order-number, p strong, h3');
                if (orderNumEl) {
                    orderNumEl.textContent = `Order Reference: ${generatedOrderNumber}`;
                }

                const successTitle = document.getElementById('checkout-success-title') || checkoutSuccess.querySelector('.checkout-success__title');
                const successText = document.getElementById('checkout-success-text') || checkoutSuccess.querySelector('.checkout-success__text');
                if (successTitle) {
                    successTitle.textContent = 'Order Received — Pending Manual Payment';
                }
                if (successText) {
                    successText.innerHTML = `Your order reference <strong>#${generatedOrderNumber}</strong> has been recorded. Please click the button below to connect with our concierge team on WhatsApp and complete payment so our admin can confirm your order.`;
                }                const itemLines = items.map((item, idx) => {
                    const priceFormatted = formatPrice(item.priceNum * item.quantity);
                    let line = `• *${item.name}* (Qty: ${item.quantity}) - ${priceFormatted}`;
                    let imgUrl = item.image || '';
                    if (imgUrl && imgUrl.startsWith('http')) {
                        line += `\n  Photo: ${imgUrl}`;
                    }
                    return line;
                }).join('\n');

                const rawWaMessage = 
`*✨ MAIRA JEWELS - MANUAL PAYMENT REQUEST ✨*

*Order Reference:* #${generatedOrderNumber}
*Customer:* ${firstName} ${lastName}
*Email:* ${userEmail}
*Phone:* ${phone}${altPhone ? ` (Alt: ${altPhone})` : ''}
*Delivery Address:* ${fullStreetAddress}, ${city}, ${zip}

*📦 ORDERED ITEMS:*
${itemLines}

*💰 TOTAL ORDER AMOUNT:* ${formatPrice(totalAmount)}

Hi Maira Jewels! I placed this order and would like to complete manual payment via WhatsApp. Please send payment details!`;

                const waText = encodeURIComponent(rawWaMessage);
                const waUrl = `https://api.whatsapp.com/send?phone=27839228383&text=${waText}`;

                let waBtn = document.getElementById('checkout-wa-action-btn');
                if (!waBtn) {
                    waBtn = document.createElement('a');
                    waBtn.id = 'checkout-wa-action-btn';
                    waBtn.target = '_blank';
                    waBtn.rel = 'noopener noreferrer';
                    waBtn.style.cssText = 'display:inline-flex; align-items:center; justify-content:center; gap:8px; background:#25D366; color:#ffffff; font-weight:600; font-size:0.9rem; padding:12px 24px; border-radius:4px; text-decoration:none; margin-top:1.2rem; transition:all 0.2s ease; box-shadow:0 4px 12px rgba(37,211,102,0.3);';
                    waBtn.innerHTML = '💬 Complete Payment on WhatsApp';
                    const existingBtn = checkoutSuccess.querySelector('a.btn');
                    if (existingBtn) {
                        existingBtn.parentNode.insertBefore(waBtn, existingBtn);
                        existingBtn.style.marginLeft = '12px';
                    } else {
                        checkoutSuccess.appendChild(waBtn);
                    }
                }
                waBtn.href = waUrl;
                waBtn.style.display = 'inline-flex';

                checkoutSuccess.classList.add('visible');
                checkoutSuccess.style.display = 'block';
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
