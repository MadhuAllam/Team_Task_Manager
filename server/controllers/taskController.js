const Task         = require('../models/Task');
const Project      = require('../models/Project');
const Notification = require('../models/Notification');
const { sendNotification } = require('../socket/socketHandler');

// ── GET all tasks for a project ──────────────────────────────────
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findOne({
      _id: projectId,
      'members.user': req.user._id
    });
    if (!project) return res.status(403).json({ error: 'Access denied' });

    const tasks = await Task.find({ project: projectId })
      .populate('assignee',  'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── CREATE task ──────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, dueDate, assigneeId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const task = await Task.create({
      title,
      description,
      priority   : priority  || 'medium',
      dueDate    : dueDate   || null,
      assignee   : assigneeId || null,
      project    : projectId,
      createdBy  : req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignee',  'name email')
      .populate('createdBy', 'name');

    // ── Notify assignee if set ──
    if (assigneeId && assigneeId !== req.user._id.toString()) {
      try {
        const notification = await Notification.create({
          recipient : assigneeId,
          sender    : req.user._id,
          type      : 'task_assigned',
          message   : `${req.user.name} created and assigned you: "${title}"`,
          taskId    : task._id,
          projectId : projectId,
        });

        const populatedNotif = await Notification.findById(notification._id)
          .populate('sender', 'name');

        const io = req.app.get('io');
        console.log(`Sending notification to assignee: ${assigneeId}`);
        sendNotification(io, assigneeId, populatedNotif);
      } catch (notifErr) {
        console.error('Notification error (createTask):', notifErr.message);
      }
    }

    // Fire dashboard refresh event
    res.status(201).json({ task: populated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── UPDATE task ──────────────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Fetch BEFORE update to compare old values
    const taskBefore = await Task.findById(id);
    if (!taskBefore) return res.status(404).json({ error: 'Task not found' });

    const previousAssignee = taskBefore.assignee?.toString() || null;
    const previousStatus   = taskBefore.status;

    // Check access — admin can update all, member only their own
    if (req.user.role !== 'admin') {
      if (previousAssignee !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You can only update your own tasks' });
      }
      // Member can only change status
      const allowedFields = ['status'];
      Object.keys(updates).forEach(key => {
        if (!allowedFields.includes(key)) delete updates[key];
      });
    }

    // Perform update
    const task = await Task.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
      .populate('assignee',  'name email')
      .populate('createdBy', 'name')
      .populate('project',   'name owner');

    const io = req.app.get('io');

    // ── Notify new assignee if assignee changed ──
    const newAssignee = updates.assigneeId || updates.assignee || null;
    const newAssigneeStr = newAssignee?.toString() || null;

    if (
      newAssigneeStr &&
      newAssigneeStr !== previousAssignee &&
      newAssigneeStr !== req.user._id.toString()
    ) {
      try {
        const notification = await Notification.create({
          recipient : newAssigneeStr,
          sender    : req.user._id,
          type      : 'task_assigned',
          message   : `${req.user.name} assigned you a task: "${task.title}"`,
          taskId    : task._id,
          projectId : task.project?._id,
        });

        const populatedNotif = await Notification.findById(notification._id)
          .populate('sender', 'name');

        console.log(`Sending task_assigned notification to: ${newAssigneeStr}`);
        sendNotification(io, newAssigneeStr, populatedNotif);
      } catch (notifErr) {
        console.error('Notification error (assignee change):', notifErr.message);
      }
    }

    // ── Notify project owner if status changed ──
    if (updates.status && updates.status !== previousStatus) {
      try {
        const project = await Project.findById(task.project?._id);
        const ownerId = project?.owner?.toString();

        if (ownerId && ownerId !== req.user._id.toString()) {
          const notification = await Notification.create({
            recipient : ownerId,
            sender    : req.user._id,
            type      : 'status_updated',
            message   : `${req.user.name} updated "${task.title}" → ${updates.status.replace('_', ' ')}`,
            taskId    : task._id,
            projectId : task.project?._id,
          });

          const populatedNotif = await Notification.findById(notification._id)
            .populate('sender', 'name');

          console.log(`Sending status_updated notification to owner: ${ownerId}`);
          sendNotification(io, ownerId, populatedNotif);
        }
      } catch (notifErr) {
        console.error('Notification error (status change):', notifErr.message);
      }
    }

    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── DELETE task ──────────────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getTasksByProject, createTask, updateTask, deleteTask };
