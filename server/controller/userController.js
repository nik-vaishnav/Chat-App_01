const UserModel = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const { sendSuccessResponse, sendErrorResponse } = require('../utils/responseHelper');

class UserController {
    // Get user profile
    async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.id)
                .select('-password')
                .populate('friends', 'name email profile_pic isOnline lastSeen');
            
            if (!user) {
                return sendErrorResponse(res, 404, 'User not found');
            }

            // Return user data with consistent field names
            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                profile_pic: user.profile_pic,
                bio: user.bio || '',
                friends: user.friends,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                createdAt: user.createdAt
            };

            sendSuccessResponse(res, 200, 'Profile fetched successfully', userData);
        } catch (error) {
            console.error('Get profile error:', error);
            sendErrorResponse(res, 500, 'Failed to fetch profile');
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const { name, profile_pic, bio } = req.body;
            const userId = req.user.id;

            // Validate input
            if (!name || name.trim().length === 0) {
                return sendErrorResponse(res, 400, 'Name is required');
            }

            // Check if name is already taken by another user (optional)
            const existingUser = await UserModel.findOne({
                name: name.trim(),
                _id: { $ne: userId }
            });
            
            if (existingUser) {
                return sendErrorResponse(res, 400, 'Name already taken');
            }

            // Update user
            const updateData = {
                name: name.trim(),
                profile_pic: profile_pic || '',
                bio: bio || ''
            };

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                updateData,
                { 
                    new: true, 
                    runValidators: true 
                }
            ).select('-password');

            if (!updatedUser) {
                return sendErrorResponse(res, 404, 'User not found');
            }

            // Return consistent response format
            const responseData = {
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    profile_pic: updatedUser.profile_pic,
                    bio: updatedUser.bio
                }
            };

            sendSuccessResponse(res, 200, 'Profile updated successfully', responseData);
        } catch (error) {
            console.error('Update profile error:', error);
            
            if (error.name === 'ValidationError') {
                return sendErrorResponse(res, 400, 'Validation error: ' + 
                    Object.values(error.errors).map(err => err.message).join(', '));
            }

            sendErrorResponse(res, 500, 'Failed to update profile');
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword) {
                return sendErrorResponse(res, 400, 'Current password and new password are required');
            }

            // Get user with password
            const user = await UserModel.findById(userId);
            if (!user) {
                return sendErrorResponse(res, 404, 'User not found');
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return sendErrorResponse(res, 400, 'Current password is incorrect');
            }

            // Validate new password
            if (newPassword.length < 6) {
                return sendErrorResponse(res, 400, 'New password must be at least 6 characters long');
            }

            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            await UserModel.findByIdAndUpdate(userId, {
                password: hashedNewPassword
            });

            sendSuccessResponse(res, 200, 'Password changed successfully');
        } catch (error) {
            console.error('Change password error:', error);
            sendErrorResponse(res, 500, 'Failed to change password');
        }
    }

    // Search users
    async searchUsers(req, res) {
        try {
            const { q: query, page = 1, limit = 10 } = req.query;
            const userId = req.user.id;

            if (!query || query.trim().length < 2) {
                return sendErrorResponse(res, 400, 'Search query must be at least 2 characters long');
            }

            const searchRegex = new RegExp(query.trim(), 'i');
            const skip = (page - 1) * limit;

            const users = await UserModel.find({
                $and: [
                    { _id: { $ne: userId } }, // Exclude current user
                    {
                        $or: [
                            { name: searchRegex },
                            { email: searchRegex }
                        ]
                    }
                ]
            })
            .select('name email profile_pic bio isOnline lastSeen')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ name: 1 });

            const total = await UserModel.countDocuments({
                $and: [
                    { _id: { $ne: userId } },
                    {
                        $or: [
                            { name: searchRegex },
                            { email: searchRegex }
                        ]
                    }
                ]
            });

            // Format response data
            const formattedUsers = users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                profile_pic: user.profile_pic,
                bio: user.bio,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen
            }));

            sendSuccessResponse(res, 200, 'Users found', {
                users: formattedUsers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            });
        } catch (error) {
            console.error('Search users error:', error);
            sendErrorResponse(res, 500, 'Search failed');
        }
    }

    // Get online users
    async getOnlineUsers(req, res) {
        try {
            const userId = req.user.id;

            // Get user's friends who are online
            const user = await UserModel.findById(userId)
                .populate({
                    path: 'friends',
                    select: 'name profile_pic isOnline lastSeen',
                    match: { isOnline: true }
                });

            if (!user) {
                return sendErrorResponse(res, 404, 'User not found');
            }

            const onlineFriends = user.friends.map(friend => ({
                id: friend._id,
                name: friend.name,
                profile_pic: friend.profile_pic,
                isOnline: friend.isOnline,
                lastSeen: friend.lastSeen
            }));

            sendSuccessResponse(res, 200, 'Online friends fetched', onlineFriends);
        } catch (error) {
            console.error('Get online users error:', error);
            sendErrorResponse(res, 500, 'Failed to fetch online users');
        }
    }

    // Get user by ID (for viewing other profiles)
    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            const requesterId = req.user.id;

            const user = await UserModel.findById(userId)
                .select('name email profile_pic bio isOnline lastSeen createdAt')
                .lean();

            if (!user) {
                return sendErrorResponse(res, 404, 'User not found');
            }

            // Check if users are friends
            const requester = await UserModel.findById(requesterId);
            const isFriend = requester.friends.includes(userId);

            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                profile_pic: user.profile_pic,
                bio: user.bio,
                isOnline: user.isOnline,
                lastSeen: user.lastSeen,
                createdAt: user.createdAt,
                isFriend
            };

            sendSuccessResponse(res, 200, 'User profile fetched', userData);
        } catch (error) {
            console.error('Get user by ID error:', error);
            sendErrorResponse(res, 500, 'Failed to fetch user profile');
        }
    }

    // Update user status (online/offline)
    async updateStatus(req, res) {
        try {
            const { isOnline } = req.body;
            const userId = req.user.id;

            const updateData = {
                isOnline: Boolean(isOnline),
                lastSeen: new Date()
            };

            await UserModel.findByIdAndUpdate(userId, updateData);

            sendSuccessResponse(res, 200, 'Status updated successfully');
        } catch (error) {
            console.error('Update status error:', error);
            sendErrorResponse(res, 500, 'Failed to update status');
        }
    }

    // Delete user account
    async deleteAccount(req, res) {
        try {
            const { password } = req.body;
            const userId = req.user.id;

            if (!password) {
                return sendErrorResponse(res, 400, 'Password is required to delete account');
            }

            // Get user with password
            const user = await UserModel.findById(userId);
            if (!user) {
                return sendErrorResponse(res, 404, 'User not found');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return sendErrorResponse(res, 400, 'Password is incorrect');
            }

            // Delete user account
            await UserModel.findByIdAndDelete(userId);

            sendSuccessResponse(res, 200, 'Account deleted successfully');
        } catch (error) {
            console.error('Delete account error:', error);
            sendErrorResponse(res, 500, 'Failed to delete account');
        }
    }
}

module.exports = new UserController();