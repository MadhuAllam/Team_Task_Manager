const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all projects user is part of
    const userProjects = await Project.find({
      'members.user': userId
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Get all tasks in those projects
    const allTasks = await Task.find({
      project: { $in: projectIds }
    }).populate('assignee', 'name email')
      .populate('project', 'name');

    const now = new Date();

    const total      = allTasks.length;
    const todo       = allTasks.filter(t => t.status === 'todo').length;
    const inProgress = allTasks.filter(t => t.status === 'in_progress').length;
    const done       = allTasks.filter(t => t.status === 'done').length;
    const overdue    = allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
    ).length;

    const recent = allTasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    res.json({ total, todo, inProgress, done, overdue, recent });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getDashboardStats
};
