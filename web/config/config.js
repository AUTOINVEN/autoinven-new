require('dotenv').config();
const env = process.env;
module.exports = {
  development: {
    username: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    host: env.MYSQL_HOST,
    dialect: 'mysql',
    pool: {
      max: 5,
      idle: 30000,
      acquire: 60000,
    },
    timezone: env.MYSQL_TZ,
  },
  test: {
    username: 'root',
    password: null,
    database: 'autoinven_test',
    host: env.MYSQL_HOST,
     dialect: 'mysql',
  },
  production: {
    username: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    host: env.MYSQL_HOST,
    dialect: 'mysql',
    pool: {
      max: 5,
      idle: 30000,
      acquire: 60000,
    },
    timezone: env.MYSQL_TZ,
  },
};
