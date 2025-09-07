const mongoose = require('mongoose');

const connectDatabase = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error("Error: MONGODB_URI is not defined in the .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, {
    });
    console.log('Connected to MongoDB successfully.');

    // Update existing users to include friends field if missing
    await updateUserModelWithFriends();
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
};

const updateUserModelWithFriends = async () => {
  try {
    const UserModel = require('../models/UserModel');
    await UserModel.updateMany(
      { friends: { $exists: false } },
      { $set: { friends: [] } }
    );
    console.log('Checked and updated users without friends field if any.');
  } catch (error) {
    console.error('Friends field update error:', error.message);
  }
};

module.exports = { connectDatabase };