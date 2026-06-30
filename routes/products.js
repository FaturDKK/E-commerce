const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const productsPath = path.join(__dirname, '../data/products.json');

const getProducts = () => {
  const data = fs.readFileSync(productsPath);
  return JSON.parse(data);
};

const saveProducts = (products) => {
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
};

// GET semua produk
router.get('/', (req, res) => {
  const products = getProducts();
  res.json(products);
});

// GET produk by ID
router.get('/:id', (req, res) => {
  const products = getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// POST produk baru
router.post('/', (req, res) => {
  const products = getProducts();
  const newProduct = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  saveProducts(products);
  res.status(201).json(newProduct);
});

// PUT update produk
router.put('/:id', (req, res) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  products[index] = { ...products[index], ...req.body };
  saveProducts(products);
  res.json(products[index]);
});

// DELETE produk
router.delete('/:id', (req, res) => {
  const products = getProducts();
  const filtered = products.filter(p => p.id !== req.params.id);
  if (filtered.length === products.length) {
    return res.status(404).json({ error: 'Product not found' });
  }
  saveProducts(filtered);
  res.json({ message: 'Product deleted' });
});

module.exports = router;