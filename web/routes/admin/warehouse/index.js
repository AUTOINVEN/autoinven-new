module.exports = (db) => {
  const express = require('express');
  const router = express.Router();

  const { doAsync } = require('$base/utils/asyncWrapper');
  const getWarehouses = require('./getWarehouses');

  router.get(
    '/',
    doAsync(async (req, res) => {
      const locale = res.locale;

      const warehouses = await getWarehouses(db, locale);

      res.render('admin/adminWarehouse', { warehouses });
    })
  );

  router.get('/enroll', (req, res) => {
    const user = {
      type: 'admin',
    };
    res.render('admin/enrollWarehouse', {
      user: user,
    });
  });

  router.get('/:warehouse_id/edit', (req, res) => {
    const warehouses = {
      name: '창고명',
      category: '야지',
      rent: '800',
      zip_code: '43241',
      lattitude: '23',
      longitude: '15',
      address1: '대구 광역시 북구 산격동 111-22',
      address2: '대구 스마트 물류단지 내부',
      land_area: 9000,
      common_area: 2900,
      dedicated_area: 6000,
      total_ground_area: 8900,
      story: 3,
      height: 11,
      restriction: '전차종 출입가능',
      completion_date: '2021-08-28',
      access: '정왕IC 9km, 남안산IC 10km',
      description: '깔끔한 신축 물류 창고 입니다.',
      note: '□ 물류장비 - 지게차 5대 : 전동 5대 파렛트 - 목재 : 단면 양방향 1000ea(1000＊1200), □ 보안설비 - 보안시스템 완비(출입보안, CCTV 등) □ 화재설비 - 소화기, 소화전, 화재경보기, 화재감지기, 가스누설경보기, 피난기구, 스프링쿨러 등',
      is_bonded: true,
      commercial_lift: true,
      is_verified: false,
      docking_station: true,
      rack: true,
      categories: [
        {
          category_id: 1,
          name: '일반창고',
        },
        {
          category_id: 2,
          name: '냉동/냉장창고',
        },
        {
          category_id: 3,
          name: '야지',
        },
      ],
    };
    res.render('admin/editWarehouse', {
      warehouses,
    });
  });

  return router;
};
