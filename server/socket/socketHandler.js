const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Store userId -> socketId mapping
const onlineUsers = new Map();

const initSocket = (io) => {

  // Authenticate socket connection using JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user) return next(new Error('User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    // Save user socket mapping
    onlineUsers.set(userId, socket.id);
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // Join personal room
    socket.join(userId);

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

// Send notification to specific user
const sendNotification = (io, recipientId, notification) => {
  io.to(recipientId.toString()).emit('new_notification', notification);
};

module.exports = { initSocket, sendNotification, onlineUsers };
