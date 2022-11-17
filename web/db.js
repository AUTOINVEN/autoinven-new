const mysql2 = require('mysql2/promise');
// 10) PORT
var express = require('express');

var session = require('express-session');

var bodyParser = require('body-parser');//POST 방식 전송을 위해서 필요함

var MySQLStore = require('express-mysql-session')(session);
const PORT = process.env.PORT || 5000;
// 11) DB 테이블 생성(없으면 생성해줌)
const { info } = require('./config/db');
const connection = mysql2.createPool(info);
const sessionStore = new MySQLStore({}, connection);

const dbTest = async () => {
	const connection = await connection.getConnection(async conn => conn);
console.log(connection);
};

//connection.connect();
connection.end();

