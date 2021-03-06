module.exports = (db) => {
  const express = require('express');
  const router = express.Router();
  const itemAPIs = require('./itemAPIs');
  const { doAsync } = require('$base/utils/asyncWrapper');
  const multer = require('multer');
  const upload = multer({ dest: 'uploads/' });
  const {
    authorizeAdmin,
    authorizeUser,
  } = require('$base/middlewares/authorize');

  router.get(
    '/',
    doAsync(async (req, res) => {
      const items = await itemAPIs.getAllItems(db);
      res.send(items);
    })
  );

  router.get(
    '/:item_id',
    doAsync(async (req, res) => {
      const item = await itemAPIs.getItem(req.params.item_id, db);
      res.send(item);
    })
  );

  router.post(
    '/',
    authorizeUser,
    upload.array('images', 6),
    doAsync(async (req, res) => {
      const item = await itemAPIs.registerItem(req, db);
      res.send(item);
    })
  );
  router.put(
    '/:item_id',
    upload.array('images', 6),
    doAsync(async (req, res) => {
      const result = await itemAPIs.editItem(req, db);
      res.send({ message: `${result} row(s) affected` });
    })
  );

  //입고
  router.put(
    '/:item_id/in',
    authorizeAdmin,
    doAsync(async (req, res) => {
      const { item_id } = req.params;
      const result = await itemAPIs.itemStateChange(item_id, 2, db);
      res.send(result);
    })
  );
  //출고
  router.put(
    '/:item_id/out',
    authorizeAdmin,
    doAsync(async (req, res) => {
      const { item_id } = req.params;
      const result = await itemAPIs.itemStateChange(item_id, 3, db);
      res.send(result);
    })
  );

  return router;
};
