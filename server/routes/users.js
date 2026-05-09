const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

let users = [];

router.get('/', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  res.json(users);
});

router.get('/:id', auth, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

module.exports = router;