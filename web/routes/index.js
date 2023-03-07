const getContracts3 = require('./contract/function/getContracts3');
const getWarehousesForMain = require('./warehouse/function/getWarehousesForMain');

module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  const { doAsync } = require('$base/utils/asyncWrapper');
  const getLocalePrice = require('$base/utils/getLocalePrice');
  const authenticate = require('$base/middlewares/authenticate');
  const getMyContracts2 = require('./contract/function/getMyContracts2');
  const getMyContracts3 = require('./contract/function/getMyContracts3');
  const getContracts2 = require('./contract/function/getContracts2');
  const getContractDetail = require('./contract/function/getContractDetail');
  const getContracts = require('./contract/function/getContracts');
  const getWarehouses2 = require('./warehouse/function/getWarehouses2');
  const getWarehouses3 = require('./warehouse/function/getWarehouses3');
  const getWarehouseDetail = require('./warehouse/function/getWarehouseDetail');
  const getWarehouseDetailWithItem = require('./warehouse/function/getWarehouseDetailWithItem');
  const authorizeContractor = require('./warehouse/function/authorizeContractor');
  const checkWarehouseDetailParameter = require('./warehouse/function/checkWarehouseDetailParameter');


  // 메인페이지
  router.get('/', async (req, res) => {
    const locale = res.locale;
    const warehouses = await getWarehousesForMain(db, locale);
    res.render('main', { warehouses });
  });

 // 로그인
  router.get('/signin', (req, res) => {
    res.render('auth/signin');
  });

  // 회원가입
  router.get('/signup', (req, res) => {
    res.render('auth/signup');
  });

  // 내정보관리 -  계약 현황


    router.get(
      '/mypage',
      doAsync(async (req, res) => {
        let { startDate, endDate, kword } = req.query;

        let status1 = 0;
        let status2 = 0;
        let status3 = 0;
        let status4 = 0;
        let status5 = 0;
        let status6 = 0;
        let status7 = 0;
        let status8 = 0;
        let status9 = 0;

        const locale = res.locale;

        const {
          session: { role, email },
        } = req;
        const {
          query: { keyword, page_num },
        } = req;
        let contracts = [];
        let total_page = 0;

 
        // 유저일 경우
        if (role === 'user') {

            ({count } = await getWarehouses3(
              db,
              locale,
              page_num,
              keyword,
              email
            ));
        
            status2 = count;
        
            ({count } = await getWarehouses2(
              db,
              locale,
              page_num,
              keyword,
              email
            ));
            
            status1 = count;

            ({ count } = await getMyContracts3(
              db,
              email,
              locale,
              page_num,
              keyword,
              startDate,
              endDate
            ));
            status5 = count;

            ({ count, total_page, contracts } = await getMyContracts2(
              db,
              email,
              locale,
              page_num,
              keyword,
              startDate,
              endDate,
              kword
            ));
            status4 = count;
          
            
        }  
        // 관리자일 경우
        else if (role === 'admin') {

            ({ count } = await getWarehouses3(
              db,
              locale,
              page_num,
              keyword
            ));

            status2 = count;

            ({ count } = await getWarehouses2(
              db,
              locale,
              page_num,
              keyword,
              email
            ));

            status1 = count;   

          ({ count, total_page, contracts } = await getContracts2(
            db,
            locale,
            page_num,
            keyword,
            startDate,
            endDate,
            kword
          ));
          status5 = count;
          count = 0;
          total_page = 0;
          contracts = 0;
        }

        for(var i = 0 ; i < contracts.length ; i++ ) {
          if(contracts[i].state == 4) {
            status7 = status7 + 1;
          }else if(contracts[i].state == 3) {
            status8 = status8 + 1 ;
          }
          status9 = status9 + 1;
        }

        // 각 메뉴의 값들 
        status3 = status1 + status2;
        status6 = status4 + status5;

        res.render('mypage', { total_page, contracts, status1, status2, status3, status4, status5, status6, status7, status8, status9, startDate, endDate, kword });
      })
    );

    // 내정보관리 -  나에게 요청한 창고

    router.get(
      '/myopage',
      doAsync(async (req, res) => {
        let { startDate, endDate, kword } = req.query;

        let status1 = 0;
        let status2 = 0;
        let status3 = 0;
        let status4 = 0;
        let status5 = 0;
        let status6 = 0;
        let status7 = 0;
        let status8 = 0;
        let status9 = 0;
    

        const locale = res.locale;

        const {
          session: { role, email },
        } = req;
        const {
          query: { keyword, page_num },
        } = req;
        let contracts = [];
        let total_page = 0;

 
        // 유저일 경우
        if (role === 'user') {

            ({count } = await getWarehouses3(
              db,
              locale,
              page_num,
              keyword,
              email
            ));
        
            status2 = count;
        
            ({count } = await getWarehouses2(
              db,
              locale,
              page_num,
              keyword,
              email
            ));
            status1 = count;
            
            ({ count, total_page, contracts } = await getMyContracts2(
              db,
              email,
              locale,
              page_num,
              keyword,
              startDate,
              endDate
            ));

           status4 = count;

            ({ count, total_page, contracts } = await getMyContracts3(
              db,
              email,
              locale,
              page_num,
              keyword,
              startDate,
              endDate,
              kword
            ));
            status5 = count;
        }  
        // 관리자일 경우
        else if (role === 'admin') {

            ({ count } = await getWarehouses3(
              db,
              locale,
              page_num,
              keyword
            ));

            status2 = count;

            ({ count } = await getWarehouses2(
              db,
              locale,
              page_num,
              keyword,
              email
            ));

            status1 = count;

          ({ count, total_page, contracts } = await getContracts2(
            db,
            locale,
            page_num,
            keyword,
            startDate,
            endDate,
            kword
          ));
          status5 = count;

          
        }

        for(var i = 0 ; i < contracts.length ; i++ ) {
          if(contracts[i].state == 4) {
            status7 = status7 + 1;
          }else if(contracts[i].state == 3) {
            status8 = status8 + 1 ;
          }
          status9 = status9 + 1;
        }

        // 각 메뉴의 값들 
        status3 = status1 + status2;
        status6 = status4 + status5;

        res.render('myopage', { total_page, contracts, status1, status2, status3, status4, status5, status6, status7, status8, status9, startDate, endDate, kword });
      })
    );
  

      // 내정보관리
    router.get('/logininfo', (req, res) => {
      res.render('logininfo');
    });

  // 창고디테일
    router.get('/waredetail/:id', doAsync(async (req, res) => {
        const locale = res.locale;
        const {
          params: { id: contract_id },
        } = req;
        const {
          session: { name, email, phone },
        } = req;

        const user = {
          name,
          email,
          phone,
        };

        const contract = await getContractDetail(db, locale, contract_id);
        const warehouse = await getWarehouseDetail(
          db,
          locale,
          contract.warehouse_id
        );

        res.render('waredetail', {
          user,
          warehouse,
          contract_info: contract,
        });
      })
    );
  
  // 결제 내역
  router.get('/payment', (req, res) => {
    res.render('payment');
  });

  // 내 창고내역
  router.get('/mywhouse', authenticate,
  doAsync(async (req, res) => {

    let { startDate, endDate, kword } = req.query;

    let status1 = 0;
    let status2 = 0;
    let status3 = 0;
    let status4 = 0;
    let status5 = 0;
    let status6 = 0;

    let warehouses = [];
    let total_page = 0;

    const locale = res.locale;
    const {
      session: { role, email },
    } = req;
    const {
      query: { keyword, page_num },
    } = req;

    

    // 유저일 경우
   if (role === 'user') {
    //순서를 잘 정리해야한다.
    
    status4 = count; ({ count } = await getMyContracts3( // 요청받은 창고
      db,
      email,
      locale,
      page_num,
      keyword,
      startDate,
      endDate
    ));
    status5 = count;

    ({ count, total_page, contracts } = await getMyContracts2( //요청한 창고
      db,
      email,
      locale,
      page_num,
      keyword,
      startDate,
      endDate,
      kword
    ));
    status4 = count;

    ({count, total_page, warehouses } = await getWarehouses3( //등록한 창고
      db,
      locale,
      page_num,
      keyword,
      email
    ));
    status2 = count;

     ({count, total_page, warehouses } = await getWarehouses2( //이용중인 창고
       db,
       locale,
       page_num,
       keyword,
       email,
       startDate,
       endDate,
       kword
     ));     
     status1 = count;

     
   }
   // 관리자일 경우
   else if (role === 'admin') {

    ({ count } = await getContracts2(
      db,
      locale,
      page_num,
      keyword
    ));
    
    status5 = count;

    ({ count, total_page, warehouses } = await getWarehouses3(
      db,
      locale,
      page_num,
      keyword
    ));

    status2 = count;

     ({ count, total_page, warehouses } = await getWarehouses2(
      db,
      locale,
      page_num,
      keyword,
      email,
      kword
     ));

     status1 = count;
     
   }

   status3 = status1 + status2;

   status6 = status4 + status5;
 
    res.render('mywhouse', { total_page, warehouses, status1, status2, status3, status4, status5, status6 ,startDate, endDate, kword  });
  }));

   // 내 등록 창고내역
   router.get('/myiwhouse', authenticate,
   doAsync(async (req, res) => {
 
     let { startDate, endDate, kword } = req.query;
     let status1 = 0;
     let status2 = 0;
     let status3 = 0;
     let status4 = 0;
     let status5 = 0;
     let status6 = 0;

     let warehouses = [];
     let total_page = 0;
 
     const locale = res.locale;
     const {
       session: { role, email },
     } = req;
     const {
       query: { keyword, page_num },
     } = req;

     
 
     // 유저일 경우
    if (role === 'user') {

      status4 = count; ({ count } = await getMyContracts3(
        db,
        email,
        locale,
        page_num,
        keyword,
        startDate,
        endDate
      ));
      status5 = count;

      ({ count, total_page, contracts } = await getMyContracts2(
        db,
        email,
        locale,
        page_num,
        keyword,
        startDate,
        endDate,
        kword
      ));
      status4 = count;


      ({count, total_page, warehouses } = await getWarehouses2(
        db,
        locale,
        page_num,
        keyword,
        email
      ));
      
      status1 = count;

      ({count, total_page, warehouses } = await getWarehouses3(
        db,
        locale,
        page_num,
        keyword,
        email,
        kword
      ));
        
      status2 = count;
      
    }
    // 관리자일 경우
    else if (role === 'admin') {

      ({ count } = await getContracts2(
        db,
        locale,
        page_num,
        keyword,
        startDate,
        endDate,
        kword
      ));

      status5 = count;
      ({ count, total_page, warehouses } = await getWarehouses2(
        db,
        locale,
        page_num,
        keyword,
        email,
        startDate,
        endDate,
        kword
      ));

      status1 = count;

      ({ count, total_page, warehouses } = await getWarehouses3(
        db,
        locale,
        page_num,
        keyword,
        email,
        kword
      ));

      

      status2 = count;
    }

    status3 = status1 + status2;
    
    status6 = status4 + status5;
 
     res.render('myiwhouse', { total_page, warehouses, status1, status2, status3 , status4, status5, status6 , startDate, endDate, kword  });
   }));
 

   // 창고 검색
   router.get(
    '/search',
    doAsync(async (req, res) => {
      
      const locale = res.locale;
      const warehouses = await db.Warehouse.findAll({
        include: [
          {
            model: db.Address,
            attributes: ['latitude', 'longitude', 'zip_code'],
          },
          {
            model: db.WarehouseImage,
          },
        ],
      });

      

      for (const warehouse of warehouses) {
        warehouse.rent = await getLocalePrice(locale, warehouse.rent);
      }

      const categories_result = await db.Category.findAll();
      const categories = categories_result.map((category) => {
        let name;
        if (res.locale === 'ko') {
          name = category.name_ko;
        } else if (res.locale === 'en') {
          name = category.name_en;
        }
        return {
          category_id: category.category_id,
          name,
        };
      });

      
      res.render('search', { warehouses, categories, "keyword" :""});
    })
  );


  // 창고 검색
  router.get(
    '/search2/:keyword',
    doAsync(async (req, res) => {
      console.log("test-"+res.locale);
      const locale = res.locale;
      const warehouses = await db.Warehouse.findAll({
        include: [
          {
            model: db.Address,
            attributes: ['latitude', 'longitude', 'zip_code'],
          },
          {
            model: db.WarehouseImage,
          },
        ],
      });

      for (const warehouse of warehouses) {
        warehouse.rent = await getLocalePrice(locale, warehouse.rent);
      }

      const categories_result = await db.Category.findAll();
      const categories = categories_result.map((category) => {
        let name;
        if (res.locale === 'ko') {
          name = category.name_ko;
        } else if (res.locale === 'en') {
          name = category.name_en;
        }
        return {
          category_id: category.category_id,
          name,
        };
      });

      var searchKeyword = decodeURI(decodeURIComponent(req.params.keyword));
      warehouses_filter = warehouses.filter((data) => {
        return (data.name_ko.includes(searchKeyword) || data.address1_ko.includes(searchKeyword) || data.name_en.includes(searchKeyword) || data.address1_en.includes(searchKeyword));
      })
      res.render('search', { warehouses : warehouses_filter, categories , "keyword" : searchKeyword });
    })
  );



   // 창고 상세
  router.get(
    '/mywaredetail/:id',
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



 
  // 내 정보 수정
  router.get('/myinfo', authenticate, (req, res) => {
    const { email, name, phone } = req.session;
    const user = {
      email,
      name,
      phone,
    };
    res.render('myInfo', { user });
  });

  // 창고
  router.use('/warehouse', require('./warehouse')(db));

  // 계약
  router.use('/contract', authenticate, require('./contract')(db));

  // 아이템
  router.use('/item', authenticate, require('./item')(db));

  router.get('/docs/company', (req, res) => {
    res.render('docs/company');
  });
  router.get('/docs/terms', (req, res) => {
    res.render('docs/terms');
  });
  router.get('/docs/privacy', (req, res) => {
    res.render('docs/privacy');
  });

  return router;
};
