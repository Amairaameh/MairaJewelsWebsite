/* =============================================
   MairaJewels — Main JavaScript
   Header scroll, cart, newsletter, FAQ & scroll reveal
   ============================================= */

(function () {
    'use strict';

    /* ---------- Header Scroll Effect ---------- */
    const header = document.getElementById('header');

    function handleScroll() {
        if (!header) return;
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    /* ---------- Smooth Scroll for Anchor Links ---------- */
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length <= 1) {
                e.preventDefault();
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* ---------- Cart Storage & Counter ---------- */
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

    /* ---------- User Session Check ---------- */
    function updateUserState() {
        try {
            const user = JSON.parse(localStorage.getItem('maira_user'));
            const navLoginText = document.getElementById('nav-login-text');
            if (user && user.name && navLoginText) {
                navLoginText.textContent = user.name.split(' ')[0].toUpperCase();
            }
        } catch (e) {}
    }
    updateUserState();

    const cartCount = document.querySelector('.cart-count');
    const cartLink = document.querySelector('.cart-link');

    function updateCartBadge() {
        if (cartCount) {
            const cart = getCart();
            const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            cartCount.textContent = totalQty;
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(function () {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }

    updateCartBadge();

    if (cartLink) {
        cartLink.setAttribute('href', '/cart.html');
    }

    /* ---------- Add to Cart Buttons on Cards ---------- */
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    addToCartButtons.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation(); // prevent card click navigation
            const card = btn.closest('.product-card, .diamond-card');
            if (card) {
                const titleEl = card.querySelector('.diamond-card__title, .product-card__name');
                const priceEl = card.querySelector('.diamond-card__price, .product-card__price');
                const imgEl = card.querySelector('img');
                const specsEl = card.querySelector('.diamond-card__specs, .product-card__type');

                const productObj = {
                    name: titleEl ? titleEl.textContent.trim() : 'Fine Jewelry Piece',
                    price: priceEl ? priceEl.textContent.trim() : '$0.00',
                    image: imgEl ? imgEl.src : '',
                    specs: specsEl ? specsEl.textContent.trim() : '18K Gold',
                    quantity: 1
                };

                const cart = getCart();
                const existingIdx = cart.findIndex(item => item.name === productObj.name);
                if (existingIdx > -1) {
                    cart[existingIdx].quantity = (cart[existingIdx].quantity || 1) + 1;
                } else {
                    cart.push(productObj);
                }
                saveCart(cart);
                updateCartBadge();

                const originalText = btn.textContent;
                btn.textContent = 'Added \u2713';
                btn.style.backgroundColor = 'var(--color-gold-dark)';
                btn.style.borderColor = 'var(--color-gold-dark)';

                setTimeout(function () {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.borderColor = '';
                }, 1500);
            }
        });
    });

    /* ---------- Product Navigation on Card Click ---------- */
    const allProductCards = document.querySelectorAll('.diamond-card, .product-card');

    allProductCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) return;

            const titleEl = card.querySelector('.diamond-card__title, .product-card__name');
            const priceEl = card.querySelector('.diamond-card__price, .product-card__price');
            const imgEl = card.querySelector('img');
            const specsEl = card.querySelector('.diamond-card__specs, .product-card__type');

            if (titleEl && priceEl && imgEl) {
                const selectedProduct = {
                    name: titleEl.textContent.trim(),
                    price: priceEl.textContent.trim(),
                    image: imgEl.src,
                    specs: specsEl ? specsEl.textContent.trim() : '18K Gold',
                    category: card.closest('section')?.querySelector('.diamond-title, .section-title')?.textContent.trim() || 'Collections',
                    thumbs: [
                        imgEl.src,
                        'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80',
                        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
                    ]
                };

                localStorage.setItem('maira_selected_product', JSON.stringify(selectedProduct));
                window.location.href = '/product.html';
            }
        });
    });

    /* ---------- Newsletter Form ---------- */
    const newsletterForm = document.getElementById('newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const input = newsletterForm.querySelector('.newsletter__input');
            const btn = newsletterForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            btn.textContent = 'Subscribed \u2713';
            btn.style.backgroundColor = 'var(--color-gold-dark)';
            btn.style.borderColor = 'var(--color-gold-dark)';
            input.value = '';
            input.placeholder = 'Thank you for joining!';

            setTimeout(function () {
                btn.textContent = originalText;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                input.placeholder = 'Enter your email address';
            }, 3000);
        });
    }

    /* ---------- FAQ Accordion ---------- */
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
                    if (otherBtn) {
                        otherBtn.setAttribute('aria-expanded', 'false');
                    }
                }
            });

            if (isActive) {
                item.classList.remove('active');
                question.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---------- Scroll Reveal Animations ---------- */
    const revealElements = document.querySelectorAll(
        '.product-card, .diamond-card, .journal-card, .about__content, .section-head, .newsletter__inner, .faq__list'
    );

    revealElements.forEach(function (el) {
        el.classList.add('reveal');
    });

    const observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    revealElements.forEach(function (el) {
        observer.observe(el);
    });

    /* ---------- Hero Text Carousel ---------- */
    const heroSlides = [
        {
            eyebrow: 'Welcome',
            title: 'Luxury That Speaks<br><em>Your Style</em>',
            text: 'Welcome to Maira Jewels, where timeless elegance meets modern craftsmanship. Every piece is thoughtfully designed to add confidence, beauty, and sophistication to your everyday look, making luxury accessible for every occasion.',
            btn1: 'Shop Collection',
            btn2: '',
            stats: [
                { val: '25+', label: 'Years of Craft' },
                { val: '12k', label: 'Happy Clients' },
                { val: '100%', label: 'Ethically Sourced' }
            ]
        },
        {
            eyebrow: 'Quality & Craftsmanship',
            title: 'Made to Shine.<br><em>Built to Last.</em>',
            text: 'Crafted with premium 316L stainless steel and finished with luxurious 18K gold plating, our jewellery is waterproof, tarnish-free, and hypoallergenic. Designed for everyday wear, every piece keeps its brilliance without fading or losing its charm.',
            btn1: 'Explore Collection',
            btn2: '',
            stats: [
                { val: '25+', label: 'Years of Craft' },
                { val: '12k', label: 'Happy Clients' },
                { val: '100%', label: 'Ethically Sourced' }
            ]
        },
        {
            eyebrow: 'Brand Promise',
            title: 'Affordable Luxury<br><em>for Every Moment</em>',
            text: 'Whether you\'re dressing for work, celebrating a special occasion, or simply elevating your everyday style, Maira Jewels offers beautifully crafted designs that combine exceptional quality, lasting comfort, and timeless elegance—all at prices you\'ll love.',
            btn1: 'Discover More',
            btn2: '',
            stats: [
                { val: '25+', label: 'Years of Craft' },
                { val: '12k', label: 'Happy Clients' },
                { val: '100%', label: 'Ethically Sourced' }
            ]
        }
    ];

    let currentSlide = 0;
    const heroEyebrow = document.getElementById('hero-eyebrow');
    const heroTitle = document.getElementById('hero-title');
    const heroText = document.getElementById('hero-text');
    const heroBtn1 = document.getElementById('hero-btn1');
    const heroBtn2 = document.getElementById('hero-btn2');
    const heroActions = document.getElementById('hero-actions');
    const heroMeta = document.getElementById('hero-meta');

    const stat1Val = document.getElementById('hero-stat1-value');
    const stat1Lab = document.getElementById('hero-stat1-label');
    const stat2Val = document.getElementById('hero-stat2-value');
    const stat2Lab = document.getElementById('hero-stat2-label');
    const stat3Val = document.getElementById('hero-stat3-value');
    const stat3Lab = document.getElementById('hero-stat3-label');

    const animatedElements = [heroEyebrow, heroTitle, heroText, heroActions, heroMeta];

    function updateHeroSlide() {
        if (!heroEyebrow) return;

        animatedElements.forEach(function (el) {
            if (el) el.style.animation = 'fadeRightOut 0.5s ease forwards';
        });

        setTimeout(function () {
            currentSlide = (currentSlide + 1) % heroSlides.length;
            const slide = heroSlides[currentSlide];

            animatedElements.forEach(function (el) {
                if (el) el.style.animation = 'none';
            });

            setTimeout(function () {
                if (heroEyebrow) heroEyebrow.innerHTML = slide.eyebrow;
                if (heroTitle) heroTitle.innerHTML = slide.title;
                if (heroText) heroText.innerHTML = slide.text;
                if (heroBtn1) heroBtn1.innerHTML = slide.btn1;

                if (heroBtn2) {
                    if (slide.btn2) {
                        heroBtn2.innerHTML = slide.btn2;
                        heroBtn2.style.display = 'inline-flex';
                    } else {
                        heroBtn2.style.display = 'none';
                    }
                }

                if (stat1Val) stat1Val.innerHTML = slide.stats[0].val;
                if (stat1Lab) stat1Lab.innerHTML = slide.stats[0].label;
                if (stat2Val) stat2Val.innerHTML = slide.stats[1].val;
                if (stat2Lab) stat2Lab.innerHTML = slide.stats[1].label;
                if (stat3Val) stat3Val.innerHTML = slide.stats[2].val;
                if (stat3Lab) stat3Lab.innerHTML = slide.stats[2].label;

                animatedElements.forEach(function (el) {
                    if (el) el.style.animation = '';
                });
            }, 50);
        }, 500);
    }

    if (heroEyebrow) {
        setInterval(updateHeroSlide, 5000);
    }

})();
