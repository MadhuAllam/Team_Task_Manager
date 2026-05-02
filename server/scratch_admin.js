const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateMany(
      { name: /Madhu/i }, 
      { role: 'admin' }
    );

    console.log(`Updated ${result.modifiedCount} user(s) to admin.`);
    
    // Also list all users for verification
    const users = await User.find({}, 'name email role');
    console.log('Current Users:', users);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

makeAdmin();
