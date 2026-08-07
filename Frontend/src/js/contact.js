/* =============================================
   MairaJewels — Contact Page & FAQ JS
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

    function updateCartBadge() {
        const badge = document.getElementById('cart-count-badge');
        if (!badge) return;
        const cart = getCart();
        const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = totalQty;
    }

    updateCartBadge();

    /* ---------- FAQ Accordion Logic ---------- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        const question = item.querySelector('.faq-item__question');
        if (!question) return;

        question.addEventListener('click', function () {
            const isActive = item.classList.contains('active');

            faqItems.forEach(function (otherItem) {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherBtn = otherItem.querySelector('.faq-item__question');
                    const icon = otherItem.querySelector('.faq-item__icon');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (icon) icon.textContent = '+';
                }
            });

            const currentIcon = item.querySelector('.faq-item__icon');
            if (isActive) {
                item.classList.remove('active');
                question.setAttribute('aria-expanded', 'false');
                if (currentIcon) currentIcon.textContent = '+';
            } else {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                if (currentIcon) currentIcon.textContent = '−';
            }
        });
    });

    /* ---------- Contact Form Handling ---------- */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const successMsg = document.getElementById('contact-success-msg');
    const toast = document.getElementById('toast');

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg || 'Message Sent ✓';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const messageInput = document.getElementById('contact-message');

            if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
                alert('Please fill in all required fields (*)');
                return;
            }

            const origText = submitBtn.textContent;
            submitBtn.textContent = 'Sending Message...';
            submitBtn.disabled = true;

            setTimeout(() => {
                submitBtn.textContent = 'Message Sent ✓';
                submitBtn.style.backgroundColor = 'var(--color-gold-dark)';
                submitBtn.style.borderColor = 'var(--color-gold-dark)';

                if (successMsg) {
                    successMsg.style.display = 'block';
                }

                showToast('Message Sent ✓');

                contactForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = origText;
                    submitBtn.style.backgroundColor = '';
                    submitBtn.style.borderColor = '';
                    submitBtn.disabled = false;
                }, 3000);
            }, 800);
        });
    }

})();
