/* =============================================
   MairaJewels — Checkout Page JS
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

    function clearCart() {
        localStorage.removeItem('maira_cart');
    }

    function parsePrice(priceStr) {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function formatPrice(val) {
        return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            if (subtotalEl) subtotalEl.textContent = '$0.00';
            if (totalEl) totalEl.textContent = '$0.00';
            return;
        }

        if (itemsList) {
            itemsList.innerHTML = '';
            let subtotal = 0;

            cart.forEach(item => {
                const itemPriceNum = parsePrice(item.price);
                const qty = item.quantity || 1;
                const lineTotal = itemPriceNum * qty;
                subtotal += lineTotal;

                const itemDiv = document.createElement('div');
                itemDiv.className = 'checkout-summary__item';
                const imgSrc = (item.image && item.image.trim()) ? item.image : 'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80';
                itemDiv.innerHTML = `
                    <div class="checkout-summary__item-img">
                        <img src="${imgSrc}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80'">
                    </div>
                    <div>
                        <h4 class="checkout-summary__item-name">${item.name}</h4>
                        <span class="checkout-summary__item-meta">Qty: ${qty}</span>
                    </div>
                    <div class="checkout-summary__item-price">${formatPrice(lineTotal)}</div>
                `;
                itemsList.appendChild(itemDiv);
            });

            const tax = subtotal * 0.08;
            const total = subtotal + tax;

            if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
            if (totalEl) totalEl.textContent = formatPrice(total);
        }
    }

    renderCheckoutSummary();

    // Form Handling
    const form = document.getElementById('checkout-form');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const checkoutLayout = document.getElementById('checkout-layout');
    const checkoutSuccess = document.getElementById('checkout-success');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const cart = getCart();
            if (cart.length === 0) {
                alert('Your bag is empty! Please add items before checking out.');
                return;
            }

            if (placeOrderBtn) {
                placeOrderBtn.textContent = 'Processing Order...';
                placeOrderBtn.disabled = true;
            }

            setTimeout(() => {
                clearCart();
                if (checkoutLayout) checkoutLayout.style.display = 'none';
                if (checkoutSuccess) checkoutSuccess.classList.add('visible');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 1200);
        });
    }

    // Input Formatting (Card Number & Expiry)
    const cardInput = document.getElementById('card-number');
    if (cardInput) {
        cardInput.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\D/g, '');
            val = val.substring(0, 16);
            let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
            e.target.value = formatted;
        });
    }

    const expiryInput = document.getElementById('expiry');
    if (expiryInput) {
        expiryInput.addEventListener('input', function (e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                e.target.value = val.substring(0, 2) + ' / ' + val.substring(2, 4);
            } else {
                e.target.value = val;
            }
        });
    }
})();
