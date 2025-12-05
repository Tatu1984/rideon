const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Driver, Rider } = require('../models');

function initializeSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error: Token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Authentication error: User not found or inactive'));
      }

      socket.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.role})`);

    // Join user-specific room
    socket.join(`user:${socket.user.id}`);

    // If driver, join driver-specific room and emit online status
    if (socket.user.role === 'driver') {
      const driver = await Driver.findOne({ where: { userId: socket.user.id } });
      if (driver) {
        socket.join(`driver:${driver.id}`);
        socket.driverId = driver.id;

        // Notify that driver is online
        socket.broadcast.emit('driver:online', {
          driverId: driver.id,
          latitude: driver.currentLatitude,
          longitude: driver.currentLongitude
        });
      }
    }

    // If rider, join rider-specific room
    if (socket.user.role === 'rider') {
      const rider = await Rider.findOne({ where: { userId: socket.user.id } });
      if (rider) {
        socket.join(`rider:${rider.id}`);
        socket.riderId = rider.id;
      }
    }

    // Driver location update
    socket.on('driver:location-update', async (data) => {
      if (socket.user.role !== 'driver') return;

      try {
        const { latitude, longitude, heading, speed } = data;

        // Broadcast location to all connected clients (for nearby drivers display)
        socket.broadcast.emit('driver:location-updated', {
          driverId: socket.driverId,
          latitude,
          longitude,
          heading,
          speed,
          timestamp: new Date()
        });

        // If driver is on active trip, send location to rider
        if (data.tripId) {
          io.to(`trip:${data.tripId}`).emit('trip:driver-location', {
            latitude,
            longitude,
            heading,
            speed,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Driver location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Join trip room (for real-time trip updates)
    socket.on('trip:join', (data) => {
      const { tripId } = data;
      socket.join(`trip:${tripId}`);
      console.log(`User ${socket.user.id} joined trip ${tripId}`);
    });

    // Leave trip room
    socket.on('trip:leave', (data) => {
      const { tripId } = data;
      socket.leave(`trip:${tripId}`);
      console.log(`User ${socket.user.id} left trip ${tripId}`);
    });

    // Driver accepts trip
    socket.on('trip:accept', async (data) => {
      if (socket.user.role !== 'driver') return;

      try {
        const { tripId } = data;

        // Notify rider that driver accepted
        io.to(`trip:${tripId}`).emit('trip:accepted', {
          tripId,
          driverId: socket.driverId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Trip accept error:', error);
        socket.emit('error', { message: 'Failed to accept trip' });
      }
    });

    // Trip status update
    socket.on('trip:status-update', (data) => {
      const { tripId, status } = data;

      // Broadcast status update to all users in trip room
      io.to(`trip:${tripId}`).emit('trip:status-updated', {
        tripId,
        status,
        timestamp: new Date()
      });
    });

    // Send message (chat between driver and rider)
    socket.on('trip:message', (data) => {
      const { tripId, message, senderRole } = data;

      io.to(`trip:${tripId}`).emit('trip:message-received', {
        tripId,
        message,
        senderRole,
        senderId: socket.user.id,
        timestamp: new Date()
      });
    });

    // Driver status change (online/offline/busy)
    socket.on('driver:status-change', async (data) => {
      if (socket.user.role !== 'driver') return;

      try {
        const { status } = data;

        socket.broadcast.emit('driver:status-changed', {
          driverId: socket.driverId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Driver status change error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Emergency/SOS alert
    socket.on('trip:emergency', (data) => {
      const { tripId, location, message } = data;

      // Broadcast to admin room and emergency services
      io.to('admin').emit('trip:emergency-alert', {
        tripId,
        userId: socket.user.id,
        userRole: socket.user.role,
        location,
        message,
        timestamp: new Date()
      });

      // Also notify the other party in the trip
      io.to(`trip:${tripId}`).emit('trip:emergency-alert', {
        message: 'Emergency alert triggered',
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.id}`);

      // If driver disconnects, broadcast offline status
      if (socket.user.role === 'driver' && socket.driverId) {
        socket.broadcast.emit('driver:offline', {
          driverId: socket.driverId,
          timestamp: new Date()
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
}

module.exports = { initializeSocket };
