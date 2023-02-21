const getWarehousesForMain = require('./warehouse/function/getWarehousesForMain');

module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  const { doAsync } = require('$base/utils/asyncWrapper');
  const getLocalePrice = require('$base/utils/getLocalePrice');
  const authenticate = require('$base/middlewares/authenticate');
  const getMyContracts2 = require('./contract/function/getMyContracts2');
  const getContractDetail = require('./contract/function/getContractDetail');
  const getContracts = require('./contract/function/getContracts');


  // 메인페이지
  router.get('/', async (req, res) => {
    const locale = res.locale;

    const warehouses = await getWarehousesForMain(db, locale);

    res.render('main', { warehouses });
  });

  // 로그인
  router.get('/ ', (req, res) => {
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
          ({ total_page, contracts } = await getMyContracts2(
            db,
            email,
            locale,
            page_num,
            keyword,
            startDate,
            endDate,
            kword
          ));
        }  
        // 관리자일 경우
        else if (role === 'admin') {
          ({ total_page, contracts } = await getContracts2(
            db,
            locale,
            page_num,
            keyword,
            startDate,
            endDate,
            kword
          ));
        }

        for(var i = 0 ; i < contracts.length ; i++ ) {
          if(contracts[i].state == 4) {
            status2 = status2 + 1;
          }else if(contracts[i].state == 3) {
            status3 = status3 + 1 ;
          }
          status1 = status1 + 1;
        }
        //console.log(contracts[0].state);

        res.render('mypage', { total_page, contracts, status1, status2, status3, startDate, endDate, kword });
      })
    );
  

      // 내정보관리
    router.get('/logininfo', (req, res) => {
      res.render('logininfo');
    });

  // 창고디테일
  router.get('/waredetail', (req, res) => {
    res.render('waredetail');
  });
  
  // 결제 내역ㄴ
  router.get('/payment', (req, res) => {
    res.render('payment');
  });

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
