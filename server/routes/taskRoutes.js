const express = require('express');
const { body } = require('express-validator');
const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const validateRequest = require('../middleware/validateMiddleware');

const router = express.Router();

router.route('/project/:projectId')
  .get(protect, getTasksByProject)
  .post(
    protect,
    adminOnly,
    [
      body('title').notEmpty().withMessage('Title is required').isLength({ max: 300 }).withMessage('Title max length 300'),
    ],
    validateRequest,
    createTask
  );

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, adminOnly, deleteTask);

module.exports = router;
