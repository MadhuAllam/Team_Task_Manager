const express        = require('express');
const router         = express.Router();
const protect        = require('../middleware/authMiddleware');
const adminOnly      = require('../middleware/adminMiddleware');
const { triggerOverdueEmails, getEmailLogs } = require('../controllers/emailController');

router.use(protect);
router.use(adminOnly);

router.post('/trigger', triggerOverdueEmails);
router.get('/logs',     getEmailLogs);

module.exports = router;
