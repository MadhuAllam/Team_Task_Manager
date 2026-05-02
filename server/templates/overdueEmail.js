const overdueReminderTemplate = ({ userName, taskTitle, projectName, dueDate, daysOverdue }) => ({
  subject: `⚠️ Overdue Task Reminder: "${taskTitle}"`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="background: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          Team Task Manager
        </h1>
      </div>

      <div style="background: #fff3f3; border: 1px solid #ef4444; 
                  border-radius: 0 0 8px 8px; padding: 24px;">
        
        <h2 style="color: #ef4444; margin-top: 0;">
          ⚠️ Task Overdue
        </h2>

        <p style="color: #374151; font-size: 15px;">
          Hi <strong>${userName}</strong>,
        </p>

        <p style="color: #374151; font-size: 15px;">
          The following task assigned to you is overdue 
          by <strong style="color: #ef4444;">${daysOverdue} day(s)</strong>:
        </p>

        <div style="background: white; border: 1px solid #e5e7eb; 
                    border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Task</td>
              <td style="color: #111827; font-weight: 600; font-size: 14px; padding: 6px 0;">
                ${taskTitle}
              </td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Project</td>
              <td style="color: #111827; font-size: 14px; padding: 6px 0;">
                ${projectName}
              </td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Due Date</td>
              <td style="color: #ef4444; font-size: 14px; padding: 6px 0;">
                ${new Date(dueDate).toDateString()}
              </td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 13px; padding: 6px 0;">Days Overdue</td>
              <td style="color: #ef4444; font-weight: 600; font-size: 14px; padding: 6px 0;">
                ${daysOverdue} day(s)
              </td>
            </tr>
          </table>
        </div>

        <p style="color: #374151; font-size: 14px;">
          Please log in and update the task status as soon as possible.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; 
                    border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            This is an automated reminder from Team Task Manager.
          </p>
        </div>

      </div>
    </div>
  `
});

const adminSummaryTemplate = ({ adminName, overdueTasks, date }) => ({
  subject: `📊 Daily Overdue Summary — ${date}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">

      <div style="background: #4f46e5; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">
          Team Task Manager
        </h1>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; 
                  border-radius: 0 0 8px 8px; padding: 24px;">

        <h2 style="color: #111827; margin-top: 0;">
          📊 Daily Overdue Summary
        </h2>

        <p style="color: #374151;">
          Hi <strong>${adminName}</strong>, here is today's overdue task report:
        </p>

        <div style="background: #fff3f3; border-radius: 8px; 
                    padding: 12px 16px; margin-bottom: 20px;">
          <strong style="color: #ef4444; font-size: 18px;">
            ${overdueTasks.length} overdue task(s)
          </strong>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="text-align: left; padding: 10px; 
                         border: 1px solid #e5e7eb; color: #6b7280;">Task</th>
              <th style="text-align: left; padding: 10px; 
                         border: 1px solid #e5e7eb; color: #6b7280;">Project</th>
              <th style="text-align: left; padding: 10px; 
                         border: 1px solid #e5e7eb; color: #6b7280;">Assignee</th>
              <th style="text-align: left; padding: 10px; 
                         border: 1px solid #e5e7eb; color: #6b7280;">Due Date</th>
              <th style="text-align: left; padding: 10px; 
                         border: 1px solid #e5e7eb; color: #6b7280;">Days Late</th>
            </tr>
          </thead>
          <tbody>
            ${overdueTasks.map(task => `
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">
                  ${task.title}
                </td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; color: #6b7280;">
                  ${task.project?.name || 'N/A'}
                </td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; color: #6b7280;">
                  ${task.assignee?.name || 'Unassigned'}
                </td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; color: #ef4444;">
                  ${new Date(task.dueDate).toDateString()}
                </td>
                <td style="padding: 10px; border: 1px solid #e5e7eb; 
                           color: #ef4444; font-weight: 600;">
                  ${Math.floor((new Date() - new Date(task.dueDate)) / 86400000)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 24px; padding-top: 16px; 
                    border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Auto-generated on ${date} by Team Task Manager.
          </p>
        </div>

      </div>
    </div>
  `
});

module.exports = { overdueReminderTemplate, adminSummaryTemplate };
