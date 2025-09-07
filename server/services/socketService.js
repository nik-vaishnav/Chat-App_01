const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const MessageModel = require('../models/MessageModel');
const ConversationModel = require('../models/ConversationModel');

if (!process.env.JWT_SECRET_KEY) {
  throw new Error("Missing JWT_SECRET_KEY in environment variables");
}
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Track online users: Map<userId, Set<socketId>>
const onlineUsers = new Map();

class SocketService {
  constructor() {
    this.io = null;
  }

  initialize(io) {
    this.io = io;

    io.use(async (socket, next) => {
      try {
        const { token } = socket.handshake.auth;

        if (!token) return next(new Error('No token provided'));

        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        const userId = decoded.id;

        const user = await UserModel.findById(userId);
        if (!user) return next(new Error('User not found'));

        socket.userId = user._id.toString();
        socket.userData = {
          name: user.name,
          profile_pic: user.profile_pic,
        };

        return next();
      } catch (err) {
        console.error('Socket auth error:', err);
        return next(new Error('Authentication failed'));
      }
    });

    io.on('connection', async (socket) => {
      console.log(`✅ Connected: socketId=${socket.id}, userId=${socket.userId}`);

      this.addUserSocket(socket.userId, socket.id);

      await UserModel.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastSeen: new Date()
      });

      this.broadcastOnlineUsers();

      socket.join(socket.userId); // personal room
      this.registerSocketEvents(socket);

      socket.on('disconnect', async () => {
        console.log(`❌ Disconnected: socketId=${socket.id}, userId=${socket.userId}`);
        this.removeUserSocket(socket.userId, socket.id);

        if (!onlineUsers.has(socket.userId)) {
          await UserModel.findByIdAndUpdate(socket.userId, {
            isOnline: false,
            lastSeen: new Date()
          });
          this.broadcastOnlineUsers();
          console.log(`👋 User ${socket.userId} set to offline`);
        }
      });
    });
  }

  addUserSocket(userId, socketId) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socketId);
  }

  removeUserSocket(userId, socketId) {
    const sockets = onlineUsers.get(userId);
    if (!sockets) return;
    sockets.delete(socketId);
    if (sockets.size === 0) {
      onlineUsers.delete(userId);
    }
  }

  broadcastOnlineUsers() {
    const onlineUsersList = [];

    onlineUsers.forEach((socketIds, userId) => {
      const firstSocketId = [...socketIds][0];
      const socket = this.io.sockets.sockets.get(firstSocketId);

      console.log(`📡 Broadcasting: ${userId}`, socket?.userData);

      onlineUsersList.push({
        id: userId,
        name: socket?.userData?.name || 'Unknown',
        profile_pic: socket?.userData?.profile_pic || '',
        isOnline: true,
      });
    });

    console.log('📢 Emitting online_users_updated:', onlineUsersList);
    this.io.emit('online_users_updated', onlineUsersList);
  }

  registerSocketEvents(socket) {
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`👥 User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`👤 User ${socket.userId} left conversation ${conversationId}`);
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('userTyping', {
        userId: socket.userId,
        conversationId,
        isTyping: true,
      });
    });

    socket.on('stopTyping', ({ conversationId }) => {
      socket.to(conversationId).emit('userTyping', {
        userId: socket.userId,
        conversationId,
        isTyping: false,
      });
    });

    socket.on('sendMessage', async (messageData) => {
      try {
        const { conversationId, senderId, content, type = 'text', _id: tempId } = messageData;
        if (!conversationId || !senderId || !content) {
          return socket.emit('error', { message: 'Missing message fields' });
        }

        const conversation = await ConversationModel.findOne({
          _id: conversationId,
          participants: senderId
        }).populate('participants', 'name profile_pic');

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found or unauthorized' });
        }

        const message = new MessageModel({
          conversationId,
          senderId,
          content: content.trim(),
          type,
          timestamp: new Date()
        });

        await message.save();

        await ConversationModel.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
          lastMessageTime: new Date()
        });

        await message.populate('senderId', 'name profile_pic');

        const messageToSend = {
          ...message.toObject(),
          msgByUserId: senderId
        };

        conversation.participants.forEach(participant => {
          const pid = participant._id.toString();
          if (pid !== senderId && onlineUsers.has(pid)) {
            this.io.to(pid).emit('new_message', messageToSend);
          }
        });

        socket.emit('message_sent_ack', { tempId: tempId || null, message: messageToSend });
        console.log('✅ Message sent');
      } catch (error) {
        console.error('❌ Error in sendMessage:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    socket.on('markMessageSeen', async (messageId) => {
      try {
        const updatedMessage = await MessageModel.findByIdAndUpdate(
          messageId,
          {
            seen: true,
            seenAt: new Date()
          },
          { new: true }
        ).populate('senderId', '_id');

        if (!updatedMessage) return;

        const senderId = updatedMessage.senderId._id.toString();
        const seenPayload = {
          messageId,
          seenAt: updatedMessage.seenAt
        };

        socket.emit('messageSeenUpdate', seenPayload); // receiver

        if (senderId !== socket.userId && onlineUsers.has(senderId)) {
          this.io.to(senderId).emit('messageSeenUpdate', seenPayload); // sender
        }

        console.log(`👀 Message ${messageId} seen by ${socket.userId}`);
      } catch (err) {
        console.error('Error marking message as seen:', err);
      }
    });

    socket.on('message:seen', async ({ conversationId }) => {
  try {
    const userId = socket.userId;

    const messages = await MessageModel.find({
      conversationId,
      senderId: { $ne: userId },
      'readBy.userId': { $ne: userId },
      deleted: false
    });

    const now = new Date();

    for (let msg of messages) {
      if (!msg.isReadBy(userId)) {
        msg.readBy.push({ userId, readAt: now });
        msg.seen = true;
        msg.seenAt = now;
        await msg.save();

        // Notify sender if online
        const senderId = msg.senderId.toString();
        if (senderId !== userId && onlineUsers.has(senderId)) {
          this.io.to(senderId).emit('messageSeenUpdate', {
            messageId: msg._id,
            seenAt: now,
            seenBy: userId
          });
        }
      }
    }

    console.log(`✅ All unseen messages in ${conversationId} marked as seen by ${userId}`);
  } catch (err) {
    console.error('❌ Error in message:seen handler:', err);
  }
});


    socket.on('friend_request_sent', ({ receiverId, sender }) => {
      if (onlineUsers.has(receiverId)) {
        this.io.to(receiverId).emit('friend_request_received', {
          sender,
          message: `${sender.name} sent you a friend request`
        });
      }
    });
  }
}

module.exports = new SocketService();