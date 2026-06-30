// ============================================================
// Product Detail Page Logic
// ============================================================

const ProductDetail = {
    product: null,
    quantity: 1,
    isInWishlist: false,

    init() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (!id) {
            Toast.error('Produk tidak ditemukan');
            window.location.href = '/pages/products.html';
            return;
        }
        
        this.loadProduct(id);
    },

    async loadProduct(id) {
        const skeleton = document.getElementById('productSkeleton');
        const content = document.getElementById('productContent');
        const reviews = document.getElementById('reviewsSection');

        try {
            const response = await fetch(`/api/products/${id}`);
            if (!response.ok) throw new Error('Produk tidak ditemukan');
            
            this.product = await response.json();
            
            // Tampilkan konten
            if (skeleton) skeleton.style.display = 'none';
            if (content) content.style.display = 'grid';
            if (reviews) reviews.style.display = 'block';
            
            this.renderProduct();
            this.renderGallery();
            this.renderSpecs();
            this.renderReviews();
            this.loadRelatedProducts();
            this.updateWishlistState();

        } catch (error) {
            console.error('Error:', error);
            Toast.error('Gagal memuat produk');
            if (skeleton) skeleton.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-secondary);">
                    <i class="fas fa-exclamation-circle" style="font-size:3rem;display:block;margin-bottom:16px;"></i>
                    <h3>Produk tidak ditemukan</h3>
                    <p>${error.message}</p>
                    <a href="/pages/products.html" class="btn-primary" style="margin-top:16px;">Kembali ke Produk</a>
                </div>
            `;
        }
    },

    renderProduct() {
        const p = this.product;
        if (!p) return;

        // Breadcrumb
        document.getElementById('breadcrumbName').textContent = p.name;

        // Basic info
        document.getElementById('productName').textContent = p.name;
        document.getElementById('productBrand').textContent = p.brand || 'Generic';
        document.getElementById('productCategory').textContent = p.category || 'Uncategorized';
        
        // Rating
        const rating = p.rating || 0;
        document.getElementById('productStars').textContent = this.renderStars(rating);
        document.getElementById('productReviews').textContent = `(${p.reviews || 0} ulasan)`;
        
        // Stock
        const stockEl = document.getElementById('stockStatus');
        const stock = p.stock || 0;
        if (stock > 0) {
            stockEl.textContent = `✅ Tersedia (${stock})`;
            stockEl.className = 'stock-status in-stock';
        } else {
            stockEl.textContent = '❌ Stok Habis';
            stockEl.className = 'stock-status out-of-stock';
        }

        // Price
        const discount = p.discount || 0;
        const discountedPrice = discount > 0 ? p.price * (1 - discount / 100) : p.price;
        document.getElementById('currentPrice').textContent = `Rp ${discountedPrice.toLocaleString()}`;
        
        const originalEl = document.getElementById('originalPrice');
        if (discount > 0) {
            originalEl.textContent = `Rp ${p.price.toLocaleString()}`;
            originalEl.style.display = 'inline';
            document.getElementById('discountBadge').textContent = `${discount}%`;
            document.getElementById('discountBadge').style.display = 'inline';
        } else {
            originalEl.style.display = 'none';
            document.getElementById('discountBadge').style.display = 'none';
        }

        // Description
        document.getElementById('productDescription').textContent = p.description || 'Tidak ada deskripsi';

        // Main image
        const mainImg = document.getElementById('mainImage');
        mainImg.src = `/assets/products/${p.image || 'placeholder.jpg'}`;
        mainImg.alt = p.name;
        document.getElementById('zoomImage').src = mainImg.src;
    },

    renderGallery() {
        const thumbs = document.getElementById('galleryThumbs');
        const p = this.product;
        
        // Generate thumbnail images (bisa pakai gambar yang sama atau multiple)
        const images = [p.image, p.image, p.image, p.image, p.image].filter(Boolean);
        
        thumbs.innerHTML = images.map((img, i) => `
            <img src="/assets/products/${img}" 
                 alt="Thumbnail ${i+1}"
                 class="${i === 0 ? 'active' : ''}"
                 onclick="ProductDetail.changeImage(this, '/assets/products/${img}')">
        `).join('');
    },

    changeImage(el, src) {
        document.getElementById('mainImage').src = src;
        document.getElementById('zoomImage').src = src;
        document.querySelectorAll('.gallery-thumbs img').forEach(img => img.classList.remove('active'));
        el.classList.add('active');
    },

    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    renderSpecs() {
        const container = document.getElementById('specsList');
        const specs = this.product.specifications || {};
        
        const entries = Object.entries(specs);
        if (entries.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">Tidak ada spesifikasi</p>';
            return;
        }
        
        container.innerHTML = `
            <div class="specs-list">
                ${entries.map(([key, value]) => `
                    <div class="spec-item">
                        <span class="spec-key">${key}</span>
                        <span class="spec-value">${value}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderReviews() {
        const container = document.getElementById('reviewsList');
        const p = this.product;
        
        // Generate dummy reviews berdasarkan rating
        const count = p.reviews || 0;
        const rating = p.rating || 4;
        
        if (count === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);">Belum ada ulasan</p>';
            document.getElementById('avgRating').textContent = '0.0';
            document.getElementById('avgStars').textContent = '☆☆☆☆☆';
            document.getElementById('totalReviews').textContent = '0 ulasan';
            return;
        }
        
        document.getElementById('avgRating').textContent = rating.toFixed(1);
        document.getElementById('avgStars').textContent = this.renderStars(rating);
        document.getElementById('totalReviews').textContent = `${count} ulasan`;
        
        // Generate dummy reviews
        const names = ['Andi Pratama', 'Budi Santoso', 'Citra Dewi', 'Doni Saputra', 'Eka Putri'];
        const comments = [
            'Produk sangat berkualitas, sesuai dengan deskripsi. Pengiriman cepat dan packing rapi.',
            'Bagus banget! Performa meningkat signifikan setelah pakai produk ini.',
            'Harga cukup mahal tapi kualitas sebanding. Recommended!',
            'Sudah pakai 2 minggu, hasilnya memuaskan. Motor jadi lebih responsif.',
            'Produk original, kualitas premium. Akan repeat order lagi.'
        ];
        
        const reviews = [];
        for (let i = 0; i < Math.min(count, 5); i++) {
            const idx = i % names.length;
            const r = Math.min(5, Math.max(3, rating + (Math.random() - 0.5) * 1.5));
            reviews.push({
                name: names[idx],
                rating: Math.round(r * 2) / 2,
                text: comments[idx % comments.length],
                date: new Date(Date.now() - i * 86400000 * 7).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric'
                })
            });
        }
        
        container.innerHTML = reviews.map(r => `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-author">${r.name}</span>
                    <span class="review-date">${r.date}</span>
                </div>
                <div class="review-stars">${this.renderStars(r.rating)}</div>
                <p class="review-text">${r.text}</p>
            </div>
        `).join('');
    },

    async loadRelatedProducts() {
        const container = document.getElementById('relatedProducts');
        if (!container) return;
        
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Gagal load produk terkait');
            
            const products = await response.json();
            const related = products
                .filter(p => p.id !== this.product.id && p.category === this.product.category)
                .slice(0, 4);
            
            if (related.length === 0) {
                container.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Tidak ada produk terkait</p>';
                return;
            }
            
            // Gunakan App.createProductCard jika tersedia
            if (window.App && typeof App.createProductCard === 'function') {
                container.innerHTML = related.map(p => App.createProductCard(p)).join('');
            } else {
                container.innerHTML = related.map(p => this.createProductCardFallback(p)).join('');
            }
            
        } catch (error) {
            console.error('Error loading related:', error);
            container.innerHTML = '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Gagal memuat produk terkait</p>';
        }
    },

    createProductCardFallback(product) {
        const discount = product.discount || 0;
        const discountedPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
        const stars = this.renderStars(product.rating || 0);
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="/assets/products/${product.image || 'placeholder.jpg'}" 
                         alt="${product.name}"
                         onerror="this.src='/assets/placeholder.jpg'">
                    ${discount > 0 ? `<span class="product-badge discount">-${discount}%</span>` : ''}
                    <button class="product-wishlist" onclick="App.toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand || 'Generic'}</div>
                    <div class="product-name"><a href="/pages/product.html?id=${product.id}">${product.name}</a></div>
                    <div class="product-rating">
                        <span class="stars">${stars}</span>
                        <span>(${product.reviews || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="current">Rp ${discountedPrice.toLocaleString()}</span>
                        ${discount > 0 ? `<span class="original">Rp ${product.price.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="App.addToCart('${product.id}')">
                            <i class="fas fa-cart-plus"></i> Keranjang
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    updateWishlistState() {
        if (!this.product) return;
        const wishlist = JSON.parse(localStorage.getItem('fathur_wishlist')) || [];
        this.isInWishlist = wishlist.some(w => w.id === this.product.id);
        const btn = document.getElementById('wishlistBtn');
        if (btn) {
            btn.classList.toggle('active', this.isInWishlist);
        }
    },

    toggleWishlist() {
        if (!this.product) return;
        if (window.App) {
            App.toggleWishlist(this.product.id);
            this.isInWishlist = !this.isInWishlist;
            const btn = document.getElementById('wishlistBtn');
            if (btn) btn.classList.toggle('active', this.isInWishlist);
        }
    },

    increaseQty() {
        const stock = this.product?.stock || 10;
        if (this.quantity < stock) {
            this.quantity++;
            document.getElementById('quantityDisplay').textContent = this.quantity;
        } else {
            Toast.warning('Stok tidak mencukupi');
        }
    },

    decreaseQty() {
        if (this.quantity > 1) {
            this.quantity--;
            document.getElementById('quantityDisplay').textContent = this.quantity;
        }
    },

    addToCart() {
        if (!this.product) return;
        if (this.product.stock <= 0) {
            Toast.error('Stok produk habis');
            return;
        }
        
        // Tambahkan ke cart dengan quantity
        const existingCart = JSON.parse(localStorage.getItem('fathur_cart')) || [];
        const existing = existingCart.find(c => c.id === this.product.id);
        
        if (existing) {
            const newQty = existing.quantity + this.quantity;
            if (newQty > (this.product.stock || 10)) {
                Toast.warning('Stok tidak mencukupi');
                return;
            }
            existing.quantity = newQty;
        } else {
            existingCart.push({
                id: this.product.id,
                name: this.product.name,
                price: this.product.price,
                discount: this.product.discount || 0,
                image: this.product.image,
                quantity: this.quantity,
                maxStock: this.product.stock || 10
            });
        }
        
        localStorage.setItem('fathur_cart', JSON.stringify(existingCart