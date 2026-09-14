/* =============================================
   Maira Jewels - Collections Catalog Logic (100% Dynamic API)
   Complete Dynamic Filtering, Backend Sync & PDP Navigation
   ============================================= */

import api from './api.js';
import { resolveCategory, isCategoryMatch, getCategoryCounts } from './categoryHelper.js';

(function () {
    'use strict';

    // 100% Dynamic Items loaded directly from MongoDB API
    let liveCatalogItems = [];
    let loadedCategoriesList = [];

    // Filter states
    let activeCategory = 'all';
    let activeMetal = 'all';
    let activeGem = 'all';
    let activePriceRange = 'all';
    let activeSort = 'featured';
    let searchQuery = '';
    let visibleProductCount = 12;

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

    function updateCartBadge() {
        const badges = document.querySelectorAll('.cart-count, #cart-count-badge, .mobile-cart-count');
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badges.forEach(badge => {
            badge.textContent = totalItems;
        });
    }

    function showToast(msg) {
        let toast = document.getElementById('collections-toast') || document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'collections-toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg || 'Added to Bag ✓';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function parsePriceNum(val) {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        let s = String(val).trim();
        if (s.includes(',') && s.includes('.')) {
            s = s.replace(/,/g, '');
        } else if (s.includes(',')) {
            s = s.replace(',', '.');
        }
        const cleaned = s.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    /* ---------- Load Categories Dynamically from Backend API ---------- */
    async function loadCategoriesFromAPI() {
        try {
            const res = await api.getCategories();
            const pillsBar = document.querySelector('.category-pills-bar');
            if (res.data && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
                loadedCategoriesList = res.data.categories;
            } else {
                const distinct = [...new Set(liveCatalogItems.map(item => item.category).filter(Boolean))];
                loadedCategoriesList = distinct.map(c => typeof c === 'object' ? c : { name: String(c) });
            }

            if (pillsBar) {
                const categoryCounts = getCategoryCounts(liveCatalogItems, loadedCategoriesList);
                const totalAll = liveCatalogItems.length;

                // Render 100% dynamic categories (master backend list + active products)
                let categoriesToRender = loadedCategoriesList.map(c => typeof c === 'object' ? c.name : c).filter(Boolean);

                liveCatalogItems.forEach(item => {
                    const resolved = resolveCategory(item.category, loadedCategoriesList);
                    if (resolved.name && !categoriesToRender.some(c => c.toLowerCase() === resolved.name.toLowerCase())) {
                        categoriesToRender.push(resolved.name);
                    }
                });

                // Only show categories that have items in live inventory or exist in active backend database
                const activeCategories = categoriesToRender.filter(catName => {
                    const count = categoryCounts[catName] || 0;
                    return count > 0 || loadedCategoriesList.some(c => (typeof c === 'object' ? c.name : c).toLowerCase() === catName.toLowerCase());
                });

                const currentActive = activeCategory.toLowerCase();
                const isAllActive = currentActive === 'all' || currentActive === 'all jewellery';

                let pillsHtml = `<button class="cat-pill ${isAllActive ? 'cat-pill--active' : ''}" data-category="all">All Jewellery <span class="cat-count-badge">${totalAll}</span></button>`;
                activeCategories.forEach(catName => {
                    const count = categoryCounts[catName] || 0;
                    const isActive = isCategoryMatch(activeCategory, catName, loadedCategoriesList);
                    pillsHtml += `<button class="cat-pill ${isActive ? 'cat-pill--active' : ''}" data-category="${catName}">${catName} <span class="cat-count-badge">${count}</span></button>`;
                });
                pillsBar.innerHTML = pillsHtml;

                const pills = pillsBar.querySelectorAll('.cat-pill');
                pills.forEach(pill => {
                    pill.addEventListener('click', () => {
                        pills.forEach(p => p.classList.remove('cat-pill--active'));
                        pill.classList.add('cat-pill--active');
                        activeCategory = pill.dataset.category || 'all';
                        visibleProductCount = 15;

                        // Sync URL query state
                        const url = new URL(window.location.href);
                        if (activeCategory === 'all') {
                            url.searchParams.delete('category');
                        } else {
                            url.searchParams.set('category', activeCategory);
                        }
                        window.history.replaceState({}, '', url.toString());

                        renderCatalog();
                    });
                });
            }
        } catch (err) {
            console.warn('Category load API error:', err.message);
        }
    }

    /* ---------- Load Products Dynamically from Backend API ---------- */
    async function loadProductsFromAPI() {
        try {
            const res = await api.getProducts();
            console.log('Products API Response:', res); // Debug log
            
            // Handle ALL possible response formats from API
            let productsArray = [];
            
            if (Array.isArray(res?.data?.products)) {
                productsArray = res.data.products;
                console.log('Format: res.data.products');
            } else if (Array.isArray(res?.data?.data)) {
                productsArray = res.data.data;
                console.log('Format: res.data.data');
            } else if (Array.isArray(res?.data)) {
                productsArray = res.data;
                console.log('Format: res.data');
            } else if (Array.isArray(res?.products)) {
                productsArray = res.products;
                console.log('Format: res.products');
            } else if (Array.isArray(res)) {
                productsArray = res;
                console.log('Format: res (array)');
            }

            console.log(`Found ${productsArray.length} products`); // Debug log
            if (productsArray.length > 0) {
                console.log('First product:', productsArray[0]);
            }

            if (productsArray.length > 0) {
                liveCatalogItems = productsArray.map((p, index) => {
                    const priceNum = p.priceNum || parsePriceNum(p.price);
                    let priceFormatted = (typeof p.price === 'string' && (p.price.startsWith('$') || p.price.startsWith('R')))
                        ? (p.price.startsWith('$') ? 'R ' + p.price.slice(1).trim() : p.price)
                        : `R ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

                    let imgSrc = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';
                    if (imgSrc.startsWith('/uploads/')) {
                        imgSrc = 'https://api.mairajewels.co.za' + imgSrc;
                    }
                    const isOutOfStock = (p.inStock === false) ||
                                         (typeof p.stock === 'number' && p.stock <= 0) ||
                                         (typeof p.countInStock === 'number' && p.countInStock <= 0) ||
                                         (typeof p.stockQty === 'number' && p.stockQty <= 0);

                    return {
                        id: p._id || p.customId || `prod-${index}`,
                        mongoId: p._id || p.customId,
                        name: p.name,
                        price: priceFormatted,
                        priceNum: priceNum,
                        category: p.category || 'Jewellery',
                        metal: p.metal || '',
                        gem: p.gem || '',
                        badge: isOutOfStock ? 'OUT OF STOCK' : (p.badge || (p.featured ? 'FEATURED' : '')),
                        isOutOfStock: isOutOfStock,
                        inStock: p.inStock,
                        stock: p.stock,
                        image: imgSrc,
                        thumbs: [imgSrc],
                        description: p.description || '',
                        color: p.color || p.colour || '',
                        sizes: p.sizes || p.availableSizes || '',
                        specifications: p.specifications || p.specs || '',
                        specs: p.specs || p.specifications || ''
                    };
                });
            } else {
                console.warn('No products found in API response');
            }
        } catch (err) {
            console.warn('Backend API connection notice, using catalog view fallback:', err.message);
        }

        // First load categories, then parse URL params and render catalog
        await loadCategoriesFromAPI();
        parseURLParams();
        renderCatalog();
    }

    /* ---------- Parse URL Parameters ---------- */
    function parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('category') || urlParams.get('cat');
        const metal = urlParams.get('metal');
        const gem = urlParams.get('gem');
        const q = urlParams.get('search') || urlParams.get('q');

        if (cat) {
            activeCategory = cat;
        }

        if (metal) activeMetal = metal;
        if (gem) activeGem = gem;
        if (q) searchQuery = q;
    }

    /* ---------- Render Products Grid ---------- */
    function renderCatalog() {
        const grid = document.getElementById('catalog-grid');
        const resultsCount = document.getElementById('results-count');
        if (!grid) return;

        let filtered = liveCatalogItems.filter(item => {
            if (activeCategory && activeCategory !== 'all') {
                if (!isCategoryMatch(item.category, activeCategory, loadedCategoriesList)) {
                    return false;
                }
            }

            if (activeMetal && activeMetal !== 'all' && activeMetal !== 'all-metals') {
                if (!item.metal.toLowerCase().includes(activeMetal.toLowerCase())) return false;
            }

            if (activeGem && activeGem !== 'all') {
                if (!item.gem.toLowerCase().includes(activeGem.toLowerCase())) return false;
            }

            if (activePriceRange && activePriceRange !== 'all') {
                const p = item.priceNum;
                if (activePriceRange === 'under-500' && p >= 500) return false;
                if (activePriceRange === '500-2000' && (p < 500 || p > 2000)) return false;
                if (activePriceRange === '2000-5000' && (p < 2000 || p > 5000)) return false;
                if (activePriceRange === 'above-5000' && p <= 5000) return false;
            }

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchSpecs = (item.specs || '').toLowerCase().includes(q);
                const matchCat = (item.category || '').toLowerCase().includes(q);
                const matchColor = (item.color || '').toLowerCase().includes(q);
                const matchSizes = (item.sizes || '').toLowerCase().includes(q);
                if (!matchName && !matchSpecs && !matchCat && !matchColor && !matchSizes) return false;
            }

            return true;
        });

        // Sorting
        if (activeSort === 'price-low' || activeSort === 'price-asc') {
            filtered.sort((a, b) => a.priceNum - b.priceNum);
        } else if (activeSort === 'price-high' || activeSort === 'price-desc') {
            filtered.sort((a, b) => b.priceNum - a.priceNum);
        } else if (activeSort === 'newest') {
            filtered.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
        }

        if (resultsCount) {
            const showingCount = Math.min(visibleProductCount, filtered.length);
            resultsCount.textContent = `Showing ${showingCount} of ${filtered.length} piece${filtered.length === 1 ? '' : 's'}`;
        }

        grid.innerHTML = '';

        let loadMoreContainer = document.getElementById('catalog-load-more-container');
        if (!loadMoreContainer) {
            loadMoreContainer = document.createElement('div');
            loadMoreContainer.id = 'catalog-load-more-container';
            loadMoreContainer.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2.5rem 0 1rem 0; clear: both; width: 100%;';
            if (grid.parentNode) {
                grid.parentNode.insertBefore(loadMoreContainer, grid.nextSibling);
            }
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="no-results" style="grid-column: 1/-1; text-align:center; padding: 60px 0;">
                    <p style="font-size: 1.1rem; color: var(--color-muted);">No fine jewellery pieces found in this view.</p>
                    <button class="btn btn--outline" id="clear-all-filters-btn" style="margin-top: 16px;">Reset All Filters</button>
                </div>
            `;
            const clearBtn = document.getElementById('clear-all-filters-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', resetAllFilters);
            }
            loadMoreContainer.innerHTML = '';
            return;
        }

        const displayedItems = filtered.slice(0, visibleProductCount);

        displayedItems.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.style.cursor = 'pointer';

            const resolvedCatName = resolveCategory(item.category, loadedCategoriesList).name;

            const badgeHtml = item.isOutOfStock
                ? `<span class="product-card__badge product-card__badge--out-of-stock">OUT OF STOCK</span>`
                : (item.badge ? `<span class="product-card__badge">${item.badge}</span>` : '');

            const buttonHtml = item.isOutOfStock
                ? `<button class="btn btn--small btn--outline add-to-cart-btn" disabled style="opacity:0.55; cursor:not-allowed; border-color:var(--color-border); color:var(--color-muted);">Out of Stock</button>`
                : `<button class="btn btn--small btn--outline add-to-cart-btn" data-id="${item.id}" aria-label="Add to Bag">Add to Bag</button>`;

            // Eager load first 6 images for instant display, lazy load rest
            const loadingStrategy = index < 6 ? 'eager' : 'lazy';
            const fetchPriority = index < 6 ? 'high' : 'low';

            card.innerHTML = `
                <div class="product-card__image">
                    ${badgeHtml}
                    <img src="${item.image}" 
                         alt="${item.name}" 
                         loading="${loadingStrategy}" 
                         decoding="async"
                         fetchpriority="${fetchPriority}"
                         onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="product-card__body">
                    <h3 class="product-card__name">${item.name}</h3>
                    <p class="product-card__type">${item.specs ? `${item.specs} · ${resolvedCatName}` : resolvedCatName}</p>
                    ${item.color ? `<p class="product-card__meta-line"><span class="product-card__meta-label">Colour:</span> ${item.color}</p>` : ''}
                    ${item.sizes ? `<p class="product-card__meta-line"><span class="product-card__meta-label">Sizes:</span> ${item.sizes}</p>` : ''}
                    <div class="product-card__footer">
                        <span class="product-card__price">${item.price}</span>
                        ${buttonHtml}
                    </div>
                </div>
            `;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                const prodData = {
                    id: item.mongoId || item.id,
                    name: item.name,
                    price: item.price,
                    priceNum: item.priceNum,
                    category: item.category,
                    isOutOfStock: item.isOutOfStock,
                    inStock: item.inStock,
                    stock: item.stock,
                    image: item.image,
                    thumbs: item.thumbs,
                    description: item.description,
                    color: item.color,
                    sizes: item.sizes,
                    specifications: item.specifications || item.specs || '',
                    specs: item.specs || item.specifications || ''
                };
                try {
                    localStorage.setItem('maira_selected_product', JSON.stringify(prodData));
                } catch (err) {}
                window.location.href = `product.html?id=${encodeURIComponent(item.mongoId || item.id)}`;
            });

            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (item.isOutOfStock) {
                        showToast(`Sorry, ${item.name} is currently out of stock.`);
                        return;
                    }
                    const cart = getCart();
                    const existing = cart.find(ci => ci.name === item.name);
                    if (existing) {
                        existing.quantity = (existing.quantity || 1) + 1;
                    } else {
                        cart.push({
                            id: item.mongoId || item.id,
                            name: item.name,
                            price: item.price,
                            priceNum: item.priceNum,
                            image: item.image,
                            specs: item.specs,
                            quantity: 1
                        });
                    }
                    saveCart(cart);
                    updateCartBadge();
                    showToast(`${item.name} added to Bag ✓`);
                });
            }

            grid.appendChild(card);
        });

        if (visibleProductCount < filtered.length) {
            const remaining = filtered.length - visibleProductCount;
            loadMoreContainer.innerHTML = `
                <button class="btn btn--outline btn--load-more" id="load-more-products-btn" style="padding: 0.9rem 2.5rem; font-size: 0.9rem; letter-spacing: 0.08em; font-weight: 600; text-transform: uppercase;">
                    View More (${remaining} Remaining) ↓
                </button>
            `;
            const loadMoreBtn = document.getElementById('load-more-products-btn');
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    visibleProductCount += 12;
                    renderCatalog();
                });
            }
        } else if (filtered.length > 12) {
            loadMoreContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--color-muted); font-style:italic;">You've viewed all ${filtered.length} fine jewellery pieces</p>`;
        } else {
            loadMoreContainer.innerHTML = '';
        }
    }

    function resetAllFilters() {
        activeCategory = 'all';
        activeMetal = 'all';
        activeGem = 'all';
        activePriceRange = 'all';
        searchQuery = '';
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.toggle('cat-pill--active', p.dataset.category === 'all'));

        const priceAll = document.querySelector('input[name="price-range"][value="all"]');
        if (priceAll) priceAll.checked = true;

        document.querySelectorAll('.filter-metal-check').forEach(cb => {
            cb.checked = (cb.value === 'all-metals');
        });

        document.querySelectorAll('.filter-gem-check').forEach(cb => {
            cb.checked = true;
        });

        renderCatalog();
    }

    function initFilterControls() {
        // Price Radios
        const priceRadios = document.querySelectorAll('input[name="price-range"]');
        priceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    activePriceRange = e.target.value;
                    renderCatalog();
                }
            });
        });

        // Metal Checkboxes
        const metalChecks = document.querySelectorAll('.filter-metal-check');
        metalChecks.forEach(cb => {
            cb.addEventListener('change', () => {
                if (cb.value === 'all-metals' && cb.checked) {
                    metalChecks.forEach(c => { if (c.value !== 'all-metals') c.checked = false; });
                    activeMetal = 'all';
                } else if (cb.checked) {
                    const allM = document.querySelector('.filter-metal-check[value="all-metals"]');
                    if (allM) allM.checked = false;
                    activeMetal = cb.value;
                } else {
                    const anyChecked = Array.from(metalChecks).some(c => c.checked);
                    if (!anyChecked) {
                        const allM = document.querySelector('.filter-metal-check[value="all-metals"]');
                        if (allM) allM.checked = true;
                        activeMetal = 'all';
                    }
                }
                renderCatalog();
            });
        });

        // Gemstone Checkboxes
        const gemChecks = document.querySelectorAll('.filter-gem-check');
        gemChecks.forEach(cb => {
            cb.addEventListener('change', () => {
                const checkedGems = Array.from(gemChecks).filter(c => c.checked).map(c => c.value);
                if (checkedGems.length === 0 || checkedGems.length === gemChecks.length) {
                    activeGem = 'all';
                } else {
                    activeGem = checkedGems[0];
                }
                renderCatalog();
            });
        });

        // Sort Select
        const sortSelect = document.getElementById('sort-select') || document.getElementById('filter-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                activeSort = e.target.value;
                renderCatalog();
            });
        }

        // Reset Filters button
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAllFilters);
        }

        // Mobile Filter Toggle
        const mobileFilterToggle = document.getElementById('mobileFilterToggle');
        const sidebar = document.querySelector('.collections-sidebar');
        if (mobileFilterToggle && sidebar) {
            mobileFilterToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        parseURLParams();
        initFilterControls();
        updateCartBadge();
        loadProductsFromAPI();
    });
})();
