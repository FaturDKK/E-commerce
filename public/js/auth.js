// ============================================================
// Authentication Module
// ============================================================

const Auth = {
    // Login
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login gagal');
            }

            // Simpan data user
            localStorage.setItem('fathur_user', JSON.stringify(data.user));
            localStorage.setItem('fathur_token', data.token);

            // Update App state
            if (window.App) {
                App.state.user = data.user;
                App.state.isLoggedIn = true;
                App.updateUI();
            }

            Toast.success(`Selamat datang, ${data.user.name || 'User'}!`);
            return { success: true, user: data.user };

        } catch (error) {
            Toast.error(error.message || 'Login gagal, coba lagi');
            return { success: false, error: error.message };
        }
    },

    // Register
    async register(name, email, password) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registrasi gagal');
            }

            Toast.success('Registrasi berhasil! Silakan login.');
            return { success: true };

        } catch (error) {
            Toast.error(error.message || 'Registrasi gagal, coba lagi');
            return { success: false, error: error.message };
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('fathur_user');
        localStorage.removeItem('fathur_token');
        
        if (window.App) {
            App.state.user = null;
            App.state.isLoggedIn = false;
            App.updateUI();
        }

        Toast.info('Anda telah logout');
        window.location.href = '/';
    },

    // Check login status
    isLoggedIn() {
        return !!localStorage.getItem('fathur_user');
    },

    // Get current user
    getUser() {
        const user = localStorage.getItem('fathur_user');
        return user ? JSON.parse(user) : null;
    },

    // Get token
    getToken() {
        return localStorage.getItem('fathur_token');
    },

    // Require auth untuk halaman tertentu
    requireAuth(redirect = '/pages/login.html') {
        if (!this.isLoggedIn()) {
            Toast.warning('Silakan login terlebih dahulu');
            window.location.href = redirect;
            return false;
        }
        return true;
    }
};

window.Auth = Auth;