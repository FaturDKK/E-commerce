const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfigurasi storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/assets/products');
        // Buat folder jika belum ada
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// Filter file
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diizinkan (JPEG, PNG, GIF, WebP)'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// Middleware untuk single file upload
const uploadSingle = upload.single('image');

// Middleware untuk multiple file upload
const uploadMultiple = upload.array('images', 5);

module.exports = { upload, uploadSingle, uploadMultiple };