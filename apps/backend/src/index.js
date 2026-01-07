const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, securityHeaders } = require('./middleware/security');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['https://rideon-admin.vercel.app', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());
app.use(cookieParser());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().any());

// Security middleware
app.use(securityHeaders);
app.use('/api', apiLimiter); // Apply rate limiting to all API routes

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

// Export for Vercel serverless
module.exports = app;
