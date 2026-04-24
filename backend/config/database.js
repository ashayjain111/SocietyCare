const path = require('path');
require('dotenv').config();

const dbDialect = process.env.DB_DIALECT || 'sqlite';

const sqliteStorage = path.join(__dirname, '..', 'database.sqlite');

module.exports = {
  development: {
    dialect: dbDialect,
    // SQLite config
    ...(dbDialect === 'sqlite' && {
      storage: sqliteStorage,
      logging: false,
    }),
    // PostgreSQL config
    ...(dbDialect === 'postgres' && {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'societycare',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      logging: console.log,
    }),
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'postgres',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
  },
};
