const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');
const SECRET_KEY = 'fathurproject_secret_key_2026';

const getUsers = () => {
    const data = fs.readFileSync(usersPath);
    return JSON.parse(data);
};

// Verifikasi token JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token tidak valid' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token expired atau tidak valid' });
    }
};

// Cek role admin
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const users = getUsers();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak. Admin required.' });
    }
    
    next();
};

// Cek role user atau admin
const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

module.exports = { verifyToken, isAdmin, isUser };