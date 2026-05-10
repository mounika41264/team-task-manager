const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const task = new Task({ title: req.body.title, createdBy: req.user.id });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;