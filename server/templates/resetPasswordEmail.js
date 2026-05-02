const resetPasswordTemplate = ({ userName, resetUrl }) => ({
  subject: '🔐 Password Reset Request - Team Task Manager',
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
          Password Reset Request
        </h2>

        <p style="color: #374151; font-size: 15px;">
          Hi <strong>${userName}</strong>,
        </p>

        <p style="color: #374151; font-size: 15px;">
          We received a request to reset your password. Click the button below to choose a new one:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #4f46e5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: 600;">
            Reset My Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px;">
          This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>

        <div style="margin-top: 24px; padding-top: 16px; 
                    border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Team Task Manager Security Team
          </p>
        </div>

      </div>
    </div>
  `
});

module.exports = { resetPasswordTemplate };
