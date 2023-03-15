module.exports = (db) => {
  const express = require('express');
  const router = express.Router();
  const { doAsync } = require('$base/utils/asyncWrapper');
  const contractAPIs = require('./contractAPIs');
  const {
    authorizeAdmin,
    authorizeUser,
  } = require('$base/middlewares/authorize');
  // 승인 : 2, 완료 : 3, 거절 : 4
  // To-Do
  // 1. 결제 API 구현

  // 1) 계약 요청
  router.post(
    '/',
    authorizeUser,
    doAsync(async (req, res) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const newContract = await contractAPIs.createContract(req, db);
      res.send(newContract);
    })
  );

  // 2) 계약 승인(2), 계약완료(3), 승인 거절(4)
  router.put(
    '/:contract_id',
    //authorizeAdmin,
    doAsync(async (req, res) => {
      const contractId = req.params.contract_id;
      const { c_state_id } = req.body;
      const result = await contractAPIs.changeContractState(
        c_state_id,
        contractId,
        db
      );
      res.send({ message: `${result} row(s) affected` });
    })
  );

  // 5) 추후구현(결제)
  router.put('/:contract_id/payment', (req, res) => {});

  return router;
};
