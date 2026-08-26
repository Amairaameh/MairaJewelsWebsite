/* =============================================
   MairaJewels - Product Detail Page JS (Full Dynamic API)
   Handles PDP details, gallery, quantity, bag, buy now, accordions & related
   ============================================= */

import api from './api.js';
import { resolveCategory, isCategoryMatch } from './categoryHelper.js';

(function () {
    'use strict';

    // State
    let currentProduct = null;
    let currentGalleryImages = [];
    let currentImageIndex = 0;
    let selectedColor = '';
    let selectedSize = '';

    /* ---------- Cart Storage Utilities ---------- */
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
        const badge = document.getElementById('cart-count-badge') || document.querySelector('.cart-count') || document.querySelector('.mobile-cart-count');
        if (!badge) return;
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        document.querySelectorAll('.cart-count, #cart-count-badge, .mobile-cart-count').forEach(el => {
            el.textContent = totalItems;
        });
    }

    function showToast(msg) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg || 'Added to Bag ✓';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    function parsePriceNum(priceVal) {
        if (typeof priceVal === 'number') return priceVal;
        if (!priceVal) return 0;
        let s = String(priceVal).trim();
        if (s.includes(',') && s.includes('.')) {
            s = s.replace(/,/g, '');
        } else if (s.includes(',')) {
            s = s.replace(',', '.');
        }
        const cleaned = s.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function formatPrice(val) {
        const num = (typeof val === 'number' && !isNaN(val)) ? val : parseFloat(val) || 0;
        return 'R ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /* ---------- Initial URL / Storage Extraction ---------- */
    function getInitialProductFromContext() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        const urlName = urlParams.get('name');
        const urlPrice = urlParams.get('price');
        const urlSpecs = urlParams.get('specs');
        const urlCategory = urlParams.get('category');

        try {
            const stored = localStorage.getItem('maira_selected_product');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (urlId && (parsed.id === urlId || parsed.mongoId === urlId)) {
                    return parsed;
                }
                if (!urlId && urlName && parsed.name === urlName) {
                    return parsed;
                }
            }
        } catch (e) {}

        if (urlName) {
            return {
                id: urlId || 'prod-' + Date.now(),
                mongoId: urlId,
                name: decodeURIComponent(urlName),
                price: urlPrice ? (urlPrice.startsWith('$') ? 'R ' + decodeURIComponent(urlPrice).slice(1).trim() : decodeURIComponent(urlPrice)) : 'R 448.00',
                priceNum: parsePriceNum(urlPrice || 448),
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                specs: urlSpecs ? decodeURIComponent(urlSpecs) : '18K Gold',
                category: urlCategory ? decodeURIComponent(urlCategory) : 'Fine Jewellery',
                thumbs: [],
                description: '',
                details: '',
                color: '',
                sizes: ''
            };
        }

        try {
            const stored = localStorage.getItem('maira_selected_product');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {}

        return null;
    }

    /* ---------- Render PDP UI ---------- */
    function renderProductUI(p) {
        if (!p) return;
        currentProduct = p;

        document.title = `${p.name} — MairaJewels`;

        const breadcrumbName = document.getElementById('breadcrumb-name');
        const pageTitle = document.getElementById('page-title');
        const mainImage = document.getElementById('main-image');
        const galleryThumbs = document.getElementById('gallery-thumbs');
        const productCategory = document.getElementById('product-category');
        const productName = document.getElementById('product-name');
        const productPrice = document.getElementById('product-price');
        const productTagline = document.getElementById('product-tagline');
        const productChips = document.getElementById('product-chips');
        const productDetailsText = document.getElementById('product-details-text');

        if (breadcrumbName) breadcrumbName.textContent = p.name;
        if (pageTitle) pageTitle.textContent = `${p.name} — MairaJewels`;
        if (productCategory) {
            const resCat = resolveCategory(p.category);
            productCategory.innerHTML = `<a href="collections.html?category=${encodeURIComponent(resCat.name)}" style="color:var(--color-gold); text-decoration:none;">${resCat.name}</a>`;
        }
        if (productName) productName.textContent = p.name;
        
        const isOutOfStock = (p.inStock === false) ||
                             (typeof p.stock === 'number' && p.stock <= 0) ||
                             (typeof p.countInStock === 'number' && p.countInStock <= 0) ||
                             (typeof p.stockQty === 'number' && p.stockQty <= 0) ||
                             (p.isOutOfStock === true);
        p.isOutOfStock = isOutOfStock;

        const displayPrice = (typeof p.price === 'string' && (p.price.startsWith('$') || p.price.startsWith('R'))) 
            ? (p.price.startsWith('$') ? 'R ' + p.price.slice(1).trim() : p.price) 
            : formatPrice(p.priceNum || parsePriceNum(p.price));
        if (productPrice) productPrice.textContent = displayPrice;

        const colorVal = p.color || p.colour || '';
        const sizesVal = p.sizes || p.availableSizes || '';

        if (productTagline) {
            productTagline.textContent = p.description || 'Handcrafted with precision, this piece is designed to be your everyday signature — where modern minimalism meets timeless elegance.';
        }

        if (productDetailsText) {
            let detailsText = p.details || p.description || 'A masterpiece of modern craftsmanship. Every detail is carefully considered, from the ethically sourced materials to the hand-finished surface.';
            if (colorVal || sizesVal) {
                detailsText += `\n\nSpecifications:`;
                if (colorVal) detailsText += `\n• Colour: ${colorVal}`;
                if (sizesVal) detailsText += `\n• Available Sizes: ${sizesVal}`;
            }
            productDetailsText.innerText = detailsText;
        }

        // Render Colour & Available Sizes option pills
        const optionsGroup = document.getElementById('product-options-group');
        const colorWrapper = document.getElementById('product-color-wrapper');
        const colorPills = document.getElementById('product-color-pills');
        const selectedColorVal = document.getElementById('selected-color-val');

        const sizesWrapper = document.getElementById('product-sizes-wrapper');
        const sizesPills = document.getElementById('product-sizes-pills');
        const selectedSizeVal = document.getElementById('selected-size-val');

        let hasOptions = false;

    function parseOptionsList(valStr) {
        if (!valStr || typeof valStr !== 'string') return [];
        return valStr
            .split(/[,./|]|\)\s*\(/)
            .map(s => s.replace(/^[()\s]+|[()\s]+$/g, '').trim())
            .filter(Boolean);
    }

        if (colorVal && colorWrapper && colorPills) {
            const colorsArr = parseOptionsList(colorVal);
            if (colorsArr.length > 0) {
                hasOptions = true;
                colorWrapper.style.display = 'block';
                colorPills.innerHTML = '';
                
                selectedColor = colorsArr[0];
                if (selectedColorVal) selectedColorVal.textContent = selectedColor;

                colorsArr.forEach((cText, idx) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = `option-pill ${idx === 0 ? 'active' : ''}`;
                    btn.textContent = cText;
                    btn.addEventListener('click', () => {
                        colorPills.querySelectorAll('.option-pill').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        selectedColor = cText;
                        if (selectedColorVal) selectedColorVal.textContent = cText;
                    });
                    colorPills.appendChild(btn);
                });
            } else {
                colorWrapper.style.display = 'none';
                selectedColor = '';
            }
        } else if (colorWrapper) {
            colorWrapper.style.display = 'none';
            selectedColor = '';
        }

        if (sizesVal && sizesWrapper && sizesPills) {
            const sizesArr = parseOptionsList(sizesVal);
            if (sizesArr.length > 0) {
                hasOptions = true;
                sizesWrapper.style.display = 'block';
                sizesPills.innerHTML = '';

                selectedSize = sizesArr[0];
                if (selectedSizeVal) selectedSizeVal.textContent = selectedSize;

                sizesArr.forEach((sText, idx) => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = `option-pill ${idx === 0 ? 'active' : ''}`;
                    btn.textContent = sText;
                    btn.addEventListener('click', () => {
                        sizesPills.querySelectorAll('.option-pill').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        selectedSize = sText;
                        if (selectedSizeVal) selectedSizeVal.textContent = sText;
                    });
                    sizesPills.appendChild(btn);
                });
            } else {
                sizesWrapper.style.display = 'none';
                selectedSize = '';
            }
        } else if (sizesWrapper) {
            sizesWrapper.style.display = 'none';
            selectedSize = '';
        }

        if (optionsGroup) {
            optionsGroup.style.display = hasOptions ? 'block' : 'none';
        }

        // Custom Specification Badges from Admin Panel & Product Specs
        if (productChips) {
            productChips.innerHTML = '';
            const chips = [];

            // 1. Prioritize custom Specification Badges added by Admin in Admin Panel (p.specifications or p.specs)
            const rawSpecs = p.specifications || p.specs;
            if (Array.isArray(rawSpecs)) {
                rawSpecs.forEach(s => {
                    if (s && typeof s === 'string' && s.trim()) chips.push(s.trim());
                });
            } else if (typeof rawSpecs === 'string' && rawSpecs.trim()) {
                rawSpecs.split(/[,•|]/).forEach(s => {
                    const clean = s.trim();
                    if (clean && clean.toLowerCase() !== '18k gold diamond') chips.push(clean);
                });
            }

            // 2. If no custom specifications badges from Admin Panel, use metal & gem if specific
            if (chips.length === 0) {
                if (p.metal && !['18k gold', 'all-metals', 'all'].includes(p.metal.toLowerCase())) chips.push(p.metal);
                if (p.gem && !['diamond', 'all'].includes(p.gem.toLowerCase())) chips.push(p.gem);
            }

            // 3. Fallback default badges if still empty
            if (chips.length === 0) {
                chips.push('18K Gold Plated', 'Hypoallergenic', 'Tarnish Free');
            }

            // Stock Status Badge
            if (isOutOfStock) {
                const outChip = document.createElement('span');
                outChip.className = 'chip';
                outChip.style.cssText = 'background:#e53e3e; color:#ffffff; font-weight:700; border-color:#e53e3e;';
                outChip.textContent = 'OUT OF STOCK';
                productChips.appendChild(outChip);
            } else {
                const inChip = document.createElement('span');
                inChip.className = 'chip';
                inChip.style.cssText = 'background:#27ae60; color:#ffffff; font-weight:600; border-color:#27ae60;';
                inChip.textContent = 'IN STOCK';
                productChips.appendChild(inChip);
            }

            // Render each specification badge tag entered in Admin Panel
            chips.forEach(chipText => {
                const chip = document.createElement('span');
                chip.className = 'chip';
                chip.textContent = chipText.toUpperCase();
                productChips.appendChild(chip);
            });
        }

        // Configure PDP buttons & controls based on stock
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const buyNowBtn = document.getElementById('buy-now-btn');
        const qtyMinus = document.getElementById('qty-minus');
        const qtyPlus = document.getElementById('qty-plus');

        if (isOutOfStock) {
            if (addToCartBtn) {
                addToCartBtn.textContent = 'Out of Stock';
                addToCartBtn.disabled = true;
                addToCartBtn.style.cssText = 'opacity:0.55; cursor:not-allowed; background:#888; border-color:#888; color:#fff;';
            }
            if (buyNowBtn) {
                buyNowBtn.textContent = 'Out of Stock';
                buyNowBtn.disabled = true;
                buyNowBtn.style.cssText = 'opacity:0.55; cursor:not-allowed; background:transparent; border-color:#ccc; color:#888;';
            }
            if (qtyMinus) qtyMinus.disabled = true;
            if (qtyPlus) qtyPlus.disabled = true;
        } else {
            if (addToCartBtn) {
                addToCartBtn.textContent = 'Add to Bag';
                addToCartBtn.disabled = false;
                addToCartBtn.style.cssText = '';
            }
            if (buyNowBtn) {
                buyNowBtn.textContent = 'Buy Now — Checkout';
                buyNowBtn.disabled = false;
                buyNowBtn.style.cssText = '';
            }
            if (qtyMinus) qtyMinus.disabled = false;
            if (qtyPlus) qtyPlus.disabled = false;
        }

        // Gallery Images Setup
        let rawImages = [];
        if (Array.isArray(p.images) && p.images.length > 0) {
            rawImages = p.images;
        } else if (Array.isArray(p.thumbs) && p.thumbs.length > 0) {
            rawImages = p.thumbs;
        } else if (p.image) {
            rawImages = [p.image];
        } else {
            rawImages = ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'];
        }
        currentGalleryImages = rawImages;
        currentImageIndex = 0;

        updateGalleryDisplay();
    }

    function updateGalleryDisplay() {
        const mainImage = document.getElementById('main-image');
        const galleryThumbs = document.getElementById('gallery-thumbs');

        if (mainImage && currentGalleryImages.length > 0) {
            const activeUrl = currentGalleryImages[currentImageIndex] || currentGalleryImages[0];
            mainImage.src = activeUrl;
            mainImage.alt = currentProduct ? currentProduct.name : 'Product Image';
        }

        if (galleryThumbs) {
            galleryThumbs.innerHTML = '';
            if (currentGalleryImages.length > 1) {
                currentGalleryImages.forEach((imgUrl, idx) => {
                    const thumbBtn = document.createElement('button');
                    thumbBtn.className = `product-gallery__thumb ${idx === currentImageIndex ? 'product-gallery__thumb--active active' : ''}`;
                    thumbBtn.setAttribute('aria-label', `View image ${idx + 1}`);
                    thumbBtn.innerHTML = `<img src="${imgUrl}" alt="Thumbnail ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;">`;
                    thumbBtn.addEventListener('click', () => {
                        currentImageIndex = idx;
                        updateGalleryDisplay();
                    });
                    galleryThumbs.appendChild(thumbBtn);
                });
            }
        }
    }

    /* ---------- Fetch Dynamic Product & Related from Backend API ---------- */
    async function loadDynamicProductData() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || (currentProduct && (currentProduct.mongoId || currentProduct.id));
        const productName = urlParams.get('name');

        let loadedProduct = null;

        // 1. Try to fetch product by ID from API
        if (productId && productId !== 'default-1' && !productId.startsWith('prod-')) {
            try {
                const res = await api.getProductById(productId);
                if (res.data && res.data.product) {
                    loadedProduct = res.data.product;
                }
            } catch (err) {
                console.warn('API getProductById attempt:', err.message);
            }
        }

        // 2. If not found by ID, query products list to match by name or customId
        if (!loadedProduct) {
            try {
                const res = await api.getProducts({ limit: 100 });
                if (res.data && res.data.products && res.data.products.length > 0) {
                    const all = res.data.products;
                    if (productId) {
                        loadedProduct = all.find(p => p._id === productId || p.customId === productId);
                    }
                    if (!loadedProduct && productName) {
                        const targetName = decodeURIComponent(productName).toLowerCase().trim();
                        loadedProduct = all.find(p => p.name.toLowerCase().trim() === targetName);
                    }
                }
            } catch (err) {
                console.warn('API getProducts fallback search:', err.message);
            }
        }

        if (loadedProduct) {
            const p = loadedProduct;
            const isOutOfStock = (p.inStock === false) ||
                                 (typeof p.stock === 'number' && p.stock <= 0) ||
                                 (typeof p.countInStock === 'number' && p.countInStock <= 0) ||
                                 (typeof p.stockQty === 'number' && p.stockQty <= 0);
            const normalized = {
                id: p._id || p.customId,
                mongoId: p._id,
                name: p.name,
                price: p.price ? (p.price.startsWith('$') ? 'R ' + p.price.slice(1).trim() : p.price) : `R ${p.priceNum?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                priceNum: p.priceNum || parsePriceNum(p.price),
                category: p.category,
                metal: p.metal,
                gem: p.gem,
                isOutOfStock,
                inStock: !isOutOfStock,
                stock: typeof p.stock === 'number' ? p.stock : (typeof p.countInStock === 'number' ? p.countInStock : 10),
                specifications: p.specifications || p.specs || '',
                specs: p.specs || p.specifications || '',
                image: p.image || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
                images: (p.images && p.images.length > 0) ? p.images : (p.thumbs || [p.image]),
                thumbs: (p.images && p.images.length > 0) ? p.images : (p.thumbs || [p.image]),
                description: p.description || '',
                details: p.details || '',
                color: p.color || p.colour || '',
                sizes: p.sizes || p.availableSizes || ''
            };
            renderProductUI(normalized);
        }

        // Load Related Products dynamically from API
        loadRelatedProducts();
    }

    async function loadRelatedProducts() {
        const relatedGrid = document.getElementById('related-grid');
        if (!relatedGrid) return;

        try {
            const [catRes, prodRes] = await Promise.all([
                api.getCategories().catch(() => ({ data: { categories: [] } })),
                api.getProducts({ limit: 100 }).catch(() => ({ data: { products: [] } }))
            ]);

            const categoriesMaster = (catRes.data && catRes.data.categories) ? catRes.data.categories : [];
            const allProds = (prodRes.data && prodRes.data.products) ? prodRes.data.products : [];

            if (allProds.length > 0) {
                const currentId = currentProduct ? (currentProduct.mongoId || currentProduct.id) : null;
                const currentName = currentProduct ? (currentProduct.name || '').toLowerCase() : '';
                const currentCategory = currentProduct ? currentProduct.category : null;
                
                // 1. Exclude current product
                const candidates = allProds.filter(p => (p._id !== currentId && p.customId !== currentId && (p.name || '').toLowerCase() !== currentName));

                // 2. Prioritize products matching current category
                let sameCategoryProds = [];
                let otherCategoryProds = [];

                candidates.forEach(p => {
                    if (currentCategory && isCategoryMatch(p.category, currentCategory, categoriesMaster)) {
                        sameCategoryProds.push(p);
                    } else {
                        otherCategoryProds.push(p);
                    }
                });

                // Combine same category first, then fallback to others
                const related = [...sameCategoryProds, ...otherCategoryProds].slice(0, 4);

                if (related.length > 0) {
                    relatedGrid.innerHTML = '';
                    related.forEach(item => {
                        const card = document.createElement('div');
                        card.className = 'related-card';
                        const itemIsOut = (item.inStock === false) ||
                                          (typeof item.stock === 'number' && item.stock <= 0) ||
                                          (typeof item.countInStock === 'number' && item.countInStock <= 0) ||
                                          (typeof item.stockQty === 'number' && item.stockQty <= 0);
                        const itemPrice = item.price ? (item.price.startsWith('$') ? 'R ' + item.price.slice(1).trim() : item.price) : `R ${item.priceNum?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
                        const itemImg = item.image || (item.images && item.images[0]) || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80';
                        const badgeHtml = itemIsOut ? `<span class="product-card__badge product-card__badge--out-of-stock">OUT OF STOCK</span>` : '';

                        const itemColor = item.color || item.colour || '';
                        const itemSizes = item.sizes || item.availableSizes || '';
                        const resCat = resolveCategory(item.category, categoriesMaster);

                        card.innerHTML = `
                            <div class="related-card__image" style="position:relative;">
                                ${badgeHtml}
                                <img src="${itemImg}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                            </div>
                            <div class="related-card__body">
                                <span class="related-card__category">${resCat.name}</span>
                                <h4 class="related-card__name">${item.name}</h4>
                                ${itemColor ? `<p class="product-card__meta-line"><span class="product-card__meta-label">Colour:</span> ${itemColor}</p>` : ''}
                                ${itemSizes ? `<p class="product-card__meta-line"><span class="product-card__meta-label">Sizes:</span> ${itemSizes}</p>` : ''}
                                <div class="related-card__footer">
                                    <span class="related-card__price">${itemPrice}</span>
                                </div>
                            </div>
                        `;

                        card.addEventListener('click', () => {
                            const prodData = {
                                id: item._id || item.customId,
                                name: item.name,
                                price: itemPrice,
                                priceNum: item.priceNum || parsePriceNum(itemPrice),
                                category: item.category,
                                specs: item.specs || `${item.metal || ''} ${item.gem ? '• ' + item.gem : ''}`,
                                image: itemImg,
                                thumbs: item.images || [itemImg]
                            };
                            try {
                                localStorage.setItem('maira_selected_product', JSON.stringify(prodData));
                            } catch (e) {}
                            window.location.href = `product.html?id=${encodeURIComponent(item._id || item.customId)}`;
                        });

                        relatedGrid.appendChild(card);
                    });
                }
            }
        } catch (err) {
            console.warn('Could not load related products:', err.message);
        }
    }

    /* ---------- Attach Interactive Controls ---------- */
    function initPDPEventListeners() {
        const qtyValue = document.getElementById('qty-value');
        const qtyMinus = document.getElementById('qty-minus');
        const qtyPlus = document.getElementById('qty-plus');
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        const buyNowBtn = document.getElementById('buy-now-btn');
        const galleryPrev = document.getElementById('gallery-prev');
        const galleryNext = document.getElementById('gallery-next');

        // 1. Quantity Minus
        if (qtyMinus && qtyValue) {
            qtyMinus.addEventListener('click', (e) => {
                e.preventDefault();
                let val = parseInt(qtyValue.value, 10) || 1;
                if (val > 1) {
                    qtyValue.value = val - 1;
                }
            });
        }

        // 2. Quantity Plus
        if (qtyPlus && qtyValue) {
            qtyPlus.addEventListener('click', (e) => {
                e.preventDefault();
                let val = parseInt(qtyValue.value, 10) || 1;
                if (val < 10) {
                    qtyValue.value = val + 1;
                }
            });
        }

        // 3. Add to Bag
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentProduct) return;
                if (currentProduct.isOutOfStock) {
                    showToast(`Sorry, ${currentProduct.name} is currently out of stock.`);
                    return;
                }

                const qty = qtyValue ? (parseInt(qtyValue.value, 10) || 1) : 1;
                const cart = getCart();
                const existing = cart.find(item => item.name === currentProduct.name);

                if (existing) {
                    existing.quantity = (existing.quantity || 1) + qty;
                } else {
                    cart.push({
                        id: currentProduct.mongoId || currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        priceNum: currentProduct.priceNum || parsePriceNum(currentProduct.price),
                        image: currentProduct.image,
                        specs: currentProduct.specs || currentProduct.category || '18K Gold',
                        category: currentProduct.category,
                        color: selectedColor || currentProduct.color || currentProduct.colour || '',
                        size: selectedSize || currentProduct.sizes || currentProduct.availableSizes || '',
                        quantity: qty
                    });
                }

                saveCart(cart);
                updateCartBadge();
                showToast(`${qty}x ${currentProduct.name} added to Bag ✓`);

                // Button state animation
                const origText = addToCartBtn.textContent;
                addToCartBtn.textContent = 'Added to Bag ✓';
                addToCartBtn.style.backgroundColor = 'var(--color-gold-dark)';
                setTimeout(() => {
                    addToCartBtn.textContent = origText;
                    addToCartBtn.style.backgroundColor = '';
                }, 1800);
            });
        }

        // 4. Buy Now — Checkout
        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!currentProduct) return;
                if (currentProduct.isOutOfStock) {
                    showToast(`Sorry, ${currentProduct.name} is currently out of stock.`);
                    return;
                }

                const qty = qtyValue ? (parseInt(qtyValue.value, 10) || 1) : 1;
                const cart = getCart();
                const existing = cart.find(item => item.name === currentProduct.name);

                if (existing) {
                    existing.quantity = (existing.quantity || 1) + qty;
                } else {
                    cart.push({
                        id: currentProduct.mongoId || currentProduct.id,
                        name: currentProduct.name,
                        price: currentProduct.price,
                        priceNum: currentProduct.priceNum || parsePriceNum(currentProduct.price),
                        image: currentProduct.image,
                        specs: currentProduct.specs || currentProduct.category || '18K Gold',
                        category: currentProduct.category,
                        color: selectedColor || currentProduct.color || currentProduct.colour || '',
                        size: selectedSize || currentProduct.sizes || currentProduct.availableSizes || '',
                        quantity: qty
                    });
                }

                saveCart(cart);
                updateCartBadge();

                const user = api.getUser();
                const token = api.getToken();
                if (!user || !token) {
                    window.location.href = 'login.html?redirect=checkout.html';
                } else {
                    window.location.href = 'checkout.html';
                }
            });
        }

        // 5. Gallery Next / Prev Arrows
        if (galleryPrev) {
            galleryPrev.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentGalleryImages.length <= 1) return;
                currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                updateGalleryDisplay();
            });
        }

        if (galleryNext) {
            galleryNext.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentGalleryImages.length <= 1) return;
                currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
                updateGalleryDisplay();
            });
        }

        // 6. Accordions
        const accordionTriggers = document.querySelectorAll('.accordion-item__trigger');
        accordionTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.closest('.accordion-item');
                if (item) {
                    item.classList.toggle('open');
                }
            });
        });
    }

    /* ---------- Document Ready Initialization ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        const initial = getInitialProductFromContext();
        if (initial) {
            renderProductUI(initial);
        }
        updateCartBadge();
        initPDPEventListeners();
        loadDynamicProductData();
    });
})();
