const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

let tasks = [];
let taskId = 1;

// GET ALL TASKS
router.get('/', auth, (req, res) => {
  const myTasks = req.user.role === 'admin' 
    ? tasks 
    : tasks.filter(t => t.assigneeId === req.user.id);
  res.json(myTasks);
});

// CREATE TASK
router.post('/', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  const { title, description, projectId, assigneeId, priority, dueDate } = req.body;
  if (!title || !projectId) {
    return res.status(400).json({ message: 'Title and project required' });
  }
  const task = {
    id: taskId++,
    title,
    description,
    status: 'todo',
    priority: priority || 'medium',
    projectId,
    assigneeId,
    dueDate,
    createdAt: new Date()
  };
  tasks.push(task);
  res.status(201).json(task);
});

// UPDATE TASK
router.put('/:id', auth, (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Not found' });
  const { title, status, priority, assigneeId, dueDate } = req.body;
  if (title) task.title = title;
  if (status) task.status = status;
  if (priority) task.priority = priority;
  if (assigneeId) task.assigneeId = assigneeId;
  if (dueDate) task.dueDate = dueDate;
  res.json(task);
});

// DELETE TASK
router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

// UPDATE STATUS
router.patch('/:id/status', auth, (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ message: 'Not found' });
  task.status = req.body.status;
  res.json(task);
});

module.exports = router;