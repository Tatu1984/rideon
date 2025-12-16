// require('dotenv').config();

// module.exports = {
//   development: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'postgres',
//     database: process.env.DB_NAME || 'rideon_db',
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: console.log,
//     define: {
//       timestamps: true,
//       underscored: true
//     },
//     pool: {
//       max: 20,
//       min: 5,
//       acquire: 30000,
//       idle: 10000
//     }
//   },
//   test: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'postgres',
//     database: 'rideon_test',
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: false
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: false,
//     define: {
//       timestamps: true,
//       underscored: true
//     },
//     pool: {
//       max: 30,
//       min: 10,
//       acquire: 30000,
//       idle: 10000
//     },
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false
//       }
//     }
//   }
// };
require('dotenv').config();

<<<<<<< HEAD
const config = {
  development: {
    url: process.env.DATABASE_URL,
=======
// Parse DATABASE_URL if provided (for Neon DB, Vercel, etc.)
const parseConnectionString = (url) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1),
      host: parsed.hostname,
      port: parsed.port || 5432,
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    };
  } catch (e) {
    console.error('Failed to parse DATABASE_URL:', e.message);
    return null;
  }
};

// Get connection config from DATABASE_URL or individual env vars
const getDbConfig = (env) => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const parsed = parseConnectionString(connectionString);
    if (parsed) {
      return {
        ...parsed,
        logging: env === 'development' ? console.log : false,
        define: {
          timestamps: true,
          underscored: true
        },
        pool: {
          max: env === 'production' ? 20 : 10,
          min: 2,
          acquire: 30000,
          idle: 10000
        }
      };
    }
  }

  // Fallback to individual env vars
  return null;
};

const neonConfig = getDbConfig(process.env.NODE_ENV);

module.exports = {
  development: neonConfig || {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'rideon_db',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
>>>>>>> a1fa6be106185dd55792d0662f12c29c4f1dd3d4
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
          rejectUnauthorized: false
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
>>>>>>> a1fa6be106185dd55792d0662f12c29c4f1dd3d4
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
>>>>>>> a1fa6be106185dd55792d0662f12c29c4f1dd3d4
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
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
    pool: {
      max: 30,
      min: 10,
      acquire: 30000,
      idle: 10000
    }
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env];