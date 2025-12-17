require('dotenv').config();

const config = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    logging: console.log,
    define: {
      underscored: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    ...(process.env.DATABASE_URL && {
      dialectOptions: {
        ssl: {
          require: true,
<<<<<<< HEAD
          rejectUnauthorized: false
=======
          // Enable certificate verification in production to prevent MITM attacks
          rejectUnauthorized: process.env.NODE_ENV === 'production'
>>>>>>> origin/main
        }
      }
    })
  },
  test: {
<<<<<<< HEAD
    url: process.env.DATABASE_URL,
=======
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'rideon_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  },
  production: neonConfig || {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
>>>>>>> origin/main
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    define: {
      underscored: true
    },
<<<<<<< HEAD
=======
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
>>>>>>> origin/main
    dialectOptions: {
      ssl: {
        require: true,
        // Enable certificate verification in production to prevent MITM attacks
        rejectUnauthorized: true
      }
    }
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    define: {
      underscored: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    connection: {
        options: `project=${process.env.NEON_PROJECT_ID}`
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];