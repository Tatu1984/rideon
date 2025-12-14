#!/usr/bin/env node
/**
 * Test Database Connection Script
 * Tests connectivity to the configured database (Neon DB or local PostgreSQL)
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

async function testConnection() {
  console.log('Testing database connection...\n');

  let sequelize;

  if (DATABASE_URL) {
    console.log('Using DATABASE_URL connection string');
    console.log('Host:', new URL(DATABASE_URL).hostname);

    sequelize = new Sequelize(DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    });
  } else {
    console.log('Using individual environment variables');
    console.log('Host:', process.env.DB_HOST);

    sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false
    });
  }

  try {
    await sequelize.authenticate();
    console.log('\n[SUCCESS] Database connection established successfully!');

    // Test query
    const [results] = await sequelize.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('\nDatabase Info:');
    console.log('  Current Time:', results[0].current_time);
    console.log('  PostgreSQL Version:', results[0].pg_version.split(' ')[0] + ' ' + results[0].pg_version.split(' ')[1]);

    // Check if tables exist
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.length > 0) {
      console.log(`\nExisting tables (${tables.length}):`);
      tables.forEach(t => console.log('  -', t.table_name));
    } else {
      console.log('\nNo tables found. Run migrations to create the schema.');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n[ERROR] Unable to connect to the database:');
    console.error('  Message:', error.message);
    if (error.parent) {
      console.error('  Details:', error.parent.message);
    }
    await sequelize.close();
    process.exit(1);
  }
}

testConnection();
