// ============================================================
// Cart Page Logic
// ============================================================

const CartPage = {
    cart: [],
    shippingCost: 25000,
    minFreeShipping: 500000,

    init() {
        this.loadCart();
        this.render();
        this.updateSummary();
    },

    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('fathur_cart')) || [];
        document.getElementById('cartCount').textContent = `${this.cart.length} produk di keranjang`;
    },

    render() {
        const container = document.getElementById('cartItems');
        const empty = document.getElementById('emptyCart');
        const summary = document.getElementById('cartSummary');

        if (this.cart.length === 0) {
            if (container) container.innerHTML = '';
            if (empty) empty.style.display = 'block';
            if (summary) summary.style.display = 'none';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (summary) summary.style.display = 'block';

        container.innerHTML = this.cart.map(item => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            const total = price * item.quantity;
            
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="item-image">
                        <img src="/assets/products/${item.image || 'placeholder.jpg'}" 
                             alt="${item.name}"
                             onerror="this.src='/assets/placeholder.jpg'">
                    </div>
                    <div class="item-info">
                        <div class="item-brand">${item.brand || 'Generic'}</div>
                        <div class="item-name"><a href="/pages/product.html?id=${item.id}">${item.name}</a></div>
                        <div class="item-price">
                            Rp ${total.toLocaleString()}
                            ${item.discount > 0 ? `<span class="original">Rp ${(item.price * item.quantity).toLocaleString()}</span>` : ''}
                        </div>
                    </div>
                    <div class="item-actions">
                        <div class="item-qty">
                            <button onclick="CartPage.updateQty('${item.id}', -1)"><i class="fas fa-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button onclick="CartPage.updateQty('${item.id}', 1)"><i class="fas fa-plus"></i></button>
                        </div>
                        <button class="item-remove" onclick="CartPage.removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    updateQty(productId, delta) {
        const item = this.cart.find(c => c.id === productId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            this.removeItem(productId);
            return;
        }
        if (newQty > (item.maxStock || 10)) {
            Toast.warning('Stok tidak mencukupi');
            return;
        }

        item.quantity = newQty;
        this.saveCart();
        this.render();
        this.updateSummary();
    },

    removeItem(productId) {
        this.cart = this.cart.filter(c => c.id !== productId);
        this.saveCart();
        this.render();
        this.updateSummary();
        Toast.info('Produk dihapus dari keranjang');
    },

    updateSummary() {
        if (this.cart.length === 0) {
            document.getElementById('subtotal').textContent = 'Rp 0';
            document.getElementById('shippingCost').textContent = 'Rp 0';
            document.getElementById('discountTotal').textContent = 'Rp 0';
            document.getElementById('grandTotal').textContent = 'Rp 0';
            return;
        }

        let subtotal = 0;
        let discountTotal = 0;

        this.cart.forEach(item => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            subtotal += price * item.quantity;
            if (item.discount > 0) {
                discountTotal += (item.price * item.discount / 100) * item.quantity;
            }
        });

        // Shipping
        const shipping = subtotal >= this.minFreeShipping ? 0 : this.shippingCost;
        const grandTotal = subtotal + shipping;

        document.getElementById('subtotal').textContent = `Rp ${subtotal.toLocaleString()}`;
        document.getElementById('shippingCost').textContent = shipping === 0 ? 'GRATIS' : `Rp ${shipping.toLocaleString()}`;
        document.getElementById('discountTotal').textContent = `Rp ${discountTotal.toLocaleString()}`;
        document.getElementById('grandTotal').textContent = `Rp ${grandTotal.toLocaleString()}`;

        // Update App state
        if (window.App) {
            App.state.cart = this.cart;
            App.saveCart();
            App.updateUI();
        }
    },

    saveCart() {
        localStorage.setItem('fathur_cart', JSON.stringify(this.cart));
        if (window.App) {
            App.state.cart = this.cart;
            App.saveCart();
        }
    }
};

// Global functions
function goToCheckout() {
    if (CartPage.cart.length === 0) {
        Toast.warning('Keranjang kosong');
        return;
    }
    window.location.href = '/pages/checkout.html';
}

function continueShopping() {
    window.location.href = '/pages/products.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => CartPage.init(), 300);
});

window.CartPage = CartPage;
window.goToCheckout = goToCheckout;
window.continueShopping = continueShopping;