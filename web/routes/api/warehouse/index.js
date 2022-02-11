module.exports = (db) => {
  const express = require('express');
  const router = express.Router();
  const { doAsync } = require('$base/utils/asyncWrapper');
  const warehouseAPIs = require('./warehouseAPIs');
  const multer = require('multer');
  const upload = multer({ dest: 'uploads/' });

  const authenticate = require('$base/middlewares/authenticate');
  const {
    authorizeUser,
    authorizeAdmin,
  } = require('$base/middlewares/authorize');

  // 1) 창고 전체 조회
  router.get(
    '/',
    authenticate,
    doAsync(async (req, res, next) => {
      console.log('IN');
      const warehoues = await warehouseAPIs.getAllWarehouses(db);
      res.send(warehoues);
    })
  );

  // 2) 창고 검색
  router.get(
    '/search',
    doAsync(async (req, res, next) => {
      console.log('request is incomming');
      const result = await warehouseAPIs.searchWarehouse(req, db);
      res.send(result);
    })
  );

  // 3) 해당 창고 가용공간 조회 유저
  router.get(
    '/:warehouse_id/available',
    doAsync(async (req, res, next) => {
      const warehouse = await warehouseAPIs.getAvailableArea(req, db);
      res.send(warehouse);
    })
  );

  // 4) 특정 id 창고 조회
  router.get(
    '/:id',
    authenticate,
    doAsync(async (req, res, next) => {
      const warehouse_id = req.params.id;
      const warehoues = await warehouseAPIs.getWarehouseInfo(warehouse_id, db);
      res.send(warehoues);
    })
  );

  // 5) 창고 등록 관리자
  router.post(
    '/',
    authenticate,
    authorizeAdmin,
    upload.array('images', 6),
    doAsync(async (req, res, next) => {
      console.log('창고 등록 요청됨');
      const newWarehouse = await warehouseAPIs.registerWarehouse(req, db);
      res.status(200).send(newWarehouse);
    })
  );

  // 6) 창고 수정 관리자
  router.put(
    '/:warehouse_id',
    authenticate,
    authorizeAdmin,
    upload.array('images', 6),
    doAsync(async (req, res, next) => {
      const result = await warehouseAPIs.editWarehouse(req, db);
      res.send({ message: `${result} row(s) affected` });
    })
  );

  return router;
};
