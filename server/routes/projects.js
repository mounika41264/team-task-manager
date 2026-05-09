const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

let projects = [];
let projectId = 1;

// GET ALL PROJECTS
router.get('/', auth, (req, res) => {
  const myProjects = projects.filter(p => 
    p.members.includes(req.user.id) || req.user.role === 'admin'
  );
  res.json(myProjects);
});

// CREATE PROJECT
router.post('/', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  const project = {
    id: projectId++,
    name,
    description,
    ownerId: req.user.id,
    members: [req.user.id],
    createdAt: new Date()
  };
  projects.push(project);
  res.status(201).json(project);
});

// GET ONE PROJECT
router.get('/:id', auth, (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json(project);
});

// UPDATE PROJECT
router.put('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ message: 'Not found' });
  const { name, description } = req.body;
  if (name) project.name = name;
  if (description) project.description = description;
  res.json(project);
});

// DELETE PROJECT
router.delete('/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  projects = projects.filter(p => p.id !== parseInt(req.params.id));
  res.json({ message: 'Deleted' });
});

// ADD MEMBER
router.post('/:id/members', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ message: 'Not found' });
  const { userId } = req.body;
  if (!project.members.includes(userId)) {
    project.members.push(userId);
  }
  res.json(project);
});

module.exports = router;