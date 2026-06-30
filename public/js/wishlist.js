// ============================================================
// Wishlist Page Logic
// ============================================================

const WishlistPage = {
    wishlist: [],

    init() {
        this.loadWishlist();
        this.render();
    },

    loadWishlist() {
        this.wishlist = JSON.parse(localStorage.getItem('fathur_wishlist')) || [];
        document.getElementById('wishlistCount').textContent = `${this.wishlist.length} produk favorit`;
    },

    render() {
        const grid = document.getElementById('wishlistGrid');
        const empty = document.getElementById('emptyWishlist');

        if (this.wishlist.length === 0) {
            if (grid) grid.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }

        if (empty) empty.style.display = 'none';

        grid.innerHTML = this.wishlist.map(p => {
            const discount = p.discount || 0;
            const discountedPrice = discount > 0 ? p.price * (1 - discount / 100) : p.price;
            const stars = this.renderStars(p.rating || 0);

            return `
                <div class="wishlist-item" data-id="${p.id}">
                    <div class="item-image">
                        <img src="/assets/products/${p.image || 'placeholder.jpg'}" 
                             alt="${p.name}"
                             onerror="this.src='/assets/placeholder.jpg'">
                        <button class="item-remove-wishlist" onclick="WishlistPage.removeFromWishlist('${p.id}')">
                            <i class="fas fa-times"></i>
                        </button>
                        ${discount > 0 ? `<span class="product-badge discount" style="position:absolute;top:12px;left:12px;">-${discount}%</span>` : ''}
                    </div>
                    <div class="item-info">
                        <div class="item-brand">${p.brand || 'Generic'}</div>
                        <div class="item-name"><a href="/pages/product.html?id=${p.id}">${p.name}</a></div>
                        <div class="item-rating">
                            <span class="stars">${stars}</span>
                            <span>(${p.reviews || 0})</span>
                        </div>
                        <div class="item-price">
                            <span class="current">Rp ${discountedPrice.toLocaleString()}</span>
                            ${discount > 0 ? `<span class="original">Rp ${p.price.toLocaleString()}</span>` : ''}
                        </div>
                        <div class="item-actions-wishlist">
                            <button class="btn-cart" onclick="WishlistPage.moveToCart('${p.id}')">
                                <i class="fas fa-cart-plus"></i> Masukkan Keranjang
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(p => p.id !== productId);
        localStorage.setItem('fathur_wishlist', JSON.stringify(this.wishlist));
        
        if (window.App) {
            App.state.wishlist = this.wishlist;
        }
        
        this.loadWishlist();
        this.render();
        Toast.info('Dihapus dari wishlist');
    },

    moveToCart(productId) {
        const product = this.wishlist.find(p => p.id === productId);
        if (!product) return;

        // Gunakan App.addToCart jika tersedia
        if (window.App) {
            App.addToCart(productId);
        } else {
            // Fallback
            const cart = JSON.parse(localStorage.getItem('fathur_cart')) || [];
            const existing = cart.find(c => c.id === productId);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    discount: product.discount || 0,
                    image: product.image,
                    quantity: 1,
                    maxStock: product.stock || 10
                });
            }
            localStorage.setItem('fathur_cart', JSON.stringify(cart));
            Toast.success(`${product.name} ditambahkan ke keranjang!`);
        }

        // Remove from wishlist after moving to cart
        this.removeFromWishlist(productId);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => WishlistPage.init(), 300);
});

window.WishlistPage = WishlistPage;