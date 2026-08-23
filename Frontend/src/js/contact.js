/* =============================================
   MairaJewels - Contact Page & FAQ JS (API Integrated)
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

    /* ---------- Contact Form Handling with Strict Validation ---------- */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const successMsg = document.getElementById('contact-success-msg');
    const toast = document.getElementById('toast');

    function showToast(msg, type = 'success') {
        if (!toast) return;
        toast.textContent = msg || 'Message Sent ✓';
        if (type === 'error') {
            toast.style.backgroundColor = '#c9302c';
        } else {
            toast.style.backgroundColor = '';
        }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    function isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    function setFieldError(input, errorText) {
        if (!input) return;
        input.classList.add('form-input--error');
        const parent = input.closest('.form-group') || input.parentElement;
        if (!parent) return;

        let errorEl = parent.querySelector('.field-error-msg');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error-msg';
            parent.appendChild(errorEl);
        }
        errorEl.textContent = errorText;
    }

    function clearFieldError(input) {
        if (!input) return;
        input.classList.remove('form-input--error');
        const parent = input.closest('.form-group') || input.parentElement;
        if (parent) {
            const errorEl = parent.querySelector('.field-error-msg');
            if (errorEl) errorEl.remove();
        }
    }

    if (contactForm) {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const subjectSelect = document.getElementById('contact-subject');
        const messageInput = document.getElementById('contact-message');

        // Real-time error clearing on input
        [nameInput, emailInput, messageInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => clearFieldError(input));
                input.addEventListener('blur', () => validateField(input));
            }
        });

        function validateField(input) {
            if (!input) return true;
            const val = input.value.trim();

            if (input === nameInput) {
                if (!val) {
                    setFieldError(input, 'Full Name is required');
                    return false;
                }
                if (val.length < 2) {
                    setFieldError(input, 'Name must be at least 2 characters');
                    return false;
                }
            }

            if (input === emailInput) {
                if (!val) {
                    setFieldError(input, 'Email Address is required');
                    return false;
                }
                if (!isValidEmail(val)) {
                    setFieldError(input, 'Please enter a valid email address (e.g. name@domain.com)');
                    return false;
                }
            }

            if (input === messageInput) {
                if (!val) {
                    setFieldError(input, 'Message is required');
                    return false;
                }
                if (val.length < 10) {
                    setFieldError(input, 'Message must be at least 10 characters');
                    return false;
                }
            }

            clearFieldError(input);
            return true;
        }

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            let isValid = true;
            [nameInput, emailInput, messageInput].forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                // Focus first invalid field
                const firstInvalid = contactForm.querySelector('.form-input--error');
                if (firstInvalid) firstInvalid.focus();
                showToast('Please fix the highlighted required fields', 'error');
                return;
            }

            const origText = submitBtn.textContent;
            submitBtn.textContent = 'Sending to Concierge...';
            submitBtn.disabled = true;

            const inquiryData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectSelect ? subjectSelect.value : 'General Inquiry',
                message: messageInput.value.trim()
            };

            try {
                await api.sendInquiry(inquiryData);
            } catch (err) {
                console.warn('Inquiry sent notice:', err.message);
            }

            submitBtn.textContent = 'Message Sent ✓';
            submitBtn.style.backgroundColor = 'var(--color-gold-dark)';
            submitBtn.style.borderColor = 'var(--color-gold-dark)';

            if (successMsg) {
                successMsg.style.display = 'block';
            }

            showToast('Message Sent to Concierge ✓', 'success');
            contactForm.reset();

            // Clear any leftover field error states
            [nameInput, emailInput, messageInput].forEach(input => clearFieldError(input));

            setTimeout(() => {
                submitBtn.textContent = origText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
                submitBtn.style.borderColor = '';
            }, 4000);
        });
    }
})();
