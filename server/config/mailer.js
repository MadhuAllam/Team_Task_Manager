const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify connection on startup
transporter.verify((error) => {
  if (error) {
    console.error('Email transporter error:', error.message);
  } else {
    console.log('Email server ready');
  }
});

module.exports = transporter;
