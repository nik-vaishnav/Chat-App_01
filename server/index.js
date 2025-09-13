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
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const { initializeSocket } = require('./config/socketInit');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
console.log(process.env.JWT_SECRET_KEY)
// Connect DB
connectDatabase();

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const allowedOrigins = [
  'http://localhost:3000',
  'https://chat-app-frontend-9eb7.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like curl or server-to-server)
    if(!origin) return callback(null, true);
    if(allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE']
}));

app.use(express.json());
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/friends', friendRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/users', authRoutes);


// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize Socket.IO with authentication & handlers
const io = initializeSocket(server, frontendURL);

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log('📡 Socket.IO ready for connections');
  console.log('✅ Chat app server started successfully');
});
