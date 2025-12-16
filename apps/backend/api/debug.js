// Diagnostic endpoint to identify what's causing the Express app to crash
// Force bundler to include pg for Sequelize postgres dialect
require('pg');

module.exports = async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET (hidden)' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'NOT SET'
    },
    tests: {}
  };

  // Test 1: Can we require dotenv?
  try {
    require('dotenv').config();
    results.tests.dotenv = 'OK';
  } catch (e) {
    results.tests.dotenv = `FAILED: ${e.message}`;
  }

  // Test 2: Can we require express?
  try {
    const express = require('express');
    results.tests.express = 'OK';
  } catch (e) {
    results.tests.express = `FAILED: ${e.message}`;
  }

  // Test 3: Can we require Sequelize and connect?
  try {
    const { Sequelize } = require('sequelize');
    if (process.env.DATABASE_URL) {
      const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        logging: false
      });
      await sequelize.authenticate();
      results.tests.sequelize = 'OK - Connected';
      await sequelize.close();
    } else {
      results.tests.sequelize = 'SKIPPED - No DATABASE_URL';
    }
  } catch (e) {
    results.tests.sequelize = `FAILED: ${e.message}`;
  }

  // Test 4: Can we require the logger?
  try {
    const logger = require('../src/utils/logger');
    results.tests.logger = 'OK';
  } catch (e) {
    results.tests.logger = `FAILED: ${e.message}`;
  }

  // Test 5: Can we require the models?
  try {
    const db = require('../src/models');
    results.tests.models = `OK - ${Object.keys(db).filter(k => k !== 'sequelize' && k !== 'Sequelize').length} models`;
  } catch (e) {
    results.tests.models = `FAILED: ${e.message}`;
  }

  // Test 6: Can we require the routes?
  try {
    const routes = require('../src/routes');
    results.tests.routes = 'OK';
  } catch (e) {
    results.tests.routes = `FAILED: ${e.message}`;
  }

  // Test 7: Can we require the error handler?
  try {
    const errorHandler = require('../src/middleware/errorHandler');
    results.tests.errorHandler = 'OK';
  } catch (e) {
    results.tests.errorHandler = `FAILED: ${e.message}`;
  }

  // Test 8: Can we create the full Express app?
  try {
    const app = require('../src/index');
    results.tests.fullApp = 'OK';
  } catch (e) {
    results.tests.fullApp = `FAILED: ${e.message}`;
  }

  res.json(results);
};
