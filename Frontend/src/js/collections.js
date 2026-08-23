/* =============================================
   Maira Jewels - Collections Catalog Logic (100% Dynamic API)
   Complete Dynamic Filtering, Backend Sync & PDP Navigation
   ============================================= */

import api from './api.js';

(function () {
    'use strict';

    // 100% Dynamic Items loaded directly from MongoDB API
    let liveCatalogItems = [];

    // Filter states
    let activeCategory = 'all';
    let activeMetal = 'all';
    let activeGem = 'all';
    let activePriceRange = 'all';
    let activeSort = 'featured';
    let searchQuery = '';

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
        const cleaned = String(val).replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    /* ---------- Load Categories Dynamically from Backend API ---------- */
    async function loadCategoriesFromAPI() {
        try {
            const res = await api.getCategories();
            const pillsBar = document.querySelector('.category-pills-bar');
            if (pillsBar) {
                let categories = [];
                if (res.data && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
                    categories = res.data.categories.map(c => c.name);
                } else {
                    // Fallback to distinct categories present in live products
                    categories = [...new Set(liveCatalogItems.map(item => item.category).filter(Boolean))];
                }

                if (categories.length > 0) {
                    const currentActive = activeCategory.toLowerCase();
                    let html = `<button class="cat-pill ${currentActive === 'all' ? 'cat-pill--active' : ''}" data-category="all">All Jewellery</button>`;
                    categories.forEach(catName => {
                        const isActive = currentActive === catName.toLowerCase();
                        html += `<button class="cat-pill ${isActive ? 'cat-pill--active' : ''}" data-category="${catName}">${catName}</button>`;
                    });
                    pillsBar.innerHTML = html;

                    pillsBar.querySelectorAll('.cat-pill').forEach(pill => {
                        pill.addEventListener('click', () => {
                            pillsBar.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('cat-pill--active'));
                            pill.classList.add('cat-pill--active');
                            activeCategory = pill.dataset.category || 'all';
                            renderCatalog();
                        });
                    });
                }
            }
        } catch (err) {
            console.warn('API getCategories error:', err.message);
        }
    }

    /* ---------- Load Products Dynamically from Backend API ---------- */
    async function loadProductsFromAPI() {
        const grid = document.getElementById('catalog-grid');
        const resultsCount = document.getElementById('results-count');

        if (grid) {
            grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 60px 0; color: var(--color-muted);"><p style="font-size: 1.1rem;">Loading fine jewellery collection...</p></div>';
        }

        try {
            const res = await api.getProducts({ limit: 200 });
            if (res.data && Array.isArray(res.data.products)) {
                liveCatalogItems = res.data.products.map(p => {
                    const priceFormatted = (typeof p.price === 'string' && p.price.startsWith('$'))
                        ? p.price
                        : `$${(p.priceNum || parsePriceNum(p.price) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                    
                    const priceNumber = p.priceNum || parsePriceNum(p.price) || 0;
                    const primaryImg = p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80';
                    const allThumbs = (p.images && p.images.length > 0) ? p.images : (p.thumbs || [primaryImg]);

                    return {
                        id: p._id || p.customId,
                        mongoId: p._id,
                        name: p.name,
                        category: p.category || 'Fine Jewellery',
                        price: priceFormatted,
                        priceNum: priceNumber,
                        metal: p.metal || '18K Gold',
                        gem: p.gem || 'Diamond',
                        specs: p.specs || `${p.metal || ''} ${p.gem ? '• ' + p.gem : ''}`.trim(),
                        badge: p.badge || '',
                        image: primaryImg,
                        thumbs: allThumbs,
                        description: p.description || ''
                    };
                });
            } else {
                liveCatalogItems = [];
            }
        } catch (err) {
            console.error('API getProducts failed:', err.message);
            liveCatalogItems = [];
        }

        // Re-sync categories bar with real product categories
        loadCategoriesFromAPI();
        renderCatalog();
    }

    function initFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('category') || urlParams.get('cat');
        const metal = urlParams.get('metal');
        const gem = urlParams.get('gem');
        const q = urlParams.get('search') || urlParams.get('q');

        if (cat) {
            activeCategory = cat;
            const pills = document.querySelectorAll('.cat-pill');
            pills.forEach(pill => {
                if (pill.dataset.category && pill.dataset.category.toLowerCase() === cat.toLowerCase()) {
                    pills.forEach(p => p.classList.remove('cat-pill--active'));
                    pill.classList.add('cat-pill--active');
                }
            });
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
                const catLower = activeCategory.toLowerCase();
                if (catLower === 'solitaire' || catLower === 'solitaires') {
                    if (!item.name.toLowerCase().includes('solitaire') && item.gem.toLowerCase() !== 'diamond') return false;
                } else if (item.category.toLowerCase() !== catLower) {
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
                if (!matchName && !matchSpecs && !matchCat) return false;
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
            resultsCount.textContent = `Showing ${filtered.length} piece${filtered.length === 1 ? '' : 's'}`;
        }

        grid.innerHTML = '';

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
            return;
        }

        filtered.forEach(item => {
            const card = document.createElement('article');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <div class="product-card__image">
                    ${item.badge ? `<span class="product-card__badge">${item.badge}</span>` : ''}
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="product-card__body">
                    <h3 class="product-card__name">${item.name}</h3>
                    <p class="product-card__type">${item.specs || item.category || ''}</p>
                    <div class="product-card__footer">
                        <span class="product-card__price">${item.price}</span>
                        <button class="btn btn--small btn--outline add-to-cart-btn" data-id="${item.id}" aria-label="Add to Bag">Add to Bag</button>
                    </div>
                </div>
            `;

            // Card click (including image) navigates to PDP
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                const prodData = {
                    id: item.mongoId || item.id,
                    name: item.name,
                    price: item.price,
                    priceNum: item.priceNum,
                    category: item.category,
                    specs: item.specs,
                    image: item.image,
                    thumbs: item.thumbs,
                    description: item.description
                };
                try {
                    localStorage.setItem('maira_selected_product', JSON.stringify(prodData));
                } catch (err) {}
                window.location.href = `product.html?id=${encodeURIComponent(item.mongoId || item.id)}`;
            });

            // Quick Add button
            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
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
        initFiltersFromURL();
        initFilterControls();
        updateCartBadge();
        loadProductsFromAPI();
    });
})();
