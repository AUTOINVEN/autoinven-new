const mysql = require('mysql2/promise');

const db_info = {
  host: '52.79.110.147',
  user: 'autoin',
  password: 'autoin2022',
  port: 3306,
  database: 'autoinven_pro',
  socketPath: '/var/run/mysqld/mysqld.sock'
};

module.exports = {
  info: db_info,
};
