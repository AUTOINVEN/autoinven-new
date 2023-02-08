module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  const { doAsync } = require('$base/utils/asyncWrapper');
  const getCategories = require('./function/getCategories');

  const getWarehouseDetailForEdit = require('./function/getWarehouseDetailForEdit');
  const getWarehouseDetail = require('./function/getWarehouseDetail');
  const getWarehouseDetailWithItem = require('./function/getWarehouseDetailWithItem');
  const getWarehouses = require('./function/getWarehouses');
  const checkWarehouseDetailParameter = require('./function/checkWarehouseDetailParameter');

  const authorizeContractor = require('./function/authorizeContractor');
  const authenticate = require('$base/middlewares/authenticate');
  const { authorizeAdmin } = require('$base/middlewares/authorize');

  // 창고 목록
  router.get(
    '/',
    authenticate,
    doAsync(async (req, res) => {
      const locale = res.locale;
      const {
        session: { role, email },
      } = req;
      const {
        query: { keyword, page_num },
      } = req;
      let warehouses = [];
      let total_page = 0;

      // 유저일 경우
      if (role === 'user') {
        ({ total_page, warehouses } = await getWarehouses(
          db,
          locale,
          page_num,
          keyword,
          email
        ));
      }
      // 관리자일 경우
      else if (role === 'admin') {
        ({ total_page, warehouses } = await getWarehouses(
          db,
          locale,
          page_num,
          keyword
        ));
      }

      res.render('warehouse/warehouseList', { total_page, warehouses });
    })
  );

  // 창고 등록
  router.get(
    '/enroll',
    authenticate,
    authorizeAdmin,
    doAsync(async (req, res) => {
      const categories = await getCategories(db);

      res.render('warehouse/enrollWarehouse', {
        categories,
      });
    })
  );

  // 창고 상세
  router.get(
    '/:id',
    doAsync(async (req, res) => {
      const locale = res.locale;
      const {
        session: { role, email },
      } = req;
      const {
        params: { id: warehouse_id },
      } = req;
      const {
        query: { start_date, end_date, selected_area, available_area },
      } = req;

      let l_contract_id = null;
      let warehouse = null;

      // 파라미터 확인
      checkWarehouseDetailParameter(
        warehouse_id,
        start_date,
        end_date,
        selected_area,
        available_area
      );

      // 관리자일 경우
      if (role === 'admin') {
        warehouse = await getWarehouseDetailWithItem(db, locale, warehouse_id);
      }

      // 유저일 경우 창고와 계약되어있는지 확인
      else if (role === 'user') {
        l_contract_id = await authorizeContractor(db, email, warehouse_id);
        // 창고와 계약되어있는 경우
        if (l_contract_id) {
          warehouse = await getWarehouseDetailWithItem(
            db,
            locale,
            warehouse_id,
            email
          );
        }
        // 창고와 계약되어있지 않은 경우
        else {
          warehouse = await getWarehouseDetail(db, locale, warehouse_id);
        }
      }

      // 로그인 안돼있는 경우
      else {
        warehouse = await getWarehouseDetail(db, locale, warehouse_id);
      }

      let DeviceLog = await db.DeviceLog.findOne({
        where: {
          data02: warehouse.sensor_id || 0001,
        },
        order: [ [ 'regdate', 'DESC' ]],
      });
      //console.log(DeviceLog)
      res.render('warehouse/warehouseDetail', {
        warehouse,
        user: {
          is_contracted: l_contract_id ? true : false,
          email,
          l_contract_id,
        },
        lease_info: {
          start_date,
          end_date,
          selected_area,
          available_area,
        },
        DeviceLog
      });
    })
  );

  // 창고 수정
  router.get(
    '/:id/edit',
    authenticate,
    authorizeAdmin,
    doAsync(async (req, res) => {
      const locale = res.locale;
      const {
        params: { id: warehouse_id },
      } = req;

      const warehouse = await getWarehouseDetailForEdit(
        db,
        locale,
        warehouse_id
      );
      const categories = await getCategories(db);

      res.render('warehouse/editWarehouse', { warehouse, categories });
    })
  );

  // Iot
  router.use('/:id/iot', authenticate, require('./iot')(db));

  return router;
};
