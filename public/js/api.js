// ============================================================
// API Client
// ============================================================

const API = {
    baseURL: '/api',

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth token
        const token = localStorage.getItem('fathur_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return { success: true, data };

        } catch (error) {
            console.error('API Error:', error);
            return { success: false, error: error.message };
        }
    },

    // Products
    async getProducts() {
        return this.request('/products');
    },

    async getProduct(id) {
        return this.request(`/products/${id}`);
    },

    async createProduct(product) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
    },

    async updateProduct(id, product) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    },

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    },

    // Orders
    async getOrders() {
        return this.request('/orders');
    },

    async getUserOrders(userId) {
        return this.request(`/orders/user/${userId}`);
    },

    async createOrder(order) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });
    },

    async updateOrder(id, order) {
        return this.request(`/orders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(order)
        });
    },

    async deleteOrder(id) {
        return this.request(`/orders/${id}`, {
            method: 'DELETE'
        });
    },

    // Users
    async getUsers() {
        return this.request('/users');
    },

    async getUser(id) {
        return this.request(`/users/${id}`);
    },

    async updateUser(id, user) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(user)
        });
    },

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    },

    // Auth
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    },

    async register(name, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }
};

window.API = API;