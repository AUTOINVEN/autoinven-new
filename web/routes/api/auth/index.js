module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  router.post('/signin', (req, res) => {});

  router.use('/signup', require('./signup'));

  router.get('/signout', (req, res) => {});

  return router;
};
