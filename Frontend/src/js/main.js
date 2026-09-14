/* =============================================
   MairaJewels — Main JavaScript (API Integrated)
   Header scroll, cart, dynamic home grids, newsletter, FAQ & scroll reveal
   ============================================= */

import api from './api.js';
import { resolveCategory, isCategoryMatch, getCategoryCounts } from './categoryHelper.js';

// Preload critical data early for faster perceived performance
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        api.preloadCriticalData();
    });
} else {
    api.preloadCriticalData();
}

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

    /* ---------- Mobile Navigation & Drawer Toggle ---------- */
    function initMobileNav() {
        const mobileNavToggle = document.getElementById('mobileNavToggle');
        const mobileDrawer = document.getElementById('mobileDrawer');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const mobileDrawerClose = document.getElementById('mobileDrawerClose');

        function openMobileNav() {
            if (mobileDrawer) mobileDrawer.classList.add('is-open');
            if (mobileOverlay) mobileOverlay.classList.add('is-open');
            if (mobileNavToggle) mobileNavToggle.classList.add('is-active');
            document.body.style.overflow = 'hidden';
        }

        function closeMobileNav() {
            if (mobileDrawer) mobileDrawer.classList.remove('is-open');
            if (mobileOverlay) mobileOverlay.classList.remove('is-open');
            if (mobileNavToggle) mobileNavToggle.classList.remove('is-active');
            document.body.style.overflow = '';
        }

        if (mobileNavToggle) {
            mobileNavToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
                    closeMobileNav();
                } else {
                    openMobileNav();
                }
            });
        }

        if (mobileDrawerClose) {
            mobileDrawerClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMobileNav();
            });
        }

        if (mobileOverlay) {
            mobileOverlay.addEventListener('click', () => {
                closeMobileNav();
            });
        }

        if (mobileDrawer) {
            mobileDrawer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    closeMobileNav();
                });
            });
        }
    }

    initMobileNav();

    /* ---------- Card Click Navigation on Homepage ---------- */
    function bindCardNavigation() {
        const allCards = document.querySelectorAll('.diamond-card, .product-card');
        allCards.forEach(card => {
            // Do NOT bind product PDP navigation onto category cards!
            if (card.classList.contains('category-card') || card.closest('.category-card')) return;

            card.style.cursor = 'pointer';
            card.addEventListener('click', function (e) {
                if (e.target.closest('.add-to-cart') || e.target.closest('button')) return;
                const titleEl = card.querySelector('.diamond-card__title, .product-card__name');
                const priceEl = card.querySelector('.diamond-card__price, .product-card__price');
                const specsEl = card.querySelector('.diamond-card__specs, .product-card__type');
                const imgEl = card.querySelector('img');

                const name = titleEl ? titleEl.textContent.trim() : '';
                const price = priceEl ? priceEl.textContent.trim() : 'R 448.00';
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
                    const price = priceEl ? priceEl.textContent.trim() : 'R 448.00';
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

        // Render skeleton / initial loader with better UX
        gridContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding: 40px 0; color: var(--color-muted);">
                <div class="loading-spinner" style="display:inline-block; width:40px; height:40px; border:3px solid rgba(212,175,55,0.2); border-top:3px solid var(--color-gold); border-radius:50%; animation:spin 0.8s linear infinite;"></div>
                <p style="margin-top:1rem;">Loading collection...</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;

        try {
            // Add timeout for faster failure fallback
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 8000)
            );

            // Fetch both categories and products in parallel from live API with timeout
            const [catRes, prodRes] = await Promise.race([
                Promise.all([
                    api.getCategories().catch(() => ({ data: { categories: [] } })),
                    api.getProducts({ limit: 100 }).catch(() => ({ data: { products: [] } }))
                ]),
                timeoutPromise
            ]).catch(() => [{ data: { categories: [] } }, { data: { products: [] } }]);

            console.log('Products Response:', prodRes); // Debug log

            // Handle ALL possible response formats from API
            let allProducts = [];
            
            // Try different response structures
            if (Array.isArray(prodRes?.data?.products)) {
                allProducts = prodRes.data.products;
                console.log('Format: prodRes.data.products');
            } else if (Array.isArray(prodRes?.data?.data)) {
                allProducts = prodRes.data.data;
                console.log('Format: prodRes.data.data');
            } else if (Array.isArray(prodRes?.data)) {
                allProducts = prodRes.data;
                console.log('Format: prodRes.data');
            } else if (Array.isArray(prodRes?.products)) {
                allProducts = prodRes.products;
                console.log('Format: prodRes.products');
            } else if (Array.isArray(prodRes)) {
                allProducts = prodRes;
                console.log('Format: prodRes (array)');
            }

            console.log(`Loaded ${allProducts.length} products from API`); // Debug log
            if (allProducts.length > 0) {
                console.log('First product sample:', allProducts[0]);
            }

            let categoriesMasterList = [];

            if (catRes.data && Array.isArray(catRes.data.categories) && catRes.data.categories.length > 0) {
                categoriesMasterList = catRes.data.categories;
            }

            let categoriesNamesList = categoriesMasterList.map(c => typeof c === 'string' ? c : c.name).filter(Boolean);

            // Also include any categories found on active products so all available categories have pills
            allProducts.forEach(p => {
                const resolved = resolveCategory(p.category, categoriesMasterList);
                if (resolved.name && !categoriesNamesList.some(c => c.toLowerCase() === resolved.name.toLowerCase())) {
                    categoriesNamesList.push(resolved.name);
                }
            });

            let activeCategory = 'all';

            function renderProductsForCategory(category) {
                let filtered = allProducts;
                if (category !== 'all') {
                    filtered = allProducts.filter(p => isCategoryMatch(p.category, category, categoriesMasterList));
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

                // Show top matching products (e.g., up to 8 products for faster initial render)
                const itemsToDisplay = filtered.slice(0, 8);

                gridContainer.innerHTML = itemsToDisplay.map((p, index) => {
                    let priceStr = (typeof p.price === 'string' && (p.price.startsWith('$') || p.price.startsWith('R')))
                        ? (p.price.startsWith('$') ? 'R ' + p.price.slice(1).trim() : p.price)
                        : (p.priceNum ? `R ${p.priceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'R 448.00');
                    let imgSrc = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
                    if (imgSrc.startsWith('/uploads/')) {
                        imgSrc = 'https://maira-backend-mngd.onrender.com' + imgSrc;
                    }
                    const isOutOfStock = (p.inStock === false) ||
                                         (typeof p.stock === 'number' && p.stock <= 0) ||
                                         (typeof p.countInStock === 'number' && p.countInStock <= 0) ||
                                         (typeof p.stockQty === 'number' && p.stockQty <= 0);
                    
                    const resCat = resolveCategory(p.category, categoriesMasterList);
                    const specsStr = p.specs ? `${p.specs} · ${resCat.name}` : (resCat.name || `${p.metal || '18K Gold'}${p.gem ? ' • ' + p.gem : ''}`);
                    const badgeHtml = isOutOfStock
                        ? `<span class="product-card__badge product-card__badge--out-of-stock">OUT OF STOCK</span>`
                        : '';

                    // First 4 images load instantly (eager), rest load when scrolled (lazy)
                    const loadingStrategy = index < 4 ? 'eager' : 'lazy';
                    const fetchPriority = index < 4 ? 'high' : 'auto';

                    return `
                        <article class="diamond-card" data-id="${p._id || p.customId || ''}" data-out-of-stock="${isOutOfStock}">
                            <div class="diamond-card__image-wrapper">
                                ${badgeHtml}
                                <img src="${imgSrc}" 
                                     alt="${p.name}" 
                                     loading="${loadingStrategy}" 
                                     decoding="async"
                                     fetchpriority="${fetchPriority}"
                                     class="arch-img" 
                                     onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="diamond-card__details">
                                <h3 class="diamond-card__title">${p.name}</h3>
                                <div class="diamond-card__meta">
                                    <span class="diamond-card__specs">${specsStr}</span>
                                    ${(p.color || p.colour) ? `<div class="product-card__meta-line"><span class="product-card__meta-label">Colour:</span> ${p.color || p.colour}</div>` : ''}
                                    ${(p.sizes || p.availableSizes) ? `<div class="product-card__meta-line"><span class="product-card__meta-label">Sizes:</span> ${p.sizes || p.availableSizes}</div>` : ''}
                                    <span class="diamond-card__price">${priceStr}</span>
                                </div>
                            </div>
                        </article>
                    `;
                }).join('');

                bindCardNavigation();
            }

            // Render dynamic filter pills with product counts
            if (pillsContainer) {
                const catCounts = getCategoryCounts(allProducts, categoriesMasterList);
                let pillsHtml = `<button class="filter-pill filter-pill--active" data-cat="all">All design (${allProducts.length})</button>`;
                categoriesNamesList.forEach(catName => {
                    const count = catCounts[catName] || 0;
                    pillsHtml += `<button class="filter-pill" data-cat="${catName}">${catName} (${count})</button>`;
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

            // Also populate "Crafted to Perfection" Section dynamically (12 items initial, then load more)
            const craftedGrid = document.getElementById('crafted-perfection-grid');
            let craftedVisibleCount = 12;

            function renderCraftedSection() {
                if (!craftedGrid) return;
                if (allProducts.length > 0) {
                    const itemsToDisplay = allProducts.slice(0, craftedVisibleCount);
                    craftedGrid.innerHTML = itemsToDisplay.map((p, index) => {
                        let priceStr = (typeof p.price === 'string' && (p.price.startsWith('$') || p.price.startsWith('R')))
                            ? (p.price.startsWith('$') ? 'R ' + p.price.slice(1).trim() : p.price)
                            : (p.priceNum ? `R ${p.priceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'R 448.00');
                        let imgSrc = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';
                        if (imgSrc.startsWith('/uploads/')) {
                            imgSrc = 'https://maira-backend-mngd.onrender.com' + imgSrc;
                        }
                        const isOutOfStock = (p.inStock === false) ||
                                             (typeof p.stock === 'number' && p.stock <= 0) ||
                                             (typeof p.countInStock === 'number' && p.countInStock <= 0) ||
                                             (typeof p.stockQty === 'number' && p.stockQty <= 0);
                        
                        const resCat = resolveCategory(p.category, categoriesMasterList);
                        const specsStr = p.specs ? `${p.specs} · ${resCat.name}` : (resCat.name || `${p.metal || '18K Gold'}${p.gem ? ' • ' + p.gem : ''}`);
                        const badgeHtml = isOutOfStock
                            ? `<span class="product-card__badge product-card__badge--out-of-stock">OUT OF STOCK</span>`
                            : (p.badge ? `<span class="product-card__badge">${p.badge}</span>` : '');
                        const buttonHtml = isOutOfStock
                            ? `<button class="btn btn--small btn--primary add-to-cart" disabled style="opacity:0.55; cursor:not-allowed; background:#888;">Out of Stock</button>`
                            : `<button class="btn btn--small btn--primary add-to-cart">Add to Cart</button>`;

                        // First 8 images load instantly, rest lazy load
                        const loadingStrategy = index < 8 ? 'eager' : 'lazy';
                        const fetchPriority = index < 8 ? 'high' : 'auto';

                        return `
                            <article class="product-card" data-id="${p._id || p.customId}" data-out-of-stock="${isOutOfStock}">
                                <div class="product-card__image">
                                    <img src="${imgSrc}" 
                                         alt="${p.name}" 
                                         loading="${loadingStrategy}" 
                                         decoding="async"
                                         fetchpriority="${fetchPriority}"
                                         onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                                    ${badgeHtml}
                                </div>
                                <div class="product-card__body">
                                    <h3 class="product-card__name">${p.name}</h3>
                                    <p class="product-card__type">${specsStr}</p>
                                    <div class="product-card__footer">
                                        <span class="product-card__price">${priceStr}</span>
                                        ${buttonHtml}
                                    </div>
                                </div>
                            </article>
                        `;
                    }).join('');

                    let loadMoreCrafted = document.getElementById('crafted-load-more-container');
                    if (!loadMoreCrafted) {
                        loadMoreCrafted = document.createElement('div');
                        loadMoreCrafted.id = 'crafted-load-more-container';
                        loadMoreCrafted.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2.5rem 0 1rem 0; clear: both; width: 100%;';
                        if (craftedGrid.parentNode) {
                            craftedGrid.parentNode.insertBefore(loadMoreCrafted, craftedGrid.nextSibling);
                        }
                    }

                    if (craftedVisibleCount < allProducts.length) {
                        const remaining = allProducts.length - craftedVisibleCount;
                        loadMoreCrafted.innerHTML = `
                            <button class="btn btn--outline btn--load-more" id="crafted-load-more-btn" style="padding: 0.9rem 2.5rem; font-size: 0.9rem; letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase;">
                                View More (${remaining} Remaining) ↓
                            </button>
                        `;
                        const loadMoreBtn = document.getElementById('crafted-load-more-btn');
                        if (loadMoreBtn) {
                            loadMoreBtn.addEventListener('click', () => {
                                craftedVisibleCount += 12;
                                renderCraftedSection();
                            });
                        }
                    } else if (allProducts.length > 12) {
                        loadMoreCrafted.innerHTML = `<p style="font-size:0.85rem; color:var(--color-muted); font-style:italic;">Showing all ${allProducts.length} fine jewellery pieces</p>`;
                    } else {
                        loadMoreCrafted.innerHTML = '';
                    }

                    bindCardNavigation();
                } else {
                    craftedGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--color-muted); padding: 2rem 0;">No products found in collection.</p>';
                }
            }

            renderCraftedSection();

            // Load Dynamic Categories Slider with counts
            loadDynamicCategories(allProducts, categoriesMasterList);

        } catch (err) {
            console.warn('Load Men & Women Section error:', err.message);
        }
    }

    // Use requestIdleCallback or setTimeout to defer loading for better perceived performance
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadMenWomenSection(), { timeout: 1000 });
    } else {
        setTimeout(loadMenWomenSection, 0);
    }

    /* ---------- Load Dynamic Categories on Homepage Grids (with 3-Item Slider) ---------- */
    async function loadDynamicCategories(allProducts = [], categoriesMasterList = []) {
        const grid = document.getElementById('dynamic-categories-grid');
        const controls = document.getElementById('categories-slider-controls');
        const prevBtn = document.getElementById('cat-slider-prev');
        const nextBtn = document.getElementById('cat-slider-next');
        if (!grid) return;

        try {
            let categories = categoriesMasterList;
            if (!categories || categories.length === 0) {
                const res = await api.getCategories();
                categories = (res.data && res.data.categories) ? res.data.categories : [];
            }

            if (categories.length > 0) {
                const categoryCounts = getCategoryCounts(allProducts, categories);

                grid.innerHTML = categories.map(c => {
                    let imgSrc = c.image || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
                    if (imgSrc.startsWith('/uploads/')) {
                        imgSrc = 'https://api.mairajewels.co.za' + imgSrc;
                    }
                    const count = categoryCounts[c.name] || 0;
                    const descStr = c.description || (count ? `${count} Product${count === 1 ? '' : 's'}` : 'Explore our collection');
                    return `
                        <article class="diamond-card category-card" style="cursor: pointer;" data-catname="${c.name}">
                            <div class="diamond-card__image-wrapper">
                                <img src="${imgSrc}" alt="${c.name}" loading="lazy" class="arch-img" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="diamond-card__details">
                                <div style="display:flex; align-items:center; justify-content:space-between;">
                                    <h3 class="diamond-card__title">${c.name}</h3>
                                    ${count ? `<span style="font-size:0.75rem; background:rgba(212,175,55,0.15); color:var(--color-gold-dark); padding:2px 8px; border-radius:12px; font-weight:600;">${count} Products</span>` : ''}
                                </div>
                                <div class="diamond-card__meta" style="margin-top:4px;">
                                    <span class="diamond-card__specs">${descStr}</span>
                                </div>
                            </div>
                        </article>
                    `;
                }).join('');

                grid.querySelectorAll('.category-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const catName = card.dataset.catname;
                        if (catName) {
                            window.location.href = `collections.html?category=${encodeURIComponent(catName)}`;
                        }
                    });
                });

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

    // Defer non-critical category loading
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadDynamicCategories(), { timeout: 2000 });
    } else {
        setTimeout(loadDynamicCategories, 100);
    }

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
