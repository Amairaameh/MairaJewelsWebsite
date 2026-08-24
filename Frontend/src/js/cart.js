/* =============================================
   MairaJewels — Cart Page JS
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

    function saveCart(cart) {
        localStorage.setItem('maira_cart', JSON.stringify(cart));
    }

    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function formatPrice(val) {
        return 'R ' + val.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function renderCart() {
        const cart = getCart();
        const cartEmpty = document.getElementById('cart-empty');
        const cartLayout = document.getElementById('cart-layout');
        const cartItemsList = document.getElementById('cart-items-list');
        const cartItemCount = document.getElementById('cart-item-count');
        const cartCountBadge = document.getElementById('cart-count-badge');

        const summarySubtotal = document.getElementById('summary-subtotal');
        const summaryTotal = document.getElementById('summary-total');
        const summaryItemCount = document.getElementById('summary-item-count');

        const totalItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        if (cartCountBadge) cartCountBadge.textContent = totalItemsCount;
        if (cartItemCount) cartItemCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'}`;

        if (cart.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'block';
            if (cartLayout) cartLayout.style.display = 'none';
            return;
        }

        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartLayout) cartLayout.style.display = 'grid';

        if (cartItemsList) {
            cartItemsList.innerHTML = '';
            let subtotal = 0;

            cart.forEach((item, index) => {
                const itemPriceNum = parsePrice(item.price);
                const qty = item.quantity || 1;
                const lineTotal = itemPriceNum * qty;
                subtotal += lineTotal;

                const itemRow = document.createElement('div');
                itemRow.className = 'cart-item';
                const imgSrc = (item.image && item.image.trim()) ? item.image : 'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80';
                itemRow.innerHTML = `
                    <div class="cart-item__image">
                        <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80'">
                    </div>
                    <div class="cart-item__info">
                        <h3 class="cart-item__info__name">${item.name}</h3>
                        <p class="cart-item__info__meta">${item.specs || '18K Gold'}</p>
                    </div>
                    <div class="cart-item__qty">
                        <button class="qty-btn btn-minus" data-index="${index}">−</button>
                        <input class="qty-value" type="text" value="${qty}" readonly>
                        <button class="qty-btn btn-plus" data-index="${index}">+</button>
                    </div>
                    <div class="cart-item__price-remove">
                        <div class="cart-item__price">${formatPrice(lineTotal)}</div>
                        <button class="cart-item__remove btn-remove" data-index="${index}" title="Remove item" aria-label="Remove ${item.name}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                `;

                cartItemsList.appendChild(itemRow);
            });

            // Summary math — no tax, total = subtotal
            if (summarySubtotal) summarySubtotal.textContent = formatPrice(subtotal);
            if (summaryTotal) summaryTotal.textContent = formatPrice(subtotal);
            if (summaryItemCount) summaryItemCount.textContent = `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'items'}`;
        }

        // Attach event handlers
        document.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                const currentCart = getCart();
                if (currentCart[idx]) {
                    if (currentCart[idx].quantity > 1) {
                        currentCart[idx].quantity--;
                    } else {
                        currentCart.splice(idx, 1);
                    }
                    saveCart(currentCart);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                const currentCart = getCart();
                if (currentCart[idx]) {
                    currentCart[idx].quantity = (currentCart[idx].quantity || 1) + 1;
                    saveCart(currentCart);
                    renderCart();
                }
            });
        });

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                const currentCart = getCart();
                currentCart.splice(idx, 1);
                saveCart(currentCart);
                renderCart();
            });
        });
    }

    renderCart();

    // Checkout Navigation Listener
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const cart = getCart();
            if (cart.length === 0) return;
            
            const user = api.getUser();
            const token = api.getToken();
            if (!user || !token) {
                window.location.href = 'login.html?redirect=checkout.html';
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }

    // Promo Code — UI feedback only
    const promoApplyBtn = document.getElementById('promo-apply-btn');
    const promoInput = document.getElementById('promo-code');
    if (promoApplyBtn && promoInput) {
        promoApplyBtn.addEventListener('click', () => {
            const code = promoInput.value.trim();
            if (!code) return;
            // Show inline message
            let msg = document.getElementById('promo-msg');
            if (!msg) {
                msg = document.createElement('p');
                msg.id = 'promo-msg';
                msg.style.cssText = 'font-size:0.72rem;letter-spacing:0.06em;margin-top:0.5rem;color:#b44;';
                promoApplyBtn.parentElement.insertAdjacentElement('afterend', msg);
            }
            msg.textContent = `Code "${code}" is not valid or has expired.`;
            setTimeout(() => { if (msg) msg.textContent = ''; }, 4000);
        });
    }
})();
