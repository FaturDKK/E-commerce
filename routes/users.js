const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersPath = path.join(__dirname, '../data/users.json');

const getUsers = () => {
  const data = fs.readFileSync(usersPath);
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
};

// GET semua user (admin)
router.get('/', (req, res) => {
  const users = getUsers();
  res.json(users);
});

// GET user by ID
router.get('/:id', (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// PUT update user
router.put('/:id', async (req, res) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  
  const { name, email, password } = req.body;
  if (password) {
    users[index].password = await bcrypt.hash(password, 10);
  }
  if (name) users[index].name = name;
  if (email) users[index].email = email;
  
  saveUsers(users);
  res.json(users[index]);
});

// DELETE user
router.delete('/:id', (req, res) => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== req.params.id);
  if (filtered.length === users.length) {
    return res.status(404).json({ error: 'User not found' });
  }
  saveUsers(filtered);
  res.json({ message: 'User deleted' });
});

module.exports = router;