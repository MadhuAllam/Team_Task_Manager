const Task = require('../models/Task');
const { cloudinary } = require('../config/cloudinary');

// GET /api/tasks/:id/attachments
const getAttachments = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('attachments.uploadedBy', 'name email');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ attachments: task.attachments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/tasks/:id/attachments
const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const attachment = {
      filename:   req.file.originalname,
      url:        req.file.path,
      publicId:   req.file.filename,
      fileType:   req.file.mimetype,
      uploadedBy: req.user._id
    };

    task.attachments.push(attachment);
    await task.save();

    const populated = await task.populate('attachments.uploadedBy', 'name email');
    const newAtt = populated.attachments[populated.attachments.length - 1];

    res.status(201).json({
      message: 'File uploaded successfully',
      attachment: newAtt
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/tasks/:id/attachments/:attachmentId
const deleteAttachment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    // Delete from Cloudinary
    const resourceType = attachment.fileType && attachment.fileType.startsWith('image/')
      ? 'image'
      : 'raw';

    try {
      await cloudinary.uploader.destroy(attachment.publicId, {
        resource_type: resourceType
      });
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr.message);
      // Continue even if Cloudinary delete fails — still remove from DB
    }

    attachment.deleteOne();
    await task.save();

    res.json({ message: 'Attachment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAttachments, uploadAttachment, deleteAttachment };
