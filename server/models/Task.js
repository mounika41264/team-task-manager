const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, default: 'pending' },
  createdBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);