// const { Sequelize } = require('sequelize');
// const config = require('../config/database');

// const env = process.env.NODE_ENV || 'development';
// const dbConfig = config[env];

// const sequelize = new Sequelize(
//   dbConfig.database,
//   dbConfig.username,
//   dbConfig.password,
//   dbConfig
// );

// const db = {};

// // Import models
// db.User = require('./User')(sequelize, Sequelize.DataTypes);
// db.Rider = require('./Rider')(sequelize, Sequelize.DataTypes);
// db.Driver = require('./Driver')(sequelize, Sequelize.DataTypes);
// db.Vehicle = require('./Vehicle')(sequelize, Sequelize.DataTypes);
// db.DriverDocument = require('./DriverDocument')(sequelize, Sequelize.DataTypes);
// db.Trip = require('./Trip')(sequelize, Sequelize.DataTypes);
// db.TripStatusHistory = require('./TripStatusHistory')(sequelize, Sequelize.DataTypes);
// db.Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
// db.Rating = require('./Rating')(sequelize, Sequelize.DataTypes);
// db.Zone = require('./Zone')(sequelize, Sequelize.DataTypes);
// db.PricingRule = require('./PricingRule')(sequelize, Sequelize.DataTypes);
// db.PromoCode = require('./PromoCode')(sequelize, Sequelize.DataTypes);
// db.PromoCodeUsage = require('./PromoCodeUsage')(sequelize, Sequelize.DataTypes);
// db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
// db.DriverLocation = require('./DriverLocation')(sequelize, Sequelize.DataTypes);
// db.RefreshToken = require('./RefreshToken')(sequelize, Sequelize.DataTypes);
// db.SupportTicket = require('./SupportTicket')(sequelize, Sequelize.DataTypes);
// db.DriverPayout = require('./DriverPayout')(sequelize, Sequelize.DataTypes);

// // Define associations
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;
const { Sequelize } = require('sequelize');
require('dotenv').config();

<<<<<<< HEAD
// Initialize Sequelize with the connection string
const sequelize = new Sequelize(config.url, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: config.logging,
  dialectOptions: config.dialectOptions,
  pool: config.pool,
  define: {
    timestamps: true,
    underscored: true
  }
});

const db = {
  sequelize,
  Sequelize
};
=======
let sequelize;

// Use DATABASE_URL if available (for Neon DB, Vercel, etc.)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fallback to individual env vars
  const config = require('../config/database');
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config[env];

  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
  );
}
>>>>>>> a1fa6be106185dd55792d0662f12c29c4f1dd3d4

// Import all models
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Rider = require('./Rider')(sequelize, Sequelize.DataTypes);
db.Driver = require('./Driver')(sequelize, Sequelize.DataTypes);
db.Vehicle = require('./Vehicle')(sequelize, Sequelize.DataTypes);
db.DriverDocument = require('./DriverDocument')(sequelize, Sequelize.DataTypes);
db.Trip = require('./Trip')(sequelize, Sequelize.DataTypes);
db.TripStatusHistory = require('./TripStatusHistory')(sequelize, Sequelize.DataTypes);
db.Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
db.Rating = require('./Rating')(sequelize, Sequelize.DataTypes);
db.Zone = require('./Zone')(sequelize, Sequelize.DataTypes);
db.PricingRule = require('./PricingRule')(sequelize, Sequelize.DataTypes);
db.PromoCode = require('./PromoCode')(sequelize, Sequelize.DataTypes);
db.PromoCodeUsage = require('./PromoCodeUsage')(sequelize, Sequelize.DataTypes);
db.Notification = require('./Notification')(sequelize, Sequelize.DataTypes);
db.DriverLocation = require('./DriverLocation')(sequelize, Sequelize.DataTypes);
db.RefreshToken = require('./RefreshToken')(sequelize, Sequelize.DataTypes);
db.SupportTicket = require('./SupportTicket')(sequelize, Sequelize.DataTypes);
db.DriverPayout = require('./DriverPayout')(sequelize, Sequelize.DataTypes);

// Set up associations after all models are loaded
Object.keys(db).forEach(modelName => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
})();

module.exports = db;