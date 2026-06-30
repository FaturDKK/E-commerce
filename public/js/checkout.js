// ============================================================
// Checkout Page Logic
// ============================================================

const CheckoutPage = {
    cart: [],
    shippingCost: 25000,
    orderId: null,

    init() {
        this.loadCart();
        this.renderOrderItems();
        this.updateSummary();
        this.loadUserData();
    },

    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('fathur_cart')) || [];
        if (this.cart.length === 0) {
            Toast.warning('Keranjang kosong');
            window.location.href = '/pages/cart.html';
            return;
        }
    },

    loadUserData() {
        const user = Auth.getUser();
        if (user) {
            document.getElementById('fullName').value = user.name || '';
            document.getElementById('email').value = user.email || '';
        }
    },

    renderOrderItems() {
        const container = document.getElementById('orderItems');
        if (!container) return;

        container.innerHTML = this.cart.map(item => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            const total = price * item.quantity;
            
            return `
                <div class="order-item-summary">
                    <img src="/assets/products/${item.image || 'placeholder.jpg'}" 
                         alt="${item.name}"
                         onerror="this.src='/assets/placeholder.jpg'">
                    <div class="item-detail">
                        <div class="name">${item.name}</div>
                        <div class="qty">${item.quantity} x Rp ${price.toLocaleString()}</div>
                    </div>
                    <div class="item-total">Rp ${total.toLocaleString()}</div>
                </div>
            `;
        }).join('');
    },

    updateSummary() {
        let subtotal = 0;
        this.cart.forEach(item => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            subtotal += price * item.quantity;
        });

        // Get selected shipping
        const selectedShipping = document.querySelector('input[name="shipping"]:checked');
        let shippingCost = 25000;
        if (selectedShipping) {
            const value = selectedShipping.value;
            const costs = { jne: 25000, tiki: 35000, grab: 50000 };
            shippingCost = costs[value] || 25000;
        }

        const total = subtotal + shippingCost;

        document.getElementById('checkoutSubtotal').textContent = `Rp ${subtotal.toLocaleString()}`;
        document.getElementById('checkoutShipping').textContent = `Rp ${shippingCost.toLocaleString()}`;
        document.getElementById('checkoutTotal').textContent = `Rp ${total.toLocaleString()}`;

        this.shippingCost = shippingCost;
    },

    generateOrderId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        return `ORD-${year}${month}${day}-${random}`;
    },

    validateForm() {
        const fields = ['fullName', 'email', 'phone', 'address', 'city', 'province', 'postalCode'];
        for (const field of fields) {
            const el = document.getElementById(field);
            if (!el || !el.value.trim()) {
                Toast.error(`Mohon isi ${el?.placeholder || field}`);
                el?.focus();
                return false;
            }
        }
        
        // Validate email
        const email = document.getElementById('email').value;
        if (!email.includes('@') || !email.includes('.')) {
            Toast.error('Email tidak valid');
            return false;
        }
        
        return true;
    },

    async processOrder() {
        if (!this.validateForm()) return;
        if (this.cart.length === 0) {
            Toast.error('Keranjang kosong');
            return;
        }

        // Get form data
        const orderData = {
            orderId: this.generateOrderId(),
            customer: {
                name: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value
            },
            address: {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                province: document.getElementById('province').value,
                postalCode: document.getElementById('postalCode').value,
                country: document.getElementById('country').value
            },
            shipping: document.querySelector('input[name="shipping"]:checked')?.value || 'jne',
            payment: document.querySelector('input[name="payment"]:checked')?.value || 'bank_transfer',
            items: this.cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                discount: item.discount || 0,
                quantity: item.quantity,
                image: item.image
            })),
            subtotal: 0,
            shippingCost: this.shippingCost,
            total: 0,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Calculate totals
        let subtotal = 0;
        orderData.items.forEach(item => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            subtotal += price * item.quantity;
        });
        orderData.subtotal = subtotal;
        orderData.total = subtotal + this.shippingCost;

        // Save to orders
        const orders = JSON.parse(localStorage.getItem('fathur_orders')) || [];
        orders.push(orderData);
        localStorage.setItem('fathur_orders', JSON.stringify(orders));

        // Clear cart
        localStorage.removeItem('fathur_cart');
        if (window.App) {
            App.state.cart = [];
            App.saveCart();
        }

        this.orderId = orderData.orderId;
        document.getElementById('orderIdDisplay').textContent = `Nomor Pesanan: #${this.orderId}`;
        document.getElementById('successModal').classList.add('active');
        
        Toast.success('Pesanan berhasil dibuat!');
    }
};

// Global functions
function processOrder() {
    CheckoutPage.processOrder();
}

function goToOrders() {
    document.getElementById('successModal').classList.remove('active');
    window.location.href = '/pages/orders.html';
}

function continueShopping() {
    document.getElementById('successModal').classList.remove('active');
    window.location.href = '/';
}

// Update shipping cost on change
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[name="shipping"]').forEach(input => {
        input.addEventListener('change', () => CheckoutPage.updateSummary());
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => CheckoutPage.init(), 300);
});

window.CheckoutPage = CheckoutPage;
window.processOrder = processOrder;
window.goToOrders = goToOrders;
window.continueShopping = continueShopping;