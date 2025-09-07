const express = require('express');
const UserModel = require('../models/UserModel');
const authController = require('../controller/authController');
const { verifyToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');
const upload = require('../utils/upload');

const router = express.Router();

// ─── Rate Limiter ─────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    });
  },
});

// ─── Public Endpoints ─────────────────────────────────────────
router.post('/register', apiLimiter, authController.register);
router.post('/login', apiLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// ─── Protected Endpoints ──────────────────────────────────────
router.get('/validate-token', apiLimiter, verifyToken, authController.validateToken);
router.put('/update-password', verifyToken, authController.updatePassword);
router.put('/update-email', verifyToken, authController.updateEmail);
router.put('/update-preferences', verifyToken, authController.updatePreferences);

// ─── GET Profile ──────────────────────────────────────────────
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        profile_pic: user.profile_pic,
        bio: user.bio,
        createdAt: user.createdAt,
        isOnline: user.isOnline,
      },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching profile' });
  }
});

// ─── PUT Profile Update with file ─────────────────────────────
router.put('/profile', verifyToken, upload.single('profile_pic'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user.id;

    const updateData = {};

    if (name) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    if (req.file) {
      // Case 1: If file was uploaded
      updateData.profile_pic = `/uploads/profile_pics/${req.file.filename}`;
    } else if (req.body.profile_pic && typeof req.body.profile_pic === 'string') {
      // Case 2: If profile_pic sent as string URL
      updateData.profile_pic = req.body.profile_pic.trim();
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

module.exports = router;