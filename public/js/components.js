// ============================================================
// Components Loader
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load navbar
        const navbar = document.getElementById('navbarContainer');
        if (navbar) {
            const response = await fetch('/components/navbar.html');
            if (response.ok) {
                navbar.innerHTML = await response.text();
                console.log('✅ Navbar loaded');
            } else {
                console.warn('⚠️ Navbar not found, status:', response.status);
                navbar.innerHTML = '<nav class="navbar">Navbar Error</nav>';
            }
        }

        // Load footer
        const footer = document.getElementById('footerContainer');
        if (footer) {
            const response = await fetch('/components/footer.html');
            if (response.ok) {
                footer.innerHTML = await response.text();
                console.log('✅ Footer loaded');
            } else {
                console.warn('⚠️ Footer not found, status:', response.status);
                footer.innerHTML = '<footer class="footer">Footer Error</footer>';
            }
        }

        // Update UI setelah components loaded
        if (window.App) {
            setTimeout(() => {
                App.updateUI();
                console.log('✅ UI Updated');
            }, 200);
        }

    } catch (error) {
        console.error('❌ Gagal load komponen:', error);
    }
});

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}
