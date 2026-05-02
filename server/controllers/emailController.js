const EmailLog          = require('../models/EmailLog');
const { sendOverdueEmails } = require('../jobs/overdueEmailJob');

// POST /api/email/trigger — manual trigger (admin only, for testing)
const triggerOverdueEmails = async (req, res) => {
  try {
    await sendOverdueEmails();
    res.json({ message: 'Overdue email job triggered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/email/logs — view email logs (admin only)
const getEmailLogs = async (req, res) => {
  try {
    const logs = await EmailLog.find()
      .populate('taskId', 'title')
      .populate('projectId', 'name')
      .sort({ sentAt: -1 })
      .limit(50);

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { triggerOverdueEmails, getEmailLogs };
