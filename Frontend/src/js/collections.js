/* =============================================
   Maira Jewels — Collections Catalog Logic
   Complete Dynamic Filtering & PDP Navigation
   ============================================= */

(function () {
    'use strict';

    const catalogItems = [
        {
            id: 'item-1',
            name: 'Eternal Solitaire Ring',
            category: 'Rings',
            price: '$2,450.00',
            priceNum: 2450,
            metal: '18K White Gold',
            gem: 'Diamond',
            specs: '18K White Gold · 1.5 Carat Diamond',
            badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-2',
            name: 'Aurelia Gold Band',
            category: 'Rings',
            price: '$1,890.00',
            priceNum: 1890,
            metal: '24K Gold',
            gem: 'Diamond',
            specs: '24K Pure Gold · Solitaire Diamond Accent',
            badge: '',
            image: 'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-3',
            name: 'Rosé Promise Ring',
            category: 'Rings',
            price: '$3,200.00',
            priceNum: 3200,
            metal: 'Rose Gold',
            gem: 'Diamond',
            specs: 'Rose Gold · Pink Diamond Halo',
            badge: 'BESTSELLER',
            image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-4',
            name: 'Emerald Royal Ring',
            category: 'Rings',
            price: '$1,133.00',
            priceNum: 1133,
            metal: '18K Gold',
            gem: 'Emerald',
            specs: '18K Yellow Gold · Royal Emerald Cut',
            badge: '',
            image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-5',
            name: 'Sunburst Fan Earrings',
            category: 'Earrings',
            price: '$448.00',
            priceNum: 448,
            metal: '18K Gold',
            gem: 'Diamond',
            specs: '18K Yellow Gold · 11.2gm Diamond Drops',
            badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-6',
            name: 'Tree Of Life Drops',
            category: 'Earrings',
            price: '$333.00',
            priceNum: 333,
            metal: '18K Gold',
            gem: 'Diamond',
            specs: '18K Gold · 7.2gm Filigree',
            badge: '',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-7',
            name: 'Golden Crescent Moons',
            category: 'Earrings',
            price: '$558.00',
            priceNum: 558,
            metal: '18K Gold',
            gem: 'Diamond',
            specs: '18K Gold · Celestial Diamond Inlay',
            badge: '',
            image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-8',
            name: 'Sapphire Heirloom Ring',
            category: 'Rings',
            price: '$5,400.00',
            priceNum: 5400,
            metal: '18K Gold',
            gem: 'Sapphire',
            specs: '18K Gold · Ceylon Royal Sapphire',
            badge: 'LIMITED',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-9',
            name: 'Twisted Vow Band',
            category: 'Rings',
            price: '$2,100.00',
            priceNum: 2100,
            metal: 'White Gold',
            gem: 'Diamond',
            specs: '18K White Gold · Diamond Pave',
            badge: '',
            image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-10',
            name: 'Pearl Whisper Ring',
            category: 'Rings',
            price: '$1,650.00',
            priceNum: 1650,
            metal: '24K Gold',
            gem: 'Pearl',
            specs: '22K Gold · South Sea Lustre Pearl',
            badge: '',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-11',
            name: 'Ruby Reverie Solitaire',
            category: 'Rings',
            price: '$6,800.00',
            priceNum: 6800,
            metal: 'Rose Gold',
            gem: 'Ruby',
            specs: '18K Rose Gold · Burmese Pigeon Ruby',
            badge: 'NEW',
            image: 'https://images.unsplash.com/photo-1599643478518-a784e5f4b940?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1599643478518-a784e5f4b940?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-12',
            name: 'Empress Diamond Pendant',
            category: 'Necklaces',
            price: '$4,250.00',
            priceNum: 4250,
            metal: 'Platinum',
            gem: 'Diamond',
            specs: 'Platinum · Pear Cut Diamond Pendant',
            badge: 'BESTSELLER',
            image: 'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632741717-e47896068228?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-13',
            name: 'Golden Bangle Curve',
            category: 'Bracelets',
            price: '$2,850.00',
            priceNum: 2850,
            metal: '18K Gold',
            gem: 'Diamond',
            specs: '18K Yellow Gold · Diamond Accent Bangle',
            badge: '',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            id: 'item-14',
            name: 'Diamond Tennis Bracelet',
            category: 'Bracelets',
            price: '$7,500.00',
            priceNum: 7500,
            metal: 'Platinum',
            gem: 'Diamond',
            specs: 'Platinum · 5.0 Carat Diamond Tennis Line',
            badge: 'LUXURY',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        }
    ];

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

    function showToast(msg) {
        const toast = document.getElementById('collections-toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }
    }

    let activeCategory = 'all';
    let selectedPriceRange = 'all';
    let activeSort = 'featured';
    let selectedMetals = [];
    let selectedGems = [];

    // Parse URL Search Parameters for initial filter state
    function initFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const cat = urlParams.get('category') || urlParams.get('cat');
        const metal = urlParams.get('metal');
        const gem = urlParams.get('gem');

        if (cat) {
            activeCategory = cat;
            // Activate corresponding category pill
            const pills = document.querySelectorAll('.cat-pill');
            pills.forEach(pill => {
                const pCat = pill.getAttribute('data-category');
                if (pCat && pCat.toLowerCase() === cat.toLowerCase()) {
                    pill.classList.add('cat-pill--active');
                } else if (pCat !== 'all') {
                    pill.classList.remove('cat-pill--active');
                }
            });
        }

        if (metal) {
            selectedMetals = [metal];
        }

        if (gem) {
            selectedGems = [gem];
        }
    }

    function renderCatalog() {
        const grid = document.getElementById('catalog-grid');
        const resultsCount = document.getElementById('results-count');
        if (!grid) return;

        let filtered = catalogItems.filter(item => {
            // Category filter
            if (activeCategory && activeCategory !== 'all') {
                const catLower = activeCategory.toLowerCase();
                if (catLower === 'solitaire' || catLower === 'solitaires') {
                    if (!item.name.toLowerCase().includes('solitaire') && item.gem.toLowerCase() !== 'diamond') return false;
                } else if (item.category.toLowerCase() !== catLower && !item.name.toLowerCase().includes(catLower)) {
                    return false;
                }
            }

            // Metal filter
            if (selectedMetals.length > 0 && !selectedMetals.includes('all-metals')) {
                const itemMetal = (item.metal || '').toLowerCase();
                const itemSpecs = (item.specs || '').toLowerCase();
                const metalMatch = selectedMetals.some(m => {
                    const mLower = m.toLowerCase();
                    return itemMetal.includes(mLower) || itemSpecs.includes(mLower) || (mLower === 'gold' && (itemMetal.includes('gold') || itemSpecs.includes('gold')));
                });
                if (!metalMatch) return false;
            }

            // Gem filter
            if (selectedGems.length > 0) {
                const itemGem = (item.gem || '').toLowerCase();
                const gemMatch = selectedGems.some(g => itemGem.includes(g.toLowerCase()));
                if (!gemMatch) return false;
            }

            // Price filter
            if (selectedPriceRange === 'under-500' && item.priceNum >= 500) return false;
            if (selectedPriceRange === '500-2000' && (item.priceNum < 500 || item.priceNum > 2000)) return false;
            if (selectedPriceRange === '2000-5000' && (item.priceNum < 2000 || item.priceNum > 5000)) return false;
            if (selectedPriceRange === 'above-5000' && item.priceNum <= 5000) return false;

            return true;
        });

        // Sorting
        if (activeSort === 'price-low') {
            filtered.sort((a, b) => a.priceNum - b.priceNum);
        } else if (activeSort === 'price-high') {
            filtered.sort((a, b) => b.priceNum - a.priceNum);
        } else if (activeSort === 'newest') {
            filtered.sort((a, b) => (b.badge === 'NEW' ? 1 : 0) - (a.badge === 'NEW' ? 1 : 0));
        }

        if (resultsCount) {
            resultsCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 4rem 1rem; text-align: center; background: var(--color-white); border: 1px solid var(--color-border);">
                    <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 0.8rem; color: var(--color-charcoal);">No Fine Jewelry Pieces Found</h3>
                    <p style="color: var(--color-muted); font-size: 0.95rem; margin-bottom: 2rem;">No items match your current filter selections. Try clearing your filters to explore our complete collection.</p>
                    <button class="btn btn--primary" id="clear-all-filters-btn" style="min-height: 44px; padding: 0.8rem 2rem;">Clear All Filters</button>
                </div>
            `;

            const clearBtn = document.getElementById('clear-all-filters-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', resetAllFilters);
            }
            return;
        }

        grid.innerHTML = '';
        filtered.forEach(item => {
            const card = document.createElement('article');
            card.className = 'product-card catalog-card';
            card.innerHTML = `
                <div class="product-card__image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                    ${item.badge ? `<span class="product-card__badge">${item.badge}</span>` : ''}
                </div>
                <div class="product-card__body catalog-card__body">
                    <div class="catalog-card__info">
                        <h3 class="product-card__name">${item.name}</h3>
                        <p class="product-card__type">${item.specs}</p>
                    </div>
                    <div class="catalog-card__price-row">
                        <span class="product-card__price">${item.price}</span>
                    </div>
                    <button class="btn btn--full btn--primary add-to-cart-btn catalog-btn">ADD TO BAG</button>
                </div>
            `;

            // Card click navigates to PDP
            card.addEventListener('click', (e) => {
                if (e.target.closest('.add-to-cart-btn')) return;
                localStorage.setItem('maira_selected_product', JSON.stringify({
                    name: item.name,
                    price: item.price,
                    category: item.category,
                    specs: item.specs,
                    image: item.image,
                    thumbs: item.thumbs
                }));
                window.location.href = 'product.html';
            });

            // Add to cart click
            const addBtn = card.querySelector('.add-to-cart-btn');
            if (addBtn) {
                addBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const cart = getCart();
                    const existingIndex = cart.findIndex(i => i.name === item.name);
                    if (existingIndex > -1) {
                        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
                    } else {
                        cart.push({
                            name: item.name,
                            price: item.price,
                            image: item.image,
                            specs: item.specs,
                            quantity: 1
                        });
                    }
                    saveCart(cart);
                    updateCartBadge();
                    showToast(`${item.name} added to your bag ✓`);
                });
            }

            grid.appendChild(card);
        });
    }

    function resetAllFilters() {
        activeCategory = 'all';
        selectedPriceRange = 'all';
        activeSort = 'featured';
        selectedMetals = [];
        selectedGems = [];

        const pills = document.querySelectorAll('.cat-pill');
        pills.forEach(p => p.classList.remove('cat-pill--active'));
        if (pills[0]) pills[0].classList.add('cat-pill--active');

        const metalChecks = document.querySelectorAll('.filter-metal-check');
        metalChecks.forEach(chk => chk.checked = chk.value === 'all-metals');

        const gemChecks = document.querySelectorAll('.filter-gem-check');
        gemChecks.forEach(chk => chk.checked = true);

        const defaultRadio = document.querySelector('input[name="price-range"][value="all"]');
        if (defaultRadio) defaultRadio.checked = true;

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'featured';

        renderCatalog();
    }

    function updateCartBadge() {
        const badge = document.getElementById('cart-count-badge');
        if (badge) {
            const cart = getCart();
            const total = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
            badge.textContent = total;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        initFiltersFromURL();
        updateCartBadge();
        renderCatalog();

        // Category Pills
        const pills = document.querySelectorAll('.cat-pill');
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('cat-pill--active'));
                pill.classList.add('cat-pill--active');
                activeCategory = pill.getAttribute('data-category');
                renderCatalog();
            });
        });

        // Sidebar Metal Checkboxes
        const metalChecks = document.querySelectorAll('.filter-metal-check');
        metalChecks.forEach(check => {
            check.addEventListener('change', () => {
                selectedMetals = Array.from(metalChecks)
                    .filter(c => c.checked)
                    .map(c => c.value);
                renderCatalog();
            });
        });

        // Sidebar Gem Checkboxes
        const gemChecks = document.querySelectorAll('.filter-gem-check');
        gemChecks.forEach(check => {
            check.addEventListener('change', () => {
                selectedGems = Array.from(gemChecks)
                    .filter(c => c.checked)
                    .map(c => c.value);
                renderCatalog();
            });
        });

        // Price Radios
        const priceRadios = document.querySelectorAll('input[name="price-range"]');
        priceRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                selectedPriceRange = radio.value;
                renderCatalog();
            });
        });

        // Sort Select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                activeSort = e.target.value;
                renderCatalog();
            });
        }

        // Reset Filters Button
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetAllFilters);
        }
    });
})();
