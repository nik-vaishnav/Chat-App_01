const MessageModel = require('../models/MessageModel');
const ConversationModel = require('../models/ConversationModel');
const UserModel = require('../models/UserModel');
const socketService = require('../services/socketService');

class MessageController {
    // Get conversations for user
    async getConversations(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            const conversations = await ConversationModel.find({
                participants: userId
            })
                .populate('participants', 'name profile_pic isOnline lastSeen') // ✅ FIXED
                .populate({
                    path: 'lastMessage',
                    populate: {
                        path: 'senderId',
                        select: 'name' // ✅ FIXED
                    }
                })
                .sort({ lastMessageTime: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const conversationsWithUnread = await Promise.all(
                conversations.map(async (conversation) => {
                    const unreadCount = await MessageModel.getUnreadCount(conversation._id, userId);
                    return { ...conversation.toObject(), unreadCount };
                })
            );

            const total = await ConversationModel.countDocuments({ participants: userId });

            res.status(200).json({
                success: true,
                data: {
                    conversations: conversationsWithUnread,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });
        } catch (error) {
            console.error('Get conversations error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get messages in a conversation
    async getMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            const { page = 1, limit = 50 } = req.query;
            const skip = (page - 1) * limit;

            const conversation = await ConversationModel.findOne({
                _id: conversationId,
                participants: userId
            });

            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
            }

            const messages = await MessageModel.find({
                conversationId,
                deleted: false
            })
                .populate('senderId', 'name profile_pic') // ✅ FIXED
                .populate('replyTo', 'content senderId')
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const total = await MessageModel.countDocuments({ conversationId, deleted: false });

            await MessageModel.markAllAsRead(conversationId, userId);

            res.status(200).json({
                success: true,
                data: {
                    messages: messages.reverse(),
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });
        } catch (error) {
            console.error('Get messages error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Send a message
    async sendMessage(req, res) {
        try {
            const { conversationId, content, type = 'text', replyTo, tempId } = req.body;
            const senderId = req.user.id;

            if (!conversationId || !content) {
                return res.status(400).json({ success: false, message: 'Conversation ID and content are required' });
            }

            const conversation = await ConversationModel.findOne({
                _id: conversationId,
                participants: senderId
            });

            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
            }

            const messageData = {
                conversationId,
                senderId,
                content: content.trim(),
                type
            };
            if (replyTo) messageData.replyTo = replyTo;
            if (tempId) messageData.tempId = tempId;  // ✅ Add this line


            const message = new MessageModel(messageData);
            await message.save();

            await ConversationModel.findByIdAndUpdate(conversationId, {
                lastMessage: message._id,
            });

            await message.populate('senderId', 'name profile_pic');
            if (replyTo) {
                await message.populate('replyTo', 'content senderId');
            }

            const io = req.app.get('io');
            const onlineUsers = req.app.get('onlineUsers');

            const messageToSend = {
                ...message.toObject(),
                senderName: message.senderId.name,
                senderProfilePicture: message.senderId.profile_pic,
                tempId: tempId || null // ✅ frontend can match it
            };

            for (const participantId of conversation.participants) {
                if (participantId.toString() !== senderId.toString()) {
                    const socketId = onlineUsers.get(participantId.toString());

                    if (socketId) {
                        io.to(socketId).emit("message:received", messageToSend);
                        await message.markAsDelivered(participantId);

                        const senderSocketId = onlineUsers.get(senderId.toString());
                        if (senderSocketId) {
                            io.to(senderSocketId).emit("message:delivered", {
                                messageId: message._id,
                                toUserId: participantId
                            });
                        }
                    }
                }
            }

            // Also send the message back to sender directly if not already
            const senderSocketId = onlineUsers.get(senderId.toString());
            if (senderSocketId) {
                // io.to(senderSocketId).emit("message:received", messageToSend);

                // This is the missing piece!
                io.to(senderSocketId).emit("message_sent_ack", {
                    tempId: tempId || null,
                    message: messageToSend
                });
            }

        } catch (error) {
            console.error('Send message error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Create or get conversation
    async createConversation(req, res) {
        try {
            const { participantId } = req.body;
            const userId = req.user.id;

            if (!participantId || participantId === userId) {
                return res.status(400).json({ success: false, message: 'Invalid participant ID' });
            }

            const participant = await UserModel.findById(participantId);
            if (!participant) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            let conversation = await ConversationModel.findOne({
                participants: { $all: [userId, participantId] },
                type: 'private'
            }).populate('participants', 'name profile_pic isOnline lastSeen'); // ✅ FIXED

            if (conversation) {
                return res.status(200).json({ success: true, message: 'Conversation found', data: conversation });
            }

            conversation = new ConversationModel({
                participants: [userId, participantId],
                type: 'private'
            });

            await conversation.save();
            await conversation.populate('participants', 'name profile_pic isOnline lastSeen'); // ✅ FIXED

            res.status(201).json({ success: true, message: 'Conversation created successfully', data: conversation });
        } catch (error) {
            console.error('Create conversation error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Edit message
    async editMessage(req, res) {
        try {
            const { messageId } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            if (!content.trim()) {
                return res.status(400).json({ success: false, message: 'Message cannot be empty' });
            }

            if (content.trim().length > 1000) {
                return res.status(400).json({ success: false, message: 'Edited message exceeds 1000 characters' });
            }
            const message = await MessageModel.findOne({
                _id: messageId,
                senderId: userId,
                deleted: false
            });

            if (!message) {
                return res.status(404).json({ success: false, message: 'Message not found or access denied' });
            }

            const fifteenMinutes = 15 * 60 * 1000;
            if (Date.now() - message.timestamp.getTime() > fifteenMinutes) {
                return res.status(400).json({ success: false, message: 'Message is too old to edit' });
            }

            message.content = content.trim();
            await message.save();

            await message.populate('senderId', 'name profile_pic');

            res.status(200).json({ success: true, message: 'Message updated successfully', data: message });
        } catch (error) {
            console.error('Edit message error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Delete message
    async deleteMessage(req, res) {
        try {
            const { messageId } = req.params;
            const userId = req.user.id;

            const message = await MessageModel.findOne({
                _id: messageId,
                senderId: userId,
                deleted: false
            });

            if (!message) {
                return res.status(404).json({ success: false, message: 'Message not found or access denied' });
            }

            await message.softDelete();

            res.status(200).json({ success: true, message: 'Message deleted successfully' });
        } catch (error) {
            console.error('Delete message error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Mark messages as read
    async markAsRead(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;

            const conversation = await ConversationModel.findOne({
                _id: conversationId,
                participants: userId
            });

            if (!conversation) {
                return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
            }

            await MessageModel.markAllAsRead(conversationId, userId);

            res.status(200).json({ success: true, message: 'Messages marked as read' });
        } catch (error) {
            console.error('Mark as read error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Get unread messages count
    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;

            const conversations = await ConversationModel.find({ participants: userId }).select('_id');

            let totalUnread = 0;
            const conversationUnreads = await Promise.all(
                conversations.map(async (conversation) => {
                    const unreadCount = await MessageModel.getUnreadCount(conversation._id, userId);
                    totalUnread += unreadCount;
                    return {
                        conversationId: conversation._id,
                        unreadCount
                    };
                })
            );

            res.status(200).json({
                success: true,
                data: { totalUnread, conversationUnreads }
            });
        } catch (error) {
            console.error('Get unread count error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Search messages
    async searchMessages(req, res) {
        try {
            const { query, conversationId } = req.query;
            const userId = req.user.id;
            const { page = 1, limit = 20 } = req.query;
            const skip = (page - 1) * limit;

            if (!query || query.trim().length < 2) {
                return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters long' });
            }

            const searchCriteria = {
                content: new RegExp(query.trim(), 'i'),
                deleted: false
            };

            if (conversationId) {
                const conversation = await ConversationModel.findOne({
                    _id: conversationId,
                    participants: userId
                });

                if (!conversation) {
                    return res.status(404).json({ success: false, message: 'Conversation not found or access denied' });
                }

                searchCriteria.conversationId = conversationId;
            } else {
                const userConversations = await ConversationModel.find({ participants: userId }).select('_id');
                const conversationIds = userConversations.map(conv => conv._id);
                searchCriteria.conversationId = { $in: conversationIds };
            }

            const messages = await MessageModel.find(searchCriteria)
                .populate('senderId', 'name profile_pic') // ✅ FIXED
                .populate('conversationId', 'participants')
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .skip(skip);

            const total = await MessageModel.countDocuments(searchCriteria);

            res.status(200).json({
                success: true,
                data: {
                    messages,
                    pagination: {
                        current: parseInt(page),
                        pages: Math.ceil(total / limit),
                        total
                    }
                }
            });
        } catch (error) {
            console.error('Search messages error:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}

module.exports = new MessageController();