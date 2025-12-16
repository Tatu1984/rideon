// Force bundler to include pg for Sequelize postgres dialect
require('pg');

const app = require('../src/index');

module.exports = app;
