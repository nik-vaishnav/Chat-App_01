const UserModel = require('../models/UserModel');
const FriendRequestModel = require('../models/FriendRequestModel');
const socketService = require('../services/socketService');

class FriendController {
    // Get user's friends
    async getFriends(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const user = await UserModel.findById(userId)
                .populate({
                    path: 'friends',
                    select: 'name profile_pic isOnline lastSeen',
                    options: {
                        skip: skip,
                        limit: parseInt(limit)
                    }
                });

            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const totalFriends = user.friends.length;

            res.status(200).json({
                success: true,
                data: {
                    friends: user.friends,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(totalFriends / limit),
                        total: totalFriends
                    }
                }
            });
        } catch (error) {
            console.error('Get friends error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get friend requests (sent or received)
    async getFriendRequests(req, res) {
        try {
            const userId = req.user.id;
            const { type = 'received', page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            let query = { status: 'pending' };
            let populateField = '';

            if (type === 'received') {
                query.receiver = userId;
                populateField = 'sender';
            } else if (type === 'sent') {
                query.sender = userId;
                populateField = 'receiver';
            } else {
                return res.status(400).json({ success: false, message: 'Invalid type parameter' });
            }

            const requests = await FriendRequestModel.find(query)
                .populate(populateField, 'name profile_pic')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const total = await FriendRequestModel.countDocuments(query);

            res.status(200).json({
                success: true,
                data: {
                    requests,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });
        } catch (error) {
            console.error('Get friend requests error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Send friend request
    async sendFriendRequest(req, res) {
        try {
            const senderId = req.user.id;
            const { recipientId } = req.body;

            console.log('🚀 Friend request received:', { senderId, recipientId });

            if (!recipientId) {
                return res.status(400).json({ success: false, message: 'Recipient ID is required' });
            }

            if (senderId === recipientId) {
                return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
            }

            // Check if recipient exists
            const recipient = await UserModel.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            // Check if already friends
            const sender = await UserModel.findById(senderId);
            if (sender.friends.includes(recipientId)) {
                return res.status(400).json({ success: false, message: 'Already friends with this user' });
            }

            // Check for existing pending request
            const existingRequest = await FriendRequestModel.findOne({
                $or: [
                    { sender: senderId, receiver: recipientId, status: 'pending' },
                    { sender: recipientId, receiver: senderId, status: 'pending' }
                ]
            });

            if (existingRequest) {
                return res.status(400).json({ success: false, message: 'Friend request already pending' });
            }

            // Create friend request
            const friendRequest = new FriendRequestModel({
                sender: senderId,
                receiver: recipientId,
                status: 'pending'
            });

            await friendRequest.save();

            // Populate sender info for response
            await friendRequest.populate('sender', 'name profile_pic');

            // Emit socket event to recipient if online
            socketService.emitToUser(recipientId, 'friend_request_received', {
                sender: friendRequest.sender,
                requestId: friendRequest._id
            });

            res.status(201).json({
                success: true,
                message: 'Friend request sent successfully',
                data: friendRequest
            });

        } catch (error) {
            console.error('Send friend request error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Respond to friend request (accept/reject)
    async respondToFriendRequest(req, res) {
        try {
            const { requestId } = req.params;
            const { action } = req.body; // 'accept' or 'reject'
            const userId = req.user.id;

            if (!['accept', 'reject'].includes(action)) {
                return res.status(400).json({ success: false, message: 'Invalid action' });
            }

            const friendRequest = await FriendRequestModel.findOne({
                _id: requestId,
                receiver: userId,
                status: 'pending'
            }).populate('sender', 'name profile_pic');

            if (!friendRequest) {
                return res.status(404).json({ success: false, message: 'Friend request not found' });
            }

            friendRequest.status = action === 'accept' ? 'accepted' : 'rejected';
            await friendRequest.save();

            if (action === 'accept') {
                // Add each other as friends
                await UserModel.findByIdAndUpdate(userId, {
                    $addToSet: { friends: friendRequest.sender._id }
                });
                await UserModel.findByIdAndUpdate(friendRequest.sender._id, {
                    $addToSet: { friends: userId }
                });

                // Emit socket events
                const responder = await UserModel.findById(userId).select('name profile_pic');
                socketService.emitToUser(friendRequest.sender._id.toString(), 'friend_request_responded', {
                    responder,
                    response: 'accept'
                });
            } else {
                // Just notify about rejection
                const responder = await UserModel.findById(userId).select('name profile_pic');
                socketService.emitToUser(friendRequest.sender._id.toString(), 'friend_request_responded', {
                    responder,
                    response: 'reject'
                });
            }

            res.status(200).json({
                success: true,
                message: `Friend request ${action}ed successfully`,
                data: friendRequest
            });

        } catch (error) {
            console.error('Respond to friend request error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Cancel friend request
    async cancelFriendRequest(req, res) {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;

            const friendRequest = await FriendRequestModel.findOne({
                _id: requestId,
                sender: userId,
                status: 'pending'
            });

            if (!friendRequest) {
                return res.status(404).json({ success: false, message: 'Friend request not found' });
            }

            await FriendRequestModel.findByIdAndDelete(requestId);

            res.status(200).json({
                success: true,
                message: 'Friend request cancelled successfully'
            });

        } catch (error) {
            console.error('Cancel friend request error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Remove friend
    async removeFriend(req, res) {
        try {
            const { friendId } = req.params;
            const userId = req.user.id;

            // Remove from both users' friend lists
            await UserModel.findByIdAndUpdate(userId, {
                $pull: { friends: friendId }
            });
            await UserModel.findByIdAndUpdate(friendId, {
                $pull: { friends: userId }
            });

            res.status(200).json({
                success: true,
                message: 'Friend removed successfully'
            });

        } catch (error) {
            console.error('Remove friend error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get friend suggestions
    async getFriendSuggestions(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 10 } = req.query;

            const user = await UserModel.findById(userId);
            const friendIds = user.friends;

            // Find users who are not friends and haven't sent/received requests
            const pendingRequests = await FriendRequestModel.find({
                $or: [
                    { sender: userId, status: 'pending' },
                    { receiver: userId, status: 'pending' }
                ]
            });

            const requestUserIds = pendingRequests.map(req => 
                req.sender.toString() === userId ? req.receiver.toString() : req.sender.toString()
            );

            const excludeIds = [...friendIds, ...requestUserIds, userId];

            const suggestions = await UserModel.find({
                _id: { $nin: excludeIds }
            })
                .select('name profile_pic')
                .limit(parseInt(limit));

            res.status(200).json({
                success: true,
                data: { suggestions }
            });

        } catch (error) {
            console.error('Get friend suggestions error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get mutual friends
    async getMutualFriends(req, res) {
        try {
            const userId = req.user.id;
            const { userId: otherUserId } = req.params;

            const user = await UserModel.findById(userId);
            const otherUser = await UserModel.findById(otherUserId);

            if (!otherUser) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            const mutualFriendIds = user.friends.filter(friendId =>
                otherUser.friends.includes(friendId)
            );

            const mutualFriends = await UserModel.find({
                _id: { $in: mutualFriendIds }
            }).select('name profile_pic');

            res.status(200).json({
                success: true,
                data: { mutualFriends, count: mutualFriends.length }
            });

        } catch (error) {
            console.error('Get mutual friends error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Block user
    async blockUser(req, res) {
        try {
            const userId = req.user.id;
            const { userId: targetUserId } = req.params;

            if (userId === targetUserId) {
                return res.status(400).json({ success: false, message: 'Cannot block yourself' });
            }

            await UserModel.findByIdAndUpdate(userId, {
                $addToSet: { blockedUsers: targetUserId },
                $pull: { friends: targetUserId }
            });

            await UserModel.findByIdAndUpdate(targetUserId, {
                $pull: { friends: userId }
            });

            // Remove any pending friend requests
            await FriendRequestModel.deleteMany({
                $or: [
                    { sender: userId, receiver: targetUserId },
                    { sender: targetUserId, receiver: userId }
                ]
            });

            res.status(200).json({
                success: true,
                message: 'User blocked successfully'
            });

        } catch (error) {
            console.error('Block user error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Unblock user
    async unblockUser(req, res) {
        try {
            const userId = req.user.id;
            const { userId: targetUserId } = req.params;

            await UserModel.findByIdAndUpdate(userId, {
                $pull: { blockedUsers: targetUserId }
            });

            res.status(200).json({
                success: true,
                message: 'User unblocked successfully'
            });

        } catch (error) {
            console.error('Unblock user error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get blocked users
    async getBlockedUsers(req, res) {
        try {
            const userId = req.user.id;

            const user = await UserModel.findById(userId)
                .populate('blockedUsers', 'name profile_pic');

            res.status(200).json({
                success: true,
                data: { blockedUsers: user.blockedUsers }
            });

        } catch (error) {
            console.error('Get blocked users error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}

module.exports = new FriendController();