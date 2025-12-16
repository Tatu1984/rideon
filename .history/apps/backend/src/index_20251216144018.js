const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true
}));
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RideOn API is running',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1'
    }
  });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    }
  });
});

// Error Handler
app.use(errorHandler);

// For local development
if (process.env.NODE_ENV !== 'production') {
  const http = require('http');
  const { initializeSocket } = require('./socket');

  const server = http.createServer(app);
  const io = initializeSocket(server);
  app.set('io', io);

  const PORT = process.env.PORT || 3001;

  sequelize.authenticate()
    .then(() => {
      logger.info('Database connection established successfully');
      server.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
      });
    })
    .catch(err => {
      logger.error('Unable to connect to the database:', err);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      logger.info('HTTP server closed');
      sequelize.close();
      process.exit(0);
    });
  });
}

// Export for Vercel serverless
<<<<<<< HEAD
module.exports = app;
=======
module.exports = app;
>>>>>>> a1fa6be106185dd55792d0662f12c29c4f1dd3d4
