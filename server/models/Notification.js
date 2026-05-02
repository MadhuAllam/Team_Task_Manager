const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient  : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender     : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type       : { 
    type: String, 
    enum: ['task_assigned', 'status_updated', 'task_created'],
    required: true 
  },
  message    : { type: String, required: true },
  taskId     : { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  projectId  : { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  isRead     : { type: Boolean, default: false },
  createdAt  : { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
