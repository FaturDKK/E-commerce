// ============================================================
// Orders Page Logic
// ============================================================

const OrdersPage = {
    orders: [],
    filteredOrders: [],
    currentFilter: 'all',

    init() {
        if (!Auth.requireAuth()) return;
        this.loadOrders();
        this.renderUserInfo();
        this.setupFilters();
    },

    loadOrders() {
        const allOrders = JSON.parse(localStorage.getItem('fathur_orders')) || [];
        const user = Auth.getUser();
        
        if (user) {
            this.orders = allOrders.filter(o => o.customer?.email === user.email);
        } else {
            this.orders = [];
        }
        
        this.filterOrders('all');
    },

    renderUserInfo() {
        const user = Auth.getUser();
        if (!user) return;
        
        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        document.getElementById('ordersInitial').textContent = initial;
        document.getElementById('ordersName').textContent = user.name || 'User';
        document.getElementById('ordersEmail').textContent = user.email || '';
    },

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterOrders(btn.dataset.filter);
            });
        });
    },

    filterOrders(status) {
        this.currentFilter = status;
        
        if (status === 'all') {
            this.filteredOrders = [...this.orders];
        } else {
            this.filteredOrders = this.orders.filter(o => o.status === status);
        }
        
        this.renderOrders();
    },

    renderOrders() {
        const container = document.getElementById('ordersList');
        const empty = document.getElementById('emptyOrders');

        if (this.filteredOrders.length === 0) {
            if (container) container.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }

        if (empty) empty.style.display = 'none';

        container.innerHTML = this.filteredOrders.map(order => {
            const statusMap = {
                pending: { label: 'Menunggu Pembayaran', color: 'var(--warning)' },
                processing: { label: 'Diproses', color: 'var(--info)' },
                shipped: { label: 'Dikirim', color: 'var(--primary)' },
                completed: { label: 'Selesai', color: 'var(--success)' },
                cancelled: { label: 'Dibatalkan', color: 'var(--danger)' }
            };
            
            const statusInfo = statusMap[order.status] || statusMap.pending;
            const itemsHtml = order.items.map(item => `
                <div class="order-item">
                    <img src="/assets/products/${item.image || 'placeholder.jpg'}" 
                         alt="${item.name}"
                         onerror="this.src='/assets/placeholder.jpg'">
                    <div>
                        <div class="item-name">${item.name}</div>
                        <div class="item-qty">${item.quantity} x Rp ${item.price.toLocaleString()}</div>
                    </div>
                </div>
            `).join('');

            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>
                            <span class="order-id">#${order.orderId}</span>
                            <span class="order-date">${new Date(order.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}</span>
                        </div>
                        <span class="order-status" style="color:${statusInfo.color};background:${statusInfo.color}15;padding:4px 14px;border-radius:20px;font-size:0.8rem;font-weight:600;">
                            ${statusInfo.label}
                        </span>
                    </div>
                    <div class="order-body">
                        ${itemsHtml}
                    </div>
                    <div class="order-footer">
                        <span class="order-total">Total: <strong>Rp ${order.total.toLocaleString()}</strong></span>
                        <button class="btn-secondary" style="padding:6px 16px;font-size:0.8rem;" onclick="OrdersPage.viewOrder('${order.orderId}')">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    viewOrder(orderId) {
        Toast.info(`Detail pesanan #${orderId}`);
        // Bisa diimplementasikan untuk menampilkan modal detail
    }
};

// Global functions
function handleLogout() {
    Auth.logout();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => OrdersPage.init(), 300);
});

window.OrdersPage = OrdersPage;
window.handleLogout = handleLogout;