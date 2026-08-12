/* =============================================
   MairaJewels — Product Detail Page JS
   ============================================= */

(function () {
    'use strict';

    // Helper to get cart from localStorage
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
        const badge = document.getElementById('cart-count-badge');
        if (!badge) return;
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        badge.textContent = totalItems;
    }

    function showToast(msg) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = msg || 'Added to Bag ✓';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // Load Product Data
    let productData = null;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlName = urlParams.get('name');
        if (urlName) {
            productData = {
                name: urlName,
                price: urlParams.get('price') || '$448.00',
                image: urlParams.get('image') || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
                specs: urlParams.get('specs') || '18K Gold',
                category: urlParams.get('category') || 'Fine Jewellery',
                thumbs: [
                    urlParams.get('image') || 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80',
                    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
                ]
            };
        } else {
            const stored = localStorage.getItem('maira_selected_product');
            if (stored) {
                productData = JSON.parse(stored);
            }
        }
    } catch (e) {
        console.error('Error loading product data', e);
    }

    // Fallback product if directly opening product.html without selecting
    if (!productData || !productData.name) {
        productData = {
            id: 'default-1',
            name: 'Sunburst Fan Earrings',
            price: '$448.00',
            specs: '22K Gold • 11.2gm',
            category: 'Earrings',
            image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
            ]
        };
    }

    if (!productData || !productData.image || productData.image.trim() === '') {
        productData.image = 'https://images.unsplash.com/photo-1605100804765-2cbd8be0c558?auto=format&fit=crop&w=600&q=80';
    }

    // Populate Page Elements
    document.title = `${productData.name} — MairaJewels`;

    const breadcrumbName = document.getElementById('breadcrumb-name');
    const pageTitle = document.getElementById('page-title');
    const mainImage = document.getElementById('main-image');
    const galleryThumbs = document.getElementById('gallery-thumbs');
    const productCategory = document.getElementById('product-category');
    const productName = document.getElementById('product-name');
    const productPrice = document.getElementById('product-price');
    const productChips = document.getElementById('product-chips');

    if (breadcrumbName) breadcrumbName.textContent = productData.name;
    if (pageTitle) pageTitle.textContent = `${productData.name} — MairaJewels`;
    if (productCategory) productCategory.textContent = productData.category || 'Fine Jewellery';
    if (productName) productName.textContent = productData.name;
    if (productPrice) productPrice.textContent = productData.price;
    if (mainImage) mainImage.src = productData.image;

    // Gallery Thumbs & Arrow Controls
    const images = productData.thumbs && productData.thumbs.length > 0
        ? productData.thumbs
        : [productData.image];

    let currentImgIndex = 0;

    function updateMainImage(index) {
        if (index < 0) index = images.length - 1;
        if (index >= images.length) index = 0;
        currentImgIndex = index;

        if (mainImage) mainImage.src = images[currentImgIndex];

        const thumbs = document.querySelectorAll('.product-gallery__thumb');
        thumbs.forEach((t, idx) => {
            if (idx === currentImgIndex) t.classList.add('active');
            else t.classList.remove('active');
        });
    }

    const galleryPrev = document.getElementById('gallery-prev');
    const galleryNext = document.getElementById('gallery-next');

    if (galleryPrev) {
        galleryPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            updateMainImage(currentImgIndex - 1);
        });
    }

    if (galleryNext) {
        galleryNext.addEventListener('click', (e) => {
            e.stopPropagation();
            updateMainImage(currentImgIndex + 1);
        });
    }

    if (galleryThumbs) {
        galleryThumbs.innerHTML = '';
        images.forEach((src, idx) => {
            const thumb = document.createElement('div');
            thumb.className = `product-gallery__thumb ${idx === 0 ? 'active' : ''}`;
            thumb.innerHTML = `<img src="${src}" alt="${productData.name} view ${idx + 1}">`;
            thumb.addEventListener('click', () => {
                updateMainImage(idx);
            });
            galleryThumbs.appendChild(thumb);
        });
    }

    // Chips / Badges
    if (productChips) {
        productChips.innerHTML = '';
        const specs = productData.specs ? productData.specs.split('•') : ['18K Plated', 'Waterproof'];
        specs.forEach(spec => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `◆ ${spec.trim()}`;
            productChips.appendChild(chip);
        });

        // Add default luxury badges
        const defaultBadges = ['Tarnish Free', 'Hypoallergenic'];
        defaultBadges.forEach(b => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `◆ ${b}`;
            productChips.appendChild(chip);
        });
    }

    // Quantity Selector
    const qtyInput = document.getElementById('qty-value');
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');

    if (qtyMinus && qtyInput) {
        qtyMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }

    if (qtyPlus && qtyInput) {
        qtyPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val < 10) qtyInput.value = val + 1;
        });
    }

    // Add to Cart Action
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
            const cart = getCart();

            const existingIndex = cart.findIndex(item => item.name === productData.name);
            if (existingIndex > -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + qty;
            } else {
                cart.push({
                    name: productData.name,
                    price: productData.price,
                    image: productData.image,
                    specs: productData.specs || 'Fine Jewellery',
                    quantity: qty
                });
            }

            saveCart(cart);
            updateCartBadge();
            showToast(`${productData.name} added to Bag ✓`);
        });
    }

    // Buy Now / Checkout Action
    const buyNowBtn = document.getElementById('buy-now-btn');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', () => {
            const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
            const cart = getCart();

            const existingIndex = cart.findIndex(item => item.name === productData.name);
            if (existingIndex > -1) {
                cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + qty;
            } else {
                cart.push({
                    name: productData.name,
                    price: productData.price,
                    image: productData.image,
                    specs: productData.specs || 'Fine Jewellery',
                    quantity: qty
                });
            }

            saveCart(cart);
            window.location.href = 'checkout.html';
        });
    }

    // Accordions
    const accordionTriggers = document.querySelectorAll('.accordion-item__trigger');
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.parentElement;
            const isOpen = item.classList.contains('open');

            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        });
    });

    // Related Products Logic (Zara Style)
    const catalogProducts = [
        {
            name: 'Emerald Royal Ring',
            price: '$1,133.00',
            category: 'Rings',
            specs: '18K • 15.2gm',
            image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1603564158650-9b23f9d0b14b?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            name: 'Crescent Moons',
            price: '$2,158.00',
            category: 'Earrings',
            specs: '18K • 7.2gm',
            image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            name: 'Tree Of Life Drops',
            price: '$333.00',
            category: 'Earrings',
            specs: '18K Gold • 7.2gm',
            image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            name: 'Rosé Promise Ring',
            price: '$3,200.00',
            category: 'Rings',
            specs: 'Rose Gold • Pink Diamond',
            image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            name: 'Royal Gold Diamond Watch',
            price: '$3,850.00',
            category: 'Watches',
            specs: '18K Gold • Automatic',
            image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
            ]
        },
        {
            name: "Men's Diamond Signet Ring",
            price: '$2,450.00',
            category: "Men's Accessories",
            specs: '24K Gold • 18.5gm',
            image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=800&q=80',
            thumbs: [
                'https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
            ]
        }
    ];

    const relatedGrid = document.getElementById('related-grid');
    if (relatedGrid) {
        relatedGrid.innerHTML = '';
        const filtered = catalogProducts.filter(p => p.name !== productData.name);
        const displayList = filtered.slice(0, 4);

        displayList.forEach((item, idx) => {
            const card = document.createElement('article');
            card.className = 'related-card';
            card.style.animationDelay = (idx * 0.12) + 's';
            card.innerHTML = `
                <div class="related-card__image">
                    <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="related-card__body">
                    <span class="related-card__category">${item.category}</span>
                    <h3 class="related-card__name">${item.name}</h3>
                    <div class="related-card__footer">
                        <span class="related-card__price">${item.price}</span>
                        <button class="btn btn--sm btn--primary add-to-bag-related">Add to Bag</button>
                    </div>
                </div>
            `;

            const addBtn = card.querySelector('.add-to-bag-related');
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
                            specs: item.specs || '18K Gold',
                            quantity: 1
                        });
                    }
                    saveCart(cart);
                    updateCartBadge();

                    const origText = addBtn.textContent;
                    addBtn.textContent = 'Added \u2713';
                    addBtn.style.backgroundColor = 'var(--color-gold-dark)';
                    addBtn.style.borderColor = 'var(--color-gold-dark)';

                    setTimeout(() => {
                        addBtn.textContent = origText;
                        addBtn.style.backgroundColor = '';
                        addBtn.style.borderColor = '';
                    }, 1500);

                    showToast(`${item.name} added to Bag ✓`);
                });
            }

            card.addEventListener('click', () => {
                localStorage.setItem('maira_selected_product', JSON.stringify(item));
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    window.location.reload();
                }, 250);
            });

            relatedGrid.appendChild(card);
        });
    }

    // Initialize Cart Badge
    updateCartBadge();
})();
