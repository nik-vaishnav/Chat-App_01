const express = require('express');
const { verifyToken } = require('../middleware/auth');
const UserModel = require('../models/UserModel');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');

const router = express.Router();

// 🪵 Log every request to this router
router.use((req, res, next) => {
  console.log(`👣 Reached users route: ${req.method} ${req.originalUrl}`);
  next();
});


// Get all users except current user (for chat user list)
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await UserModel.find({ _id: { $ne: req.user.id } })
      .select('name email profile_pic isOnline lastSeen')
      .sort({ name: 1 });
    
    sendSuccessResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    console.error("Error fetching users:", error);
    sendErrorResponse(res, 500, "Failed to fetch users");
  }
});

// Update current user's profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, profile_pic, bio } = req.body;
    const userId = req.user.id;

    console.log(`👤 Updating profile for user ID: ${userId}`);

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    if (profile_pic && profile_pic.startsWith('http')) {
      updateData.profile_pic = profile_pic;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return sendErrorResponse(res, 404, "User not found");
    }

    sendSuccessResponse(res, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    sendErrorResponse(res, 500, "Failed to update profile");
  }
});

// Search users by name or email
router.get('/search', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return sendErrorResponse(res, 400, "Search query is required");
    }
    
    const users = await UserModel.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name email profile_pic isOnline lastSeen')
    .limit(20);
    
    sendSuccessResponse(res, 200, "Search results", users);
  } catch (error) {
    console.error("Error searching users:", error);
    sendErrorResponse(res, 500, "Failed to search users");
  }
});

router.get('/user/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await UserModel.findById(id)
      .select('name email profile_pic isOnline lastSeen');
    
    if (!user) {
      return sendErrorResponse(res, 404, "User not found");
    }
    
    sendSuccessResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    console.error("Error fetching user:", error);
    sendErrorResponse(res, 500, "Failed to fetch user");
  }
});

module.exports = router;