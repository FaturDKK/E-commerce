// ============================================================
// Admin Dashboard Logic
// ============================================================

const Admin = {
    products: [],
    orders: [],
    users: [],
    categories: [],
    currentPage: 'dashboard',

    init() {
        // Cek login admin
        const user = Auth.getUser();
        if (!user || user.role !== 'admin') {
            Toast.error('Akses ditolak. Login sebagai admin.');
            window.location.href = '/pages/login.html';
            return;
        }
        
        document.getElementById('adminName').textContent = user.name || 'Admin';
        document.getElementById('adminAvatar').textContent = (user.name || 'A').charAt(0);
        
        this.loadData();
        this.initNavigation();
        this.initSearch();
    },

    async loadData() {
        try {
            // Load products
            const prodRes = await fetch('/api/products');
            if (prodRes.ok) this.products = await prodRes.json();
            
            // Load categories
            const catRes = await fetch('/api/categories');
            if (catRes.ok) this.categories = await catRes.json();
            
            // Load users
            const userRes = await fetch('/api/users');
            if (userRes.ok) this.users = await userRes.json();
            
            // Load orders
            const orderRes = await fetch('/api/orders');
            if (orderRes.ok) this.orders = await orderRes.json();
            
            this.renderAll();
            
        } catch (error) {
            console.error('Error loading admin data:', error);
            Toast.error('Gagal memuat data admin');
        }
    },

    renderAll() {
        this.renderStats();
        this.renderProducts();
        this.renderOrders();
        this.renderCustomers();
        this.renderCategories();
        this.renderRecentOrders();
        this.renderCategoryStats();
        this.populateCategorySelect();
    },

    // ============================================================
    // STATS
    // ============================================================
    renderStats() {
        const totalRevenue = this.orders
            .filter(o => o.status === 'completed' || o.status === 'shipped')
            .reduce((sum, o) => sum + (o.total || 0), 0);
        
        document.getElementById('totalProducts').textContent = this.products.length;
        document.getElementById('totalOrders').textContent = this.orders.length;
        document.getElementById('totalUsers').textContent = this.users.length;
        document.getElementById('totalRevenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
    },

    // ============================================================
    // PRODUCTS
    // ============================================================
    renderProducts() {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.products.map(p => {
            const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
            return `
                <tr>
                    <td><img src="/assets/products/${p.image || 'placeholder.jpg'}" class="product-img" onerror="this.src='/assets/placeholder.jpg'"></td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category || '-'}</td>
                    <td>Rp ${price.toLocaleString()}</td>
                    <td>${p.stock || 0}</td>
                    <td>
                        <button class="action-btn edit" onclick="Admin.editProduct('${p.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="Admin.deleteProduct('${p.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async deleteProduct(id) {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        
        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal hapus produk');
            
            Toast.success('Produk berhasil dihapus');
            this.loadData();
            
        } catch (error) {
            Toast.error(error.message);
        }
    },

    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (!product) return;
        
        document.getElementById('editProductId').value = product.id;
        document.getElementById('productModalTitle').textContent = 'Edit Produk';
        document.getElementById('prodName').value = product.name;
        document.getElementById('prodPrice').value = product.price;
        document.getElementById('prodDiscount').value = product.discount || 0;
        document.getElementById('prodStock').value = product.stock || 0;
        document.getElementById('prodRating').value = product.rating || 4;
        document.getElementById('prodCategory').value = product.category || '';
        document.getElementById('prodBrand').value = product.brand || '';
        document.getElementById('prodDescription').value = product.description || '';
        document.getElementById('prodImage').value = product.image || '';
        
        document.getElementById('productModal').classList.add('active');
    },

    async saveProduct(event) {
        event.preventDefault();
        
        const id = document.getElementById('editProductId').value;
        const data = {
            name: document.getElementById('prodName').value,
            price: Number(document.getElementById('prodPrice').value),
            discount: Number(document.getElementById('prodDiscount').value) || 0,
            stock: Number(document.getElementById('prodStock').value),
            rating: Number(document.getElementById('prodRating').value) || 4,
            category: document.getElementById('prodCategory').value,
            brand: document.getElementById('prodBrand').value,
            description: document.getElementById('prodDescription').value,
            image: document.getElementById('prodImage').value || 'placeholder.jpg'
        };
        
        try {
            const url = id ? `/api/products/${id}` : '/api/products';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Gagal simpan produk');
            
            Toast.success(id ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan');
            closeProductModal();
            this.loadData();
            
        } catch (error) {
            Toast.error(error.message);
        }
    },

    populateCategorySelect() {
        const select = document.getElementById('prodCategory');
        if (!select) return;
        
        select.innerHTML = '<option value="">Pilih Kategori</option>';
        this.categories.forEach(cat => {
            select.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
    },

    // ============================================================
    // ORDERS
    // ============================================================
    renderOrders() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.orders.map(o => `
            <tr>
                <td><strong>#${o.orderId || o.id}</strong></td>
                <td>${o.customer?.name || 'Unknown'}</td>
                <td>Rp ${(o.total || 0).toLocaleString()}</td>
                <td><span class="status-badge ${o.status || 'pending'}">${o.status || 'pending'}</span></td>
                <td>${new Date(o.createdAt).toLocaleDateString('id-ID')}</td>
                <td>
                    <select onchange="Admin.updateOrderStatus('${o.id || o.orderId}', this.value)" class="filter-select" style="padding:4px 8px;font-size:0.75rem;">
                        <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');
    },

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            
            if (!response.ok) throw new Error('Gagal update status');
            
            Toast.success(`Status pesanan diubah menjadi ${status}`);
            this.loadData();
            
        } catch (error) {
            Toast.error(error.message);
        }
    },

    // ============================================================
    // CUSTOMERS
    // ============================================================
    renderCustomers() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = this.users.map(u => `
            <tr>
                <td><strong>${u.name || 'Unknown'}</strong></td>
                <td>${u.email}</td>
                <td><span class="status-badge ${u.role === 'admin' ? 'processing' : 'completed'}">${u.role || 'user'}</span></td>
                <td>${new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                <td>
                    <button class="action-btn delete" onclick="Admin.deleteUser('${u.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    async deleteUser(id) {
        if (!confirm('Yakin ingin menghapus user ini?')) return;
        
        try {
            const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal hapus user');
            
            Toast.success('User berhasil dihapus');
            this.loadData();
            
        } catch (error) {
            Toast.error(error.message);
        }
    },

    // ============================================================
    // CATEGORIES
    // ============================================================
    renderCategories() {
        const grid = document.getElementById('categoriesGridAdmin');
        if (!grid) return;
        
        grid.innerHTML = this.categories.map(cat => `
            <div class="category-card">
                <div class="cat-icon"><i class="fas ${cat.icon || 'fa-tag'}"></i></div>
                <div class="cat-name">${cat.name}</div>
                <div class="cat-desc">${cat.description || ''}</div>
                <div class="cat-actions">
                    <button class="action-btn edit" onclick="Admin.editCategory('${cat.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="Admin.deleteCategory('${cat.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    editCategory(id) {
        const category = this.categories.find(c => c.id === id);
        if (!category) return;
        
        document.getElementById('editCategoryId').value = category.id;
        document.getElementById('categoryModalTitle').textContent = 'Edit Kategori';
        document.getElementById('catName').value = category.name;
        document.getElementById('catIcon').value = category.icon || 'fa-tag';
        document.getElementById('catDescription').value = category.description || '';
        
        document.getElementById('categoryModal').classList.add('active');
    },

    async saveCategory(event) {
        event.preventDefault();
        
        const id = document.getElementById('editCategoryId').value;
        const data = {
            name: document.getElementById('catName').value,
            icon: document.getElementById('catIcon').value || 'fa-tag',
            description: document.getElementById('catDescription').value
        };
        
        try {
            const url = id ? `/api/categories/${id}` : '/api/categories';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Gagal simpan kategori');
            
            Toast.success(id ? 'Kategori berhasil diupdate' : 'Kategori berhasil ditambahkan');
            closeCategoryModal();
            this.loadData();
            
        } catch (error) {
            Toast.error(error.message);
        }
    },

    async deleteCategory(id) {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;
        
        try {
            const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Gagal hapus kategori');
            
            Toast.success('Kategori berhasil dihapus');
            this.loadData();
            
        } catch (error) {
            Toast.error(error.message);
        }
    },

    // ============================================================
    // RECENT ORDERS & CATEGORY STATS (Dashboard)
    // ============================================================
    renderRecentOrders() {
        const container = document.getElementById('recentOrders');
        if (!container) return;
        
        const recent = this.orders.slice(0, 5);
        container.innerHTML = recent.map(o => `
            <div class="order-row">
                <span class="order-id">#${o.orderId || o.id}</span>
                <span class="order-customer">${o.customer?.name || 'Unknown'}</span>
                <span class="order-amount">Rp ${(o.total || 0).toLocaleString()}</span>
            </div>
        `).join('');
    },

    renderCategoryStats() {
        const container = document.getElementById('categoryStats');
        if (!container) return;
        
        const stats = {};
        this.products.forEach(p => {
            stats[p.category] = (stats[p.category] || 0) + 1;
        });
        
        const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        container.innerHTML = sorted.map(([name, count]) => `
            <div class="cat-row">
                <span class="cat-name">${name}</span>
                <span class="cat-count">${count} produk</span>
            </div>
        `).join('');
    },

    // ============================================================
    // NAVIGATION
    // ============================================================
    initNavigation() {
        document.querySelectorAll('.sidebar-nav .nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
    },

    switchPage(page) {
        this.currentPage = page;
        
        // Update sidebar
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Update content
        document.querySelectorAll('.admin-page').forEach(el => {
            el.classList.toggle('active', el.id === `page-${page}`);
        });
    },

    initSearch() {
        const search = document.getElementById('adminSearch');
        if (!search) return;
        
        search.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (this.currentPage === 'products') {
                this.filterProducts(query);
            }
        });
    },

    filterProducts(query) {
        const rows = document.querySelectorAll('#productsTableBody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }
};

// ============================================================
// GLOBAL FUNCTIONS
// ============================================================
function toggleSidebar() {
    document.getElementById('adminSidebar').classList.toggle('open');
}

function openProductModal() {
    document.getElementById('editProductId').value = '';
    document.getElementById('productModalTitle').textContent = 'Tambah Produk';
    document.getElementById('productForm').reset();
    document.getElementById('prodDiscount').value = 0;
    document.getElementById('prodRating').value = 4;
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function openCategoryModal() {
    document.getElementById('editCategoryId').value = '';
    document.getElementById('categoryModalTitle').textContent = 'Tambah Kategori';
    document.getElementById('categoryForm').reset();
    document.getElementById('catIcon').value = 'fa-tag';
    document.getElementById('categoryModal').classList.add('active');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
}

function handleAdminLogout() {
    Auth.logout();
}

// ============================================================
// INITIALIZE
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => Admin.init(), 300);
});

window.Admin = Admin;
window.toggleSidebar = toggleSidebar;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.handleAdminLogout = handleAdminLogout;