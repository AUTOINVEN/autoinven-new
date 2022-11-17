const getWarehousesForMain = require('./warehouse/function/getWarehousesForMain');

module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  const { doAsync } = require('$base/utils/asyncWrapper');
  const getLocalePrice = require('$base/utils/getLocalePrice');
  const authenticate = require('$base/middlewares/authenticate');

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
      res.render('search', { warehouses, categories });
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
