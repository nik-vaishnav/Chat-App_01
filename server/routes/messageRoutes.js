const express = require('express');
const messageController = require('../controller/messageController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.use(verifyToken.verifyToken);

// Conversations
router.get('/conversations', messageController.getConversations);
router.post('/conversations', messageController.createConversation);

// Messages in conversations
router.get('/conversations/:conversationId/messages', messageController.getMessages);
router.put('/conversations/:conversationId/read', messageController.markAsRead);

// Send message
router.post('/send', messageController.sendMessage);

// Message management
router.put('/messages/:messageId', messageController.editMessage);
router.delete('/messages/:messageId', messageController.deleteMessage);

// Utilities
router.get('/unread-count', messageController.getUnreadCount);
router.get('/search', messageController.searchMessages);

console.log('Message routes loaded successfully');

module.exports = router;