const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const socketService = require('../services/socketService');
const UserModel = require('../models/UserModel');

const initializeSocket = (server, allowedOrigins) => {
  const io = socketIo(server, {
    cors: {
      origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS not allowed'));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;

      const user = await UserModel.findById(socket.userId).select('name profile_pic');
      socket.userData = user || { name: 'Unknown', profile_pic: '' };

      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  socketService.initialize(io);

  return io;
};

module.exports = { initializeSocket };
