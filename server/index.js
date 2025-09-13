require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { connectDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const friendRoutes = require('./routes/friendRoutes');
const userRoutes = require('./routes/userRoutes'); 
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { initializeSocket } = require('./config/socketInit');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
];

console.log('JWT Secret Key:', process.env.JWT_SECRET_KEY);

// Connect to database
connectDatabase();

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS not allowed for origin ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors());

// Body parsing & cookies
app.use(express.json());
app.use(cookieParser());

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/users', userRoutes);   // ✅ fixed (was incorrectly authRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Socket.IO
const io = initializeSocket(server, allowedOrigins);

// Start server
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log('📡 Socket.IO ready for connections');
  console.log('✅ Chat app server started successfully');
});
