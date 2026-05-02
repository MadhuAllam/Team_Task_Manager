const cron      = require('node-cron');
const Task      = require('../models/Task');
const User      = require('../models/User');
const EmailLog  = require('../models/EmailLog');
const transporter = require('../config/mailer');
const { overdueReminderTemplate, adminSummaryTemplate } = require('../templates/overdueEmail');

const sendOverdueEmails = async () => {
  console.log('Running overdue email job:', new Date().toISOString());

  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find all overdue tasks with assignee
    const overdueTasks = await Task.find({
      dueDate  : { $lt: now },
      status   : { $ne: 'done' },
      assignee : { $ne: null }
    })
    .populate('assignee', 'name email')
    .populate('project', 'name owner');

    if (overdueTasks.length === 0) {
      console.log('No overdue tasks found.');
      return;
    }

    console.log(`Found ${overdueTasks.length} overdue task(s)`);

    // Send individual reminder to each assignee
    for (const task of overdueTasks) {
      if (!task.assignee?.email) continue;

      const daysOverdue = Math.floor(
        (new Date() - new Date(task.dueDate)) / 86400000
      );

      const { subject, html } = overdueReminderTemplate({
        userName    : task.assignee.name,
        taskTitle   : task.title,
        projectName : task.project?.name || 'Unknown Project',
        dueDate     : task.dueDate,
        daysOverdue
      });

      try {
        await transporter.sendMail({
          from    : process.env.EMAIL_FROM,
          to      : task.assignee.email,
          subject,
          html
        });

        await EmailLog.create({
          recipient : task.assignee.email,
          subject,
          type      : 'overdue_reminder',
          taskId    : task._id,
          projectId : task.project?._id,
          status    : 'sent'
        });

        console.log(`Reminder sent to: ${task.assignee.email} for "${task.title}"`);

      } catch (emailErr) {
        await EmailLog.create({
          recipient : task.assignee.email,
          subject,
          type      : 'overdue_reminder',
          taskId    : task._id,
          projectId : task.project?._id,
          status    : 'failed',
          error     : emailErr.message
        });
        console.error(`Failed to send to ${task.assignee.email}:`, emailErr.message);
      }
    }

    // Send admin summary email
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      const date = new Date().toDateString();
      const { subject, html } = adminSummaryTemplate({
        adminName    : admin.name,
        overdueTasks,
        date
      });

      try {
        await transporter.sendMail({
          from    : process.env.EMAIL_FROM,
          to      : admin.email,
          subject,
          html
        });

        await EmailLog.create({
          recipient : admin.email,
          subject,
          type      : 'admin_summary',
          status    : 'sent'
        });

        console.log(`Summary sent to admin: ${admin.email}`);

      } catch (emailErr) {
        console.error(`Failed to send summary to admin:`, emailErr.message);
      }
    }

    console.log('Overdue email job completed.');

  } catch (err) {
    console.error('Overdue email job error:', err.message);
  }
};

// Run every day at midnight — 0 0 * * *
const startOverdueEmailJob = () => {
  cron.schedule('0 0 * * *', sendOverdueEmails, {
    timezone: 'Asia/Kolkata'
  });
  console.log('Overdue email cron job scheduled (runs at midnight IST)');
};

module.exports = { startOverdueEmailJob, sendOverdueEmails };
