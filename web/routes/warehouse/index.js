const devicelog = require('$base/models/devicelog');

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
    //authorizeAdmin,
    doAsync(async (req, res) => {
      const { email } = req.session;
      const categories = await getCategories(db);

      res.render('warehouse/enrollWarehouse', {
        categories,
        email
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

      let DeviceLog = await db.DeviceLog.findAll({
        where: {
          data02: warehouse.sensor_id || 0001,
        },
        order: [ [ 'regdate', 'DESC' ]],
        limit : 30
      });
      //console.log(DeviceLog)

      let sensor01 = []
      let sensor02 = []
      let sensor03 = []
      let sensor04 = []
      let labels = []
      DeviceLog.forEach((v)=>{
        sensor01.push(parseInt(v.data03,16))
        sensor02.push(parseInt(v.data04,16))
        sensor03.push(parseInt(v.data05,16))
        sensor04.push(parseInt(v.data06,16))
        labels.push(timeForToday(v.regdate))
      })

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
        DeviceLog,
        sensor01,
        sensor02,
        sensor03,
        sensor04,
        labels
      });

      function dateFormat(date) {
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();

        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;
        hour = hour >= 10 ? hour : '0' + hour;
        minute = minute >= 10 ? minute : '0' + minute;
        second = second >= 10 ? second : '0' + second;

        return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
      }
      function timeForToday(value) {
        const today = new Date();
        const timeValue = new Date(value);

        const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
        if (betweenTime < 1) return '방금전';
        if (betweenTime < 60) {
            return `${betweenTime}분전`;
        }

        const betweenTimeHour = Math.floor(betweenTime / 60);
        if (betweenTimeHour < 24) {
            return `${betweenTimeHour}시간전`;
        }

        const betweenTimeDay = Math.floor(betweenTime / 60 / 24);
        if (betweenTimeDay < 365) {
            return `${betweenTimeDay}일전`;
        }

        return `${Math.floor(betweenTimeDay / 365)}년전`;
      }
    })
  );

  // 창고 수정
  router.get(
    '/:id/edit',
    authenticate,
    //authorizeAdmin,
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
  router.use('/:id/iot', require('./iot')(db));

  return router;
};
