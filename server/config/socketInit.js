const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const socketService = require('../services/socketService'); // updated path
const UserModel = require('../models/UserModel');

const initializeSocket = (server, frontendURL) => {
  const io = socketIo(server, {
    cors: {
      origin: frontendURL,
      methods: ['GET', 'POST'],
      credentials: true,
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    console.log('🔐 Socket auth: Token received:', token);

    if (!token) {
      console.log('❌ No token provided');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      console.log('✅ Token decoded:', decoded);

      if (!decoded?.id || !decoded?.email) {
        throw new Error('Invalid token payload');
      }

      socket.userId = decoded.id;
      socket.userEmail = decoded.email;

      const user = await UserModel.findById(socket.userId).select('name profile_pic');
      socket.userData = user || { name: 'Unknown', profile_pic: '' };

      next();
    } catch (err) {
      console.log('❌ Token verification failed:', err.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Pass control to socketService (handles connection/disconnection)
  socketService.initialize(io);

  return io;
};

module.exports = { initializeSocket };