const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Path ke file data kategori
const categoriesPath = path.join(__dirname, '../data/categories.json');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Ambil semua kategori dari file JSON
const getCategories = () => {
    try {
        const data = fs.readFileSync(categoriesPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Jika file tidak ada atau error, return array kosong
        return [];
    }
};

// Simpan kategori ke file JSON
const saveCategories = (categories) => {
    fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf8');
};

// ============================================================
// ROUTES
// ============================================================

/**
 * GET /api/categories
 * Ambil semua kategori
 */
router.get('/', (req, res) => {
    try {
        const categories = getCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data kategori' });
    }
});

/**
 * GET /api/categories/:id
 * Ambil satu kategori berdasarkan ID
 */
router.get('/:id', (req, res) => {
    try {
        const categories = getCategories();
        const category = categories.find(c => c.id === req.params.id);
        
        if (!category) {
            return res.status(404).json({ error: 'Kategori tidak ditemukan' });
        }
        
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil data kategori' });
    }
});

/**
 * POST /api/categories
 * Tambah kategori baru
 * Body: { name, icon, description }
 */
router.post('/', (req, res) => {
    try {
        const { name, icon, description } = req.body;
        
        // Validasi: name wajib diisi
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Nama kategori wajib diisi' });
        }
        
        const categories = getCategories();
        
        // Cek apakah kategori sudah ada
        if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            return res.status(400).json({ error: 'Kategori sudah ada' });
        }
        
        const newCategory = {
            id: uuidv4(),
            name: name.trim(),
            icon: icon || 'fa-tag',
            description: description || '',
            createdAt: new Date().toISOString()
        };
        
        categories.push(newCategory);
        saveCategories(categories);
        
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: 'Gagal menambah kategori' });
    }
});

/**
 * PUT /api/categories/:id
 * Update kategori berdasarkan ID
 * Body: { name, icon, description }
 */
router.put('/:id', (req, res) => {
    try {
        const { name, icon, description } = req.body;
        const categories = getCategories();
        const index = categories.findIndex(c => c.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Kategori tidak ditemukan' });
        }
        
        // Validasi: name wajib diisi
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Nama kategori wajib diisi' });
        }
        
        // Cek duplikat nama (kecuali dirinya sendiri)
        const duplicate = categories.some((c, i) => 
            i !== index && c.name.toLowerCase() === name.toLowerCase()
        );
        if (duplicate) {
            return res.status(400).json({ error: 'Nama kategori sudah digunakan' });
        }
        
        // Update kategori
        categories[index] = {
            ...categories[index],
            name: name.trim(),
            icon: icon || categories[index].icon || 'fa-tag',
            description: description || categories[index].description || '',
            updatedAt: new Date().toISOString()
        };
        
        saveCategories(categories);
        res.json(categories[index]);
    } catch (error) {
        res.status(500).json({ error: 'Gagal update kategori' });
    }
});

/**
 * DELETE /api/categories/:id
 * Hapus kategori berdasarkan ID
 */
router.delete('/:id', (req, res) => {
    try {
        const categories = getCategories();
        const filtered = categories.filter(c => c.id !== req.params.id);
        
        if (filtered.length === categories.length) {
            return res.status(404).json({ error: 'Kategori tidak ditemukan' });
        }
        
        saveCategories(filtered);
        res.json({ message: 'Kategori berhasil dihapus', id: req.params.id });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menghapus kategori' });
    }
});

/**
 * GET /api/categories/:name/products
 * Ambil semua produk dalam satu kategori (optional)
 */
router.get('/:name/products', (req, res) => {
    try {
        const categoryName = req.params.name;
        const productsPath = path.join(__dirname, '../data/products.json');
        
        // Baca file products
        let products = [];
        try {
            const data = fs.readFileSync(productsPath, 'utf8');
            products = JSON.parse(data);
        } catch {
            products = [];
        }
        
        // Filter produk berdasarkan kategori
        const filtered = products.filter(p => 
            p.category && p.category.toLowerCase() === categoryName.toLowerCase()
        );
        
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil produk dalam kategori' });
    }
});

module.exports = router;