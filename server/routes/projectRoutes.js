const express = require('express');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, adminOnly, createProject);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, adminOnly, updateProject)
  .delete(protect, adminOnly, deleteProject);

router.post('/:id/members', protect, adminOnly, addMember);
router.delete('/:id/members/:userId', protect, adminOnly, removeMember);

module.exports = router;
