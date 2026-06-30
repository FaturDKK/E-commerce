// ============================================================
// FathurProject - Aplikasi Utama
// ============================================================

const App = {
    // State
    state: {
        products: [],
        categories: [],
        cart: JSON.parse(localStorage.getItem('fathur_cart')) || [],
        wishlist: JSON.parse(localStorage.getItem('fathur_wishlist')) || [],
        user: JSON.parse(localStorage.getItem('fathur_user')) || null,
        isLoggedIn: !!localStorage.getItem('fathur_user'),
        loading: false
    },

    // Inisialisasi
    init() {
        this.loadComponents();
        this.loadData();
        this.initEventListeners();
        this.updateUI();
        this.hideLoading();
    },

    // Load Components (Navbar, Footer, dll)
    async loadComponents() {
        try {
            // Navbar
            const navbarContainer = document.getElementById('navbarContainer');
            if (navbarContainer) {
                const navbarResponse = await fetch('/components/navbar.html');
                const navbarHtml = await navbarResponse.text();
                navbarContainer.innerHTML = navbarHtml;
                
                // Update navbar setelah di-render
                setTimeout(() => this.updateNavbar(), 50);
            }

            // Footer
            const footerContainer = document.getElementById('footerContainer');
            if (footerContainer) {
                const footerResponse = await fetch('/components/footer.html');
                const footerHtml = await footerResponse.text();
                footerContainer.innerHTML = footerHtml;
            }
        } catch (error) {
            console.warn('Gagal load komponen:', error);
        }
    },

    // Load Data dari API
    async loadData() {
        try {
            this.state.loading = true;
            
            // Load categories
            const catResponse = await fetch('/api/categories');
            if (catResponse.ok) {
                this.state.categories = await catResponse.json();
            }

            // Load products
            const prodResponse = await fetch('/api/products');
            if (prodResponse.ok) {
                this.state.products = await prodResponse.json();
            }

            // Render categories dan products jika ada elemennya
            this.renderCategories();
            this.renderPopularProducts();
            this.renderFlashProducts();
            this.renderTestimonials();

        } catch (error) {
            console.error('Gagal load data:', error);
            Toast.error('Gagal memuat data. Silakan refresh halaman.');
        } finally {
            this.state.loading = false;
        }
    },

    // Render Categories
    renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;

        if (this.state.categories.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted);">Kategori tidak tersedia</p>';
            return;
        }

        grid.innerHTML = this.state.categories.slice(0, 8).map(cat => `
            <a href="/pages/products.html?category=${encodeURIComponent(cat.name)}" class="category-item">
                <span class="category-icon"><i class="fas ${cat.icon || 'fa-tag'}"></i></span>
                <span class="category-name">${cat.name}</span>
                <span class="category-count">${this.getCategoryCount(cat.name)} produk</span>
            </a>
        `).join('');
    },

    getCategoryCount(categoryName) {
        return this.state.products.filter(p => p.category === categoryName).length;
    },

    // Render Popular Products
    renderPopularProducts() {
        const grid = document.getElementById('popularProducts');
        if (!grid) return;

        const popular = [...this.state.products]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 8);

        grid.innerHTML = popular.map(p => this.createProductCard(p)).join('');
    },

    // Render Flash Sale Products
    renderFlashProducts() {
        const grid = document.getElementById('flashProducts');
        if (!grid) return;

        const flash = this.state.products
            .filter(p => p.discount && p.discount >= 10)
            .slice(0, 8);

        if (flash.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">Tidak ada produk flash sale</p>';
            return;
        }

        grid.innerHTML = flash.map(p => this.createProductCard(p, true)).join('');
    },

    // Create Product Card HTML
    createProductCard(product, isFlash = false) {
        const discount = product.discount || 0;
        const discountedPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
        const inWishlist = this.state.wishlist.some(w => w.id === product.id);
        const inCart = this.state.cart.some(c => c.id === product.id);

        let badge = '';
        if (isFlash || discount >= 10) {
            badge = `<span class="product-badge discount">-${discount}%</span>`;
        } else if (product.rating >= 4.8) {
            badge = `<span class="product-badge hot">🔥 Populer</span>`;
        }

        const stars = this.renderStars(product.rating || 0);

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="/assets/products/${product.image || 'placeholder.jpg'}" 
                         alt="${product.name}"
                         onerror="this.src='/assets/placeholder.jpg'">
                    ${badge}
                    <button class="product-wishlist ${inWishlist ? 'active' : ''}" 
                            onclick="App.toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand || 'Generic'}</div>
                    <div class="product-name">
                        <a href="/pages/product.html?id=${product.id}">${product.name}</a>
                    </div>
                    <div class="product-rating">
                        <span class="stars">${stars}</span>
                        <span>(${product.reviews || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="current">Rp ${discountedPrice.toLocaleString()}</span>
                        ${discount > 0 ? `<span class="original">Rp ${product.price.toLocaleString()}</span>` : ''}
                        ${discount > 0 ? `<span class="discount-badge">${discount}%</span>` : ''}
                    </div>
                    <div class="product-actions">
                        ${inCart ? 
                            `<button class="btn-cart" style="background: var(--success);" onclick="App.goToCart()">
                                <i class="fas fa-check"></i> Di Keranjang
                            </button>` :
                            `<button class="btn-cart" onclick="App.addToCart('${product.id}')">
                                <i class="fas fa-cart-plus"></i> Keranjang
                            </button>`
                        }
                        <button class="btn-wishlist" onclick="App.toggleWishlist('${product.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Render Stars
    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    // Render Testimonials
    renderTestimonials() {
        const grid = document.getElementById('testimonialsGrid');
        if (!grid) return;

        const testimonials = [
            {
                name: 'Rizki Fadillah',
                role: 'Rider Matic',
                text: 'Spare part lengkap dan berkualitas. Pengiriman cepat, packing aman. Recommended banget!',
                rating: 5
            },
            {
                name: 'Siti Aisyah',
                role: 'Motor Enthusiast',
                text: 'Suka banget sama produk racingnya. Performa motor jadi lebih gacor. Harga juga kompetitif.',
                rating: 5
            },
            {
                name: 'Budi Santoso',
                role: 'Workshop Owner',
                text: 'Supplier terpercaya untuk bengkel saya. Kualitas original, harga grosir, dan stok selalu ada.',
                rating: 4
            }
        ];

        grid.innerHTML = testimonials.map(t => `
            <div class="testimonial-card">
                <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
                <p class="testimonial-text">"${t.text}"</p>
                <div class="testimonial-author">
                    <div class="testimonial-avatar">${t.name.charAt(0)}</div>
                    <div>
                        <div class="testimonial-name">${t.name}</div>
                        <div class="testimonial-role">${t.role}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // ============================================================
    // CART FUNCTIONS
    // ============================================================
    addToCart(productId) {
        const product = this.state.products.find(p => p.id === productId);
        if (!product) {
            Toast.error('Produk tidak ditemukan');
            return;
        }

        const existing = this.state.cart.find(c => c.id === productId);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + 1;
        } else {
            this.state.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount || 0,
                image: product.image,
                quantity: 1,
                maxStock: product.stock || 10
            });
        }

        this.saveCart();
        this.updateUI();
        Toast.success(`${product.name} ditambahkan ke keranjang!`);
    },

    removeFromCart(productId) {
        this.state.cart = this.state.cart.filter(c => c.id !== productId);
        this.saveCart();
        this.updateUI();
        Toast.info('Produk dihapus dari keranjang');
    },

    updateCartQuantity(productId, delta) {
        const item = this.state.cart.find(c => c.id === productId);
        if (!item) return;

        const newQty = (item.quantity || 1) + delta;
        if (newQty <= 0) {
            this.removeFromCart(productId);
            return;
        }
        if (newQty > (item.maxStock || 10)) {
            Toast.warning('Stok tidak mencukupi');
            return;
        }

        item.quantity = newQty;
        this.saveCart();
        this.updateUI();
        this.renderCartItems();
    },

    getCartTotal() {
        return this.state.cart.reduce((total, item) => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            return total + (price * item.quantity);
        }, 0);
    },

    getCartCount() {
        return this.state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    },

    saveCart() {
        localStorage.setItem('fathur_cart', JSON.stringify(this.state.cart));
        this.updateCartBadge();
    },

    // ============================================================
    // WISHLIST FUNCTIONS
    // ============================================================
    toggleWishlist(productId) {
        if (!this.state.isLoggedIn) {
            Toast.warning('Login dulu untuk menyimpan wishlist');
            window.location.href = '/pages/login.html';
            return;
        }

        const index = this.state.wishlist.findIndex(w => w.id === productId);
        if (index > -1) {
            this.state.wishlist.splice(index, 1);
            Toast.info('Dihapus dari wishlist');
        } else {
            const product = this.state.products.find(p => p.id === productId);
            if (product) {
                this.state.wishlist.push(product);
                Toast.success('Ditambahkan ke wishlist ❤️');
            }
        }

        localStorage.setItem('fathur_wishlist', JSON.stringify(this.state.wishlist));
        this.updateUI();
        this.renderWishlistItems();
    },

    // ============================================================
    // NAVBAR FUNCTIONS
    // ============================================================
    updateNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Update cart badge
        this.updateCartBadge();

        // Update auth buttons
        const authSection = navbar.querySelector('.navbar-auth');
        if (!authSection) return;

        if (this.state.isLoggedIn && this.state.user) {
            authSection.innerHTML = `
                <button class="navbar-user" onclick="App.goToProfile()">
                    <i class="fas fa-user-circle"></i>
                    <span>${this.state.user.name || 'User'}</span>
                </button>
                <button class="navbar-logout" onclick="App.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            `;
        } else {
            authSection.innerHTML = `
                <a href="/pages/login.html" class="btn-login">Login</a>
                <a href="/pages/register.html" class="btn-register">Daftar</a>
            `;
        }

        // Active link
        const currentPath = window.location.pathname;
        navbar.querySelectorAll('.navbar-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === currentPath);
        });
    },

    updateCartBadge() {
        const count = this.getCartCount();
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    },

    updateUI() {
        this.updateNavbar();
        this.updateCartBadge();
    },

    // ============================================================
    // AUTH FUNCTIONS
    // ============================================================
    login(userData) {
        this.state.user = userData;
        this.state.isLoggedIn = true;
        localStorage.setItem('fathur_user', JSON.stringify(userData));
        this.updateUI();
        Toast.success(`Selamat datang, ${userData.name || 'User'}!`);
    },

    logout() {
        this.state.user = null;
        this.state.isLoggedIn = false;
        localStorage.removeItem('fathur_user');
        this.updateUI();
        Toast.info('Anda telah logout');
        window.location.href = '/';
    },

    // ============================================================
    // NAVIGATION
    // ============================================================
    goToCart() {
        window.location.href = '/pages/cart.html';
    },

    goToWishlist() {
        window.location.href = '/pages/wishlist.html';
    },

    goToProfile() {
        window.location.href = '/pages/profile.html';
    },

    goToProduct(productId) {
        window.location.href = `/pages/product.html?id=${productId}`;
    },

    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    initEventListeners() {
        // Newsletter
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = newsletterForm.querySelector('input');
                if (input && input.value) {
                    Toast.success('Terima kasih telah berlangganan! 📬');
                    input.value = '';
                }
            });
        }

        // Flash timer
        this.startFlashTimer();

        // Scroll reveal
        this.initScrollReveal();

        // Search (di navbar)
        const searchInput = document.querySelector('.navbar-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length > 0) {
                    window.location.href = `/pages/products.html?search=${encodeURIComponent(query)}`;
                }
            });
        }
    },

    // ============================================================
    // FLASH TIMER
    // ============================================================
    startFlashTimer() {
        let hours = 2, minutes = 45, seconds = 30;

        const updateTimer = () => {
            const hEl = document.getElementById('hours');
            const mEl = document.getElementById('minutes');
            const sEl = document.getElementById('seconds');

            if (hEl) hEl.textContent = String(hours).padStart(2, '0');
            if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
            if (sEl) sEl.textContent = String(seconds).padStart(2, '0');

            seconds--;
            if (seconds < 0) {
                seconds = 59;
                minutes--;
                if (minutes < 0) {
                    minutes = 59;
                    hours--;
                    if (hours < 0) {
                        hours = 23;
                        minutes = 59;
                        seconds = 59;
                    }
                }
            }
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    },

    // ============================================================
    // SCROLL REVEAL
    // ============================================================
    initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.product-card, .category-item, .featured-card, .testimonial-card')
            .forEach(el => {
                el.classList.add('scroll-reveal');
                observer.observe(el);
            });
    },

    // ============================================================
    // LOADING
    // ============================================================
    hideLoading() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            setTimeout(() => loading.classList.add('hidden'), 500);
        }
    },

    showLoading() {
        const loading = document.getElementById('loadingScreen');
        if (loading) {
            loading.classList.remove('hidden');
        }
    }
};

// ============================================================
// INITIALIZE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export untuk global
window.App = App;