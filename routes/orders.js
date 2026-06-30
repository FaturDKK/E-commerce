const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ordersPath = path.join(__dirname, '../data/orders.json');

const getOrders = () => {
  const data = fs.readFileSync(ordersPath);
  return JSON.parse(data);
};

const saveOrders = (orders) => {
  fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
};

// GET semua orders
router.get('/', (req, res) => {
  const orders = getOrders();
  res.json(orders);
});

// GET orders by user ID
router.get('/user/:userId', (req, res) => {
  const orders = getOrders();
  const userOrders = orders.filter(o => o.userId === req.params.userId);
  res.json(userOrders);
});

// POST order baru
router.post('/', (req, res) => {
  const orders = getOrders();
  const newOrder = {
    id: uuidv4(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  orders.push(newOrder);
  saveOrders(orders);
  res.status(201).json(newOrder);
});

// PUT update order status
router.put('/:id', (req, res) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  orders[index] = { ...orders[index], ...req.body };
  saveOrders(orders);
  res.json(orders[index]);
});

// DELETE order
router.delete('/:id', (req, res) => {
  const orders = getOrders();
  const filtered = orders.filter(o => o.id !== req.params.id);
  if (filtered.length === orders.length) {
    return res.status(404).json({ error: 'Order not found' });
  }
  saveOrders(filtered);
  res.json({ message: 'Order deleted' });
});

module.exports = router;