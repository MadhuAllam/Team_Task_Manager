const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient  : { type: String, required: true },
  subject    : { type: String, required: true },
  type       : { 
    type: String, 
    enum: ['overdue_reminder', 'admin_summary'],
    required: true 
  },
  taskId     : { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  projectId  : { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  status     : { type: String, enum: ['sent', 'failed'], default: 'sent' },
  error      : { type: String },
  sentAt     : { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
