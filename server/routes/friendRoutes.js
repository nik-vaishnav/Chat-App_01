const express = require('express');
const friendController = require('../controller/friendController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken.verifyToken);

// Friends management
router.get('/', friendController.getFriends);
router.delete('/:friendId', friendController.removeFriend);

// Friend requests
router.get('/requests', friendController.getFriendRequests);
router.post('/requests', friendController.sendFriendRequest);
router.post('/requests/:requestId/respond', friendController.respondToFriendRequest); // ✅ Updated route
router.delete('/requests/:requestId', friendController.cancelFriendRequest);

// Friend discovery
router.get('/suggestions', friendController.getFriendSuggestions);
router.get('/mutual/:userId', friendController.getMutualFriends);

// Blocking functionality
router.post('/block/:userId', friendController.blockUser);
router.delete('/block/:userId', friendController.unblockUser);
router.get('/blocked', friendController.getBlockedUsers);

console.log('Friend routes loaded with verifyToken middleware applied');
console.log('Updated route: POST /requests/:requestId/respond for responding to friend requests');

module.exports = router;