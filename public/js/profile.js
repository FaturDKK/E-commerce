// ============================================================
// Profile Page Logic
// ============================================================

const ProfilePage = {
    user: null,

    init() {
        if (!Auth.requireAuth()) return;
        this.loadUser();
        this.renderProfile();
    },

    loadUser() {
        this.user = Auth.getUser();
        if (!this.user) {
            window.location.href = '/pages/login.html';
            return;
        }
    },

    renderProfile() {
        const initial = this.user.name ? this.user.name.charAt(0).toUpperCase() : 'U';
        document.getElementById('avatarInitial').textContent = initial;
        document.getElementById('profileName').textContent = this.user.name || 'User';
        document.getElementById('profileEmail').textContent = this.user.email || '';
        document.getElementById('profileFullName').value = this.user.name || '';
        document.getElementById('profileEmailInput').value = this.user.email || '';
        document.getElementById('profilePhone').value = this.user.phone || '';
        document.getElementById('profileAddress').value = this.user.address || '';
    },

    async updateProfile(event) {
        event.preventDefault();
        
        const name = document.getElementById('profileFullName').value.trim();
        const email = document.getElementById('profileEmailInput').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();
        const address = document.getElementById('profileAddress').value.trim();

        if (!name || !email) {
            Toast.error('Nama dan email wajib diisi');
            return;
        }

        try {
            const response = await fetch(`/api/users/${this.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, address })
            });

            if (!response.ok) throw new Error('Gagal update profil');

            const updatedUser = await response.json();
            
            // Update local storage
            this.user = { ...this.user, ...updatedUser };
            localStorage.setItem('fathur_user', JSON.stringify(this.user));
            
            if (window.App) {
                App.state.user = this.user;
            }

            Toast.success('Profil berhasil diperbarui!');
            this.renderProfile();

        } catch (error) {
            Toast.error(error.message || 'Gagal update profil');
        }
    },

    async changePassword(event) {
        event.preventDefault();
        
        const oldPassword = document.getElementById('oldPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword.length < 8) {
            Toast.error('Password minimal 8 karakter');
            return;
        }

        if (newPassword !== confirmPassword) {
            Toast.error('Konfirmasi password tidak sesuai');
            return;
        }

        try {
            const response = await fetch(`/api/users/${this.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });

            if (!response.ok) throw new Error('Gagal ubah password');

            Toast.success('Password berhasil diubah!');
            document.getElementById('passwordForm').reset();

        } catch (error) {
            Toast.error(error.message || 'Gagal ubah password');
        }
    }
};

// Global functions
function handleLogout() {
    Auth.logout();
}

function togglePassword(id) {
    const input = document.getElementById(id);
    const btn = input.parentElement.querySelector('button');
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => ProfilePage.init(), 300);
});

window.ProfilePage = ProfilePage;
window.handleLogout = handleLogout;
window.togglePassword = togglePassword;