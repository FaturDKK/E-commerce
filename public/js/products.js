// ============================================================
// Products Page Logic
// ============================================================

const ProductsPage = {
    products: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 12,
    filters: {
        search: '',
        category: '',
        sort: 'popular',
        priceMin: 0,
        priceMax: 5000000,
        rating: 0,
        inStock: false
    },

    init() {
        this.loadProducts();
        this.initFilters();
        this.initEvents();
    },

    async loadProducts() {
        const skeleton = document.getElementById('productsSkeleton');
        const grid = document.getElementById('productsGrid');
        
        if (skeleton) skeleton.style.display = 'grid';
        if (grid) grid.innerHTML = '';

        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Gagal load produk');
            
            this.products = await response.json();
            this.filteredProducts = [...this.products];
            
            // Parse URL params
            const params = new URLSearchParams(window.location.search);
            const searchParam = params.get('search');
            const categoryParam = params.get('category');
            
            if (searchParam) {
                this.filters.search = searchParam;
                document.getElementById('searchInput').value = searchParam;
            }
            if (categoryParam) {
                this.filters.category = categoryParam;
                document.getElementById('categoryFilter').value = categoryParam;
            }
            
            this.populateCategories();
            this.applyFilters();
            this.render();

        } catch (error) {
            console.error('Error:', error);
            Toast.error('Gagal memuat produk');
            if (grid) grid.innerHTML = `<div class="no-products"><i class="fas fa-exclamation-circle"></i><h3>Gagal memuat data</h3><p>${error.message}</p></div>`;
        } finally {
            if (skeleton) skeleton.style.display = 'none';
        }
    },

    populateCategories() {
        const select = document.getElementById('categoryFilter');
        if (!select) return;
        
        const categories = [...new Set(this.products.map(p => p.category))];
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    },

    initFilters() {
        // Range slider labels
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const minLabel = document.getElementById('minPriceLabel');
        const maxLabel = document.getElementById('maxPriceLabel');
        
        if (priceMin) {
            priceMin.addEventListener('input', () => {
                if (minLabel) minLabel.textContent = Number(priceMin.value).toLocaleString();
                this.filters.priceMin = Number(priceMin.value);
            });
        }
        if (priceMax) {
            priceMax.addEventListener('input', () => {
                if (maxLabel) maxLabel.textContent = Number(priceMax.value).toLocaleString();
                this.filters.priceMax = Number(priceMax.value);
            });
        }
    },

    initEvents() {
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
                this.render();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
                this.render();
            });
        }

        // Sort filter
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.filters.sort = e.target.value;
                this.applyFilters();
                this.render();
            });
        }

        // Rating filter
        document.querySelectorAll('input[name="rating"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.filters.rating = Number(e.target.value);
                this.applyFilters();
                this.render();
            });
        });

        // In stock filter
        const stockCheck = document.getElementById('inStockOnly');
        if (stockCheck) {
            stockCheck.addEventListener('change', (e) => {
                this.filters.inStock = e.target.checked;
                this.applyFilters();
                this.render();
            });
        }
    },

    applyFilters() {
        const { search, category, sort, priceMin, priceMax, rating, inStock } = this.filters;
        
        this.filteredProducts = this.products.filter(p => {
            // Search
            if (search) {
                const q = search.toLowerCase();
                const match = p.name.toLowerCase().includes(q) ||
                             p.brand.toLowerCase().includes(q) ||
                             p.category.toLowerCase().includes(q) ||
                             p.description.toLowerCase().includes(q);
                if (!match) return false;
            }
            
            // Category
            if (category && p.category !== category) return false;
            
            // Price
            const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
            if (price < priceMin || price > priceMax) return false;
            
            // Rating
            if (rating > 0 && (p.rating || 0) < rating) return false;
            
            // Stock
            if (inStock && (p.stock || 0) <= 0) return false;
            
            return true;
        });

        // Sort
        switch (sort) {
            case 'popular':
                this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'price-asc':
                this.filteredProducts.sort((a, b) => {
                    const pa = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                    const pb = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                    return pa - pb;
                });
                break;
            case 'price-desc':
                this.filteredProducts.sort((a, b) => {
                    const pa = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                    const pb = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                    return pb - pa;
                });
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            default:
                break;
        }

        this.currentPage = 1;
    },

    render() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageItems = this.filteredProducts.slice(start, end);

        if (pageItems.length === 0) {
            grid.innerHTML = `
                <div class="no-products">
                    <i class="fas fa-search"></i>
                    <h3>Tidak ada produk</h3>
                    <p>Coba ubah filter atau kata kunci pencarian</p>
                </div>
            `;
        } else {
            grid.innerHTML = pageItems.map(p => {
                // Gunakan App.createProductCard jika tersedia
                if (window.App && typeof App.createProductCard === 'function') {
                    return App.createProductCard(p);
                }
                return this.createProductCardFallback(p);
            }).join('');
        }

        this.updatePagination();
    },

    createProductCardFallback(product) {
        const discount = product.discount || 0;
        const discountedPrice = discount > 0 ? product.price * (1 - discount / 100) : product.price;
        const stars = this.renderStars(product.rating || 0);

        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="/assets/products/${product.image || 'placeholder.jpg'}" 
                         alt="${product.name}"
                         onerror="this.src='/assets/placeholder.jpg'">
                    ${discount > 0 ? `<span class="product-badge discount">-${discount}%</span>` : ''}
                    <button class="product-wishlist" onclick="App.toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-brand">${product.brand || 'Generic'}</div>
                    <div class="product-name"><a href="/pages/product.html?id=${product.id}">${product.name}</a></div>
                    <div class="product-rating">
                        <span class="stars">${stars}</span>
                        <span>(${product.reviews || 0})</span>
                    </div>
                    <div class="product-price">
                        <span class="current">Rp ${discountedPrice.toLocaleString()}</span>
                        ${discount > 0 ? `<span class="original">Rp ${product.price.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="App.addToCart('${product.id}')">
                            <i class="fas fa-cart-plus"></i> Keranjang
                        </button>
                        <button class="btn-wishlist" onclick="App.toggleWishlist('${product.id}')">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    renderStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
    },

    updatePagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');

        if (pageInfo) pageInfo.textContent = `Halaman ${this.currentPage} dari ${totalPages || 1}`;
        if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentPage >= totalPages;
    },

    changePage(delta) {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const newPage = this.currentPage + delta;
        if (newPage < 1 || newPage > totalPages) return;
        this.currentPage = newPage;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Global functions
function toggleFilterDrawer() {
    const drawer = document.getElementById('filterDrawer');
    if (drawer) drawer.classList.toggle('open');
}

function applyFilters() {
    if (ProductsPage) {
        ProductsPage.applyFilters();
        ProductsPage.render();
        const drawer = document.getElementById('filterDrawer');
        if (drawer) drawer.classList.remove('open');
        Toast.info('Filter diterapkan');
    }
}

function changePage(delta) {
    if (ProductsPage) ProductsPage.changePage(delta);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Tunggu App selesai load
    setTimeout(() => ProductsPage.init(), 300);
});

window.ProductsPage = ProductsPage;
window.toggleFilterDrawer = toggleFilterDrawer;
window.applyFilters = applyFilters;
window.changePage = changePage;