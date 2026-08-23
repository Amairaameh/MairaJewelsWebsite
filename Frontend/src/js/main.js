/* =============================================
   MairaJewels — Main JavaScript (API Integrated)
   Header scroll, cart, dynamic home grids, newsletter, FAQ & scroll reveal
   ============================================= */

import api from './api.js';

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
    // Handled in auth.js via updateUserNav with luxury profile badge and dropdown

    function updateCartBadge() {
        const cartCountBadges = document.querySelectorAll('.cart-count, #cart-count-badge, .mobile-cart-count');
        const cart = getCart();
        const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCountBadges.forEach(badge => {
            badge.textContent = totalQty;
            badge.style.transform = 'scale(1.2)';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 300);
        });
    }

    updateCartBadge();

    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        cartLink.setAttribute('href', 'cart.html');
    }

    /* ---------- Card Click Navigation on Homepage ---------- */
    function bindCardNavigation() {
        const allCards = document.querySelectorAll('.diamond-card, .product-card');
        allCards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', function (e) {
                if (e.target.closest('.add-to-cart') || e.target.closest('button')) return;
                const titleEl = card.querySelector('.diamond-card__title, .product-card__name');
                const priceEl = card.querySelector('.diamond-card__price, .product-card__price');
                const specsEl = card.querySelector('.diamond-card__specs, .product-card__type');
                const imgEl = card.querySelector('img');

                const name = titleEl ? titleEl.textContent.trim() : '';
                const price = priceEl ? priceEl.textContent.trim() : '$448.00';
                const specs = specsEl ? specsEl.textContent.trim() : '';
                const image = imgEl ? (imgEl.getAttribute('src') || imgEl.src) : '';
                const id = card.dataset.id || '';

                if (name) {
                    const prod = { id, name, price, specs, image };
                    try {
                        localStorage.setItem('maira_selected_product', JSON.stringify(prod));
                    } catch (err) { }
                    window.location.href = id ? `product.html?id=${encodeURIComponent(id)}` : `product.html?name=${encodeURIComponent(name)}`;
                }
            });
        });

        /* ---------- Add to Cart Buttons on Cards ---------- */
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const card = btn.closest('.product-card, .diamond-card');
                if (card) {
                    const titleEl = card.querySelector('.diamond-card__title, .product-card__name');
                    const priceEl = card.querySelector('.diamond-card__price, .product-card__price');
                    const specsEl = card.querySelector('.diamond-card__specs, .product-card__type');
                    const imgEl = card.querySelector('img');

                    const name = titleEl ? titleEl.textContent.trim() : 'Fine Jewellery Piece';
                    const price = priceEl ? priceEl.textContent.trim() : '$448.00';
                    const image = imgEl ? (imgEl.getAttribute('src') || imgEl.src) : '';
                    const specs = specsEl ? specsEl.textContent.trim() : '18K Gold';
                    const id = card.dataset.id || '';

                    const cart = getCart();
                    const existing = cart.find(item => item.name === name);

                    if (existing) {
                        existing.quantity = (existing.quantity || 1) + 1;
                    } else {
                        cart.push({
                            id,
                            name,
                            price,
                            image,
                            specs,
                            quantity: 1
                        });
                    }

                    saveCart(cart);
                    updateCartBadge();

                    // Button feedback
                    const origText = btn.textContent;
                    btn.textContent = 'Added ✓';
                    btn.style.backgroundColor = 'var(--color-gold-dark)';
                    btn.style.borderColor = 'var(--color-gold-dark)';

                    setTimeout(function () {
                        btn.textContent = origText;
                        btn.style.backgroundColor = '';
                        btn.style.borderColor = '';
                    }, 1500);
                }
            });
        });
    }

    bindCardNavigation();

    /* ---------- Load Dynamic Categories & Filtered Products for Men & Women Section ---------- */
    async function loadMenWomenSection() {
        const pillsContainer = document.getElementById('men-women-filter-pills');
        const gridContainer = document.getElementById('men-women-products-grid');
        const viewCollectionBtn = document.getElementById('men-women-view-collection');

        if (!gridContainer) return;

        // Render skeleton / initial loader
        gridContainer.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px 0; color: var(--color-muted);"><p>Loading jewellery collection...</p></div>';

        try {
            // Fetch both categories and products in parallel from live API
            const [catRes, prodRes] = await Promise.all([
                api.getCategories().catch(() => ({ data: { categories: [] } })),
                api.getProducts({ limit: 100 }).catch(() => ({ data: { products: [] } }))
            ]);

            const allProducts = (prodRes.data && Array.isArray(prodRes.data.products)) ? prodRes.data.products : [];
            let categoriesList = [];

            if (catRes.data && Array.isArray(catRes.data.categories) && catRes.data.categories.length > 0) {
                categoriesList = catRes.data.categories.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);
            }

            // Also include any categories found on active products so all available categories have pills
            const productCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
            productCategories.forEach(cat => {
                if (!categoriesList.some(c => c.toLowerCase() === cat.toLowerCase())) {
                    categoriesList.push(cat);
                }
            });

            let activeCategory = 'all';

            function renderProductsForCategory(category) {
                let filtered = allProducts;
                if (category !== 'all') {
                    filtered = allProducts.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
                }

                if (viewCollectionBtn) {
                    if (category === 'all') {
                        viewCollectionBtn.textContent = `View Collection (${allProducts.length})`;
                        viewCollectionBtn.setAttribute('href', 'collections.html');
                    } else {
                        viewCollectionBtn.textContent = `View ${category} (${filtered.length})`;
                        viewCollectionBtn.setAttribute('href', `collections.html?category=${encodeURIComponent(category)}`);
                    }
                }

                if (filtered.length === 0) {
                    gridContainer.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; color: var(--color-muted); padding: 3rem 0;">
                            <p style="font-size: 1.05rem; margin-bottom: 0.5rem;">No products found in ${category === 'all' ? 'collection' : category}.</p>
                            <a href="collections.html" class="btn btn--small btn--primary" style="margin-top: 1rem; display: inline-block;">Browse All Collections</a>
                        </div>
                    `;
                    return;
                }

                // Show top matching products (e.g., up to 6 products for a balanced grid)
                const itemsToDisplay = filtered.slice(0, 6);

                gridContainer.innerHTML = itemsToDisplay.map(p => {
                    let priceStr = p.price || (p.priceNum ? `$${p.priceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$448.00');
                    let imgSrc = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
                    if (imgSrc.startsWith('/uploads/')) {
                        imgSrc = 'https://maira-backend-mngd.onrender.com' + imgSrc;
                    }
                    const specsStr = p.specs || `${p.metal || '18K Gold'}${p.gem ? ' • ' + p.gem : ''}`;

                    return `
                        <article class="diamond-card" data-id="${p._id || p.customId || ''}">
                            <div class="diamond-card__image-wrapper">
                                <img src="${imgSrc}" alt="${p.name}" loading="lazy" class="arch-img" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="diamond-card__details">
                                <h3 class="diamond-card__title">${p.name}</h3>
                                <div class="diamond-card__meta">
                                    <span class="diamond-card__specs">${specsStr}</span>
                                    <span class="diamond-card__price">${priceStr}</span>
                                </div>
                            </div>
                        </article>
                    `;
                }).join('');

                bindCardNavigation();
            }

            // Render dynamic filter pills
            if (pillsContainer) {
                let pillsHtml = `<button class="filter-pill filter-pill--active" data-cat="all">All design</button>`;
                categoriesList.forEach(catName => {
                    pillsHtml += `<button class="filter-pill" data-cat="${catName}">${catName}</button>`;
                });
                pillsContainer.innerHTML = pillsHtml;

                const pills = pillsContainer.querySelectorAll('.filter-pill');
                pills.forEach(pill => {
                    pill.addEventListener('click', () => {
                        pills.forEach(p => p.classList.remove('filter-pill--active'));
                        pill.classList.add('filter-pill--active');
                        activeCategory = pill.dataset.cat || 'all';
                        renderProductsForCategory(activeCategory);
                    });
                });
            }

            // Initial render with 'all'
            renderProductsForCategory('all');

            // Also populate "Crafted to Perfection" Section dynamically
            const craftedGrid = document.getElementById('crafted-perfection-grid');
            if (craftedGrid) {
                if (allProducts.length > 0) {
                    craftedGrid.innerHTML = allProducts.map(p => {
                        let priceStr = p.price || (p.priceNum ? `$${p.priceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$448.00');
                        let imgSrc = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';
                        if (imgSrc.startsWith('/uploads/')) {
                            imgSrc = 'https://maira-backend-mngd.onrender.com' + imgSrc;
                        }
                        const specsStr = p.specs || `${p.category || 'Fine Jewellery'} ${p.metal ? '· ' + p.metal : ''}`.trim();
                        const badgeHtml = p.badge ? `<span class="product-card__badge">${p.badge}</span>` : '';

                        return `
                            <article class="product-card" data-id="${p._id || p.customId}">
                                <div class="product-card__image">
                                    <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                                    ${badgeHtml}
                                </div>
                                <div class="product-card__body">
                                    <h3 class="product-card__name">${p.name}</h3>
                                    <p class="product-card__type">${specsStr}</p>
                                    <div class="product-card__footer">
                                        <span class="product-card__price">${priceStr}</span>
                                        <button class="btn btn--small btn--primary add-to-cart">Add to Cart</button>
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join('');
                } else {
                    craftedGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-muted); padding: 2rem 0;">No products found in collection.</p>';
                }
            }

            bindCardNavigation();

        } catch (err) {
            console.warn('Load Men & Women Section error:', err.message);
        }
    }

    loadMenWomenSection();

    /* ---------- Load Dynamic Categories on Homepage Grids (with 3-Item Slider) ---------- */
    async function loadDynamicCategories() {
        const grid = document.getElementById('dynamic-categories-grid');
        const controls = document.getElementById('categories-slider-controls');
        const prevBtn = document.getElementById('cat-slider-prev');
        const nextBtn = document.getElementById('cat-slider-next');
        if (!grid) return;

        try {
            const res = await api.getCategories();
            if (res.data && res.data.categories && res.data.categories.length > 0) {
                const categories = res.data.categories;
                grid.innerHTML = categories.map(c => {
                    let imgSrc = c.image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
                    if (imgSrc.startsWith('/uploads/')) {
                        imgSrc = 'https://maira-backend-mngd.onrender.com' + imgSrc;
                    }
                    const descStr = c.description || 'Explore our exclusive collection';
                    return `
                        <article class="diamond-card category-card" style="cursor: pointer;" onclick="window.location.href='collections.html?category=${encodeURIComponent(c.name)}'">
                            <div class="diamond-card__image-wrapper">
                                <img src="${imgSrc}" alt="${c.name}" loading="lazy" class="arch-img" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="diamond-card__details">
                                <h3 class="diamond-card__title">${c.name}</h3>
                                <div class="diamond-card__meta">
                                    <span class="diamond-card__specs">${descStr}</span>
                                </div>
                            </div>
                        </article>
                    `;
                }).join('');

                // If more than 3 categories, enable and initialize slider controls
                if (categories.length > 3 && controls) {
                    controls.style.display = 'inline-flex';

                    function getScrollAmount() {
                        const firstCard = grid.querySelector('.diamond-card');
                        if (firstCard) {
                            const gap = parseFloat(getComputedStyle(grid).gap) || 32;
                            return firstCard.offsetWidth + gap;
                        }
                        return grid.clientWidth / 3;
                    }

                    if (prevBtn) {
                        prevBtn.onclick = () => {
                            grid.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
                        };
                    }

                    if (nextBtn) {
                        nextBtn.onclick = () => {
                            grid.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
                        };
                    }

                    function updateArrowState() {
                        if (prevBtn) {
                            prevBtn.disabled = grid.scrollLeft <= 10;
                        }
                        if (nextBtn) {
                            const maxScroll = grid.scrollWidth - grid.clientWidth;
                            nextBtn.disabled = grid.scrollLeft >= maxScroll - 10;
                        }
                    }

                    grid.addEventListener('scroll', updateArrowState, { passive: true });
                    setTimeout(updateArrowState, 200);
                } else if (controls) {
                    controls.style.display = 'none';
                }
            } else {
                grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-muted);">No categories available.</p>';
                if (controls) controls.style.display = 'none';
            }
        } catch (err) {
            console.warn('API categories fetch:', err.message);
        }
    }

    loadDynamicCategories();

    /* ---------- Newsletter Form (API Integrated) ---------- */
    const newsletterForm = document.getElementById('newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const input = newsletterForm.querySelector('.newsletter__input');
            const btn = newsletterForm.querySelector('button[type="submit"]');
            const email = input.value.trim();
            if (!email) return;

            const originalText = btn.textContent;
            btn.textContent = 'Subscribing...';
            btn.disabled = true;

            try {
                await api.sendInquiry({
                    name: email.split('@')[0],
                    email,
                    subject: 'Maira Jewels Newsletter Subscription',
                    message: 'Subscribed to Maira Jewels Gazette from Homepage CTA.'
                });
            } catch (err) {
                console.warn('Newsletter subscription notice:', err.message);
            }

            btn.textContent = 'Subscribed ✓';
            btn.style.backgroundColor = 'var(--color-gold-dark)';
            btn.style.borderColor = 'var(--color-gold-dark)';
            input.value = '';
            input.placeholder = 'Thank you for joining!';

            setTimeout(function () {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.backgroundColor = '';
                btn.style.borderColor = '';
                input.placeholder = 'Enter your email address';
            }, 3000);
        });
    }

    /* ---------- FAQ Accordion & Live API Sync ---------- */
    function bindFaqEvents() {
        const faqQuestions = document.querySelectorAll('.faq-item__question');
        faqQuestions.forEach(btn => {
            btn.onclick = function (e) {
                e.preventDefault();
                const item = this.closest('.faq-item');
                if (!item) return;
                const isActive = item.classList.contains('active');

                // Close other open items for luxury accordion feel
                document.querySelectorAll('.faq-item.active').forEach(openItem => {
                    if (openItem !== item) {
                        openItem.classList.remove('active');
                        const qBtn = openItem.querySelector('.faq-item__question');
                        if (qBtn) qBtn.setAttribute('aria-expanded', 'false');
                    }
                });

                item.classList.toggle('active', !isActive);
                this.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
            };
        });
    }

    async function loadFaqs() {
        const faqList = document.querySelector('.faq__list');
        if (!faqList) return;

        try {
            const res = await api.getFaqs();
            let faqs = (res && res.data && (Array.isArray(res.data) ? res.data : res.data.faqs)) || [];

            // Filter strictly for published/approved FAQs (isApproved === true)
            faqs = faqs.filter(f => f.isApproved === true);

            if (faqs.length > 0) {
                faqList.innerHTML = faqs.map(faq => `
                    <div class="faq-item">
                        <button class="faq-item__question" aria-expanded="false">
                            <span>${faq.question}</span>
                            <span class="faq-item__icon" aria-hidden="true">+</span>
                        </button>
                        <div class="faq-item__answer">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                faqList.innerHTML = '<p style="text-align: center; color: var(--color-muted); padding: 2rem 0;">No published FAQs available.</p>';
            }
        } catch (e) {
            console.warn('API FAQ fetch:', e.message);
        }

        bindFaqEvents();
    }

    loadFaqs();

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
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        }
    );

    revealElements.forEach(function (el) {
        observer.observe(el);
    });
})();
