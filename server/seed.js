require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');
const User     = require('./models/User');
const Project  = require('./models/Project');
const Task     = require('./models/Task');

const connectDB = require('./db/connect');

const seed = async () => {
  await connectDB();
  console.log('Connected. Seeding...');

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  // ── USERS ──────────────────────────────────────────
  const hash = (p) => bcrypt.hashSync(p, 10);

  const users = await User.insertMany([
    { name: 'Madhu Admin',   email: 'admin@demo.com',   passwordHash: hash('password123'), role: 'admin'  },
    { name: 'Ravi Kumar',    email: 'ravi@demo.com',    passwordHash: hash('password123'), role: 'member' },
    { name: 'Sneha Reddy',   email: 'sneha@demo.com',   passwordHash: hash('password123'), role: 'member' },
    { name: 'Arjun Sharma',  email: 'arjun@demo.com',   passwordHash: hash('password123'), role: 'member' },
    { name: 'Priya Nair',    email: 'priya@demo.com',   passwordHash: hash('password123'), role: 'member' },
  ]);

  const [admin, ravi, sneha, arjun, priya] = users;

  // ── PROJECTS ───────────────────────────────────────
  const projects = await Project.insertMany([
    {
      name: 'E-Commerce Platform',
      description: 'Build a full-stack online shopping platform with payments and inventory.',
      owner: admin._id,
      members: [
        { user: admin._id,  role: 'admin'  },
        { user: ravi._id,   role: 'member' },
        { user: sneha._id,  role: 'member' },
      ]
    },
    {
      name: 'Mobile App Redesign',
      description: 'Redesign the existing mobile app UI/UX for iOS and Android.',
      owner: admin._id,
      members: [
        { user: admin._id,  role: 'admin'  },
        { user: arjun._id,  role: 'member' },
        { user: priya._id,  role: 'member' },
      ]
    },
    {
      name: 'Marketing Dashboard',
      description: 'Analytics dashboard for tracking campaign performance and ROI.',
      owner: admin._id,
      members: [
        { user: admin._id,  role: 'admin'  },
        { user: ravi._id,   role: 'member' },
        { user: arjun._id,  role: 'member' },
        { user: priya._id,  role: 'member' },
      ]
    },
  ]);

  const [ecommerce, mobile, marketing] = projects;
  const yesterday = new Date(Date.now() - 86400000);
  const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
  const tomorrow  = new Date(Date.now() + 86400000);
  const nextWeek  = new Date(Date.now() + 7 * 86400000);
  const nextMonth = new Date(Date.now() + 30 * 86400000);

  // ── TASKS ──────────────────────────────────────────
  await Task.insertMany([

    // E-Commerce Platform tasks
    { title: 'Set up project repository and CI/CD pipeline',
      description: 'Initialize GitHub repo, configure GitHub Actions for auto deploy.',
      status: 'done', priority: 'high',
      project: ecommerce._id, assignee: ravi._id, createdBy: admin._id,
      dueDate: threeDaysAgo },

    { title: 'Design product listing page UI',
      description: 'Create Figma mockups for the product grid, filters, and search.',
      status: 'done', priority: 'high',
      project: ecommerce._id, assignee: sneha._id, createdBy: admin._id,
      dueDate: threeDaysAgo },

    { title: 'Build REST API for product catalog',
      description: 'CRUD endpoints for products, categories, and inventory management.',
      status: 'in_progress', priority: 'high',
      project: ecommerce._id, assignee: ravi._id, createdBy: admin._id,
      dueDate: tomorrow },

    { title: 'Integrate Razorpay payment gateway',
      description: 'Add payment flow with success/failure handling and webhooks.',
      status: 'in_progress', priority: 'high',
      project: ecommerce._id, assignee: sneha._id, createdBy: admin._id,
      dueDate: nextWeek },

    { title: 'Implement user authentication and JWT',
      description: 'Signup, login, forgot password, and session management.',
      status: 'todo', priority: 'medium',
      project: ecommerce._id, assignee: ravi._id, createdBy: admin._id,
      dueDate: nextWeek },

    { title: 'Write unit tests for payment module',
      description: 'Jest tests for all payment edge cases and error scenarios.',
      status: 'todo', priority: 'low',
      project: ecommerce._id, assignee: sneha._id, createdBy: admin._id,
      dueDate: nextMonth },

    // Overdue task
    { title: 'Fix cart total calculation bug',
      description: 'Cart shows wrong total when discount codes are applied.',
      status: 'in_progress', priority: 'high',
      project: ecommerce._id, assignee: ravi._id, createdBy: admin._id,
      dueDate: threeDaysAgo },

    // Mobile App Redesign tasks
    { title: 'Conduct user research and interviews',
      description: 'Interview 10 existing users to identify pain points.',
      status: 'done', priority: 'high',
      project: mobile._id, assignee: arjun._id, createdBy: admin._id,
      dueDate: threeDaysAgo },

    { title: 'Create new design system and style guide',
      description: 'Typography, colors, components library in Figma.',
      status: 'done', priority: 'high',
      project: mobile._id, assignee: priya._id, createdBy: admin._id,
      dueDate: threeDaysAgo },

    { title: 'Redesign onboarding flow',
      description: 'New 4-step onboarding with progress indicator and skip option.',
      status: 'in_progress', priority: 'high',
      project: mobile._id, assignee: arjun._id, createdBy: admin._id,
      dueDate: tomorrow },

    { title: 'Redesign home screen and navigation',
      description: 'Bottom tab navigation, home feed, and quick action buttons.',
      status: 'in_progress', priority: 'medium',
      project: mobile._id, assignee: priya._id, createdBy: admin._id,
      dueDate: nextWeek },

    { title: 'Prototype and usability testing',
      description: 'Build clickable prototype and test with 5 users.',
      status: 'todo', priority: 'medium',
      project: mobile._id, assignee: arjun._id, createdBy: admin._id,
      dueDate: nextWeek },

    // Overdue task
    { title: 'Submit app to App Store review',
      description: 'Prepare screenshots, description, and submit for review.',
      status: 'todo', priority: 'high',
      project: mobile._id, assignee: priya._id, createdBy: admin._id,
      dueDate: yesterday },

    // Marketing Dashboard tasks
    { title: 'Define KPIs and metrics to track',
      description: 'List all campaign metrics: CTR, ROAS, CPA, conversion rate.',
      status: 'done', priority: 'medium',
      project: marketing._id, assignee: ravi._id, createdBy: admin._id,
      dueDate: threeDaysAgo },

    { title: 'Build Google Analytics integration',
      description: 'Pull GA4 data using API and display in dashboard.',
      status: 'in_progress', priority: 'high',
      project: marketing._id, assignee: arjun._id, createdBy: admin._id,
      dueDate: tomorrow },

    { title: 'Design charts and data visualizations',
      description: 'Line charts for trends, pie charts for channel breakdown.',
      status: 'in_progress', priority: 'medium',
      project: marketing._id, assignee: priya._id, createdBy: admin._id,
      dueDate: nextWeek },

    { title: 'Add date range filter and export to CSV',
      description: 'Filter dashboard by custom date range, export data as CSV.',
      status: 'todo', priority: 'medium',
      project: marketing._id, assignee: ravi._id, createdBy: admin._id,
      dueDate: nextWeek },

    { title: 'Deploy dashboard to staging environment',
      description: 'Deploy to staging, share with marketing team for feedback.',
      status: 'todo', priority: 'low',
      project: marketing._id, assignee: arjun._id, createdBy: admin._id,
      dueDate: nextMonth },
  ]);

  console.log('');
  console.log('✅ Seed complete!');
  console.log('');
  console.log('Login credentials:');
  console.log('  Admin  → admin@demo.com  / password123');
  console.log('  Member → ravi@demo.com   / password123');
  console.log('  Member → sneha@demo.com  / password123');
  console.log('  Member → arjun@demo.com  / password123');
  console.log('  Member → priya@demo.com  / password123');
  console.log('');
  console.log('Projects created: 3');
  console.log('Tasks created: 18 (including overdue tasks)');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
