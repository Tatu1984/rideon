const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

// Import models
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

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
