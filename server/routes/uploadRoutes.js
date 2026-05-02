const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const {
  getAttachments,
  uploadAttachment,
  deleteAttachment
} = require('../controllers/uploadController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// All routes require auth
router.use(protect);

// GET attachments — any authenticated member
router.get('/:id/attachments', getAttachments);

// POST upload — admin and member both can upload
router.post(
  '/:id/attachments',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  uploadAttachment
);

// DELETE attachment — admin only
router.delete('/:id/attachments/:attachmentId', adminOnly, deleteAttachment);

module.exports = router;
