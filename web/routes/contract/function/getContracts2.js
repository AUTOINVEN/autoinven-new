const { fn, col, Op } = require('sequelize');

const getConditions = (keyword) => {
  const regex = / /gi;
  let search_keyword;
  if (keyword) {
    search_keyword = keyword.trim().replace(regex, '%');
  } else {
    return [];
  }
  let conditions = [];
  conditions.push({
    name_ko: {
      [Op.like]: `%${search_keyword[x]}%`,
    },
  });
  conditions.push({
    name_en: {
      [Op.like]: `%${search_keyword[x]}%`,
    },
  });
  return conditions;
};

// 모든 계약 목록
module.exports = async (db, locale, page_num, keyword) => {
  const getLocalePrice = require('$base/utils/getLocalePrice');
  const getLocaleLanguageValue = require('$base/utils/getLocaleLanguageValue');

  let offset = 0;
  const limit = 10;
  if (!page_num) {
    page_num = 1;
  } else if (page_num > 1) {
    offset = limit * (page_num - 1);
  }

  const conditions = getConditions(keyword);
  let where_clause;
  if (!conditions.length) {
    where_clause = {};
  } else {
    where_clause = { [Op.or]: conditions };
  }

  const contracts_result = await db.LeaseContract.findAll({
    attributes: [
      'l_contract_id',
      'c_state_id',
      [
        fn('date_format', col('LeaseContract.start_date'), '%Y-%m-%d'),
        'start_date',
      ],
      [
        fn('date_format', col('LeaseContract.end_date'), '%Y-%m-%d'),
        'end_date',
      ],
      'lease_area',
      'amount',
      [
        fn('date_format', col('LeaseContract.createdAt'), '%Y-%m-%d'),
        'createdAt',
      ],
    ],
    include: [
      {
        model: db.Warehouse,
        required: true,
        attributes: ['name_ko', 'name_en', 'address1_ko'],
        where: where_clause,
      },
      {
        model: db.User,
        required: true,
        attributes: ['name'],
      },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  const count = await db.LeaseContract.count({
    where: where_clause,
  });

  const contracts = [];
  for (const contract of contracts_result) {
    contracts.push({
      id: contract.l_contract_id,
      state: contract.c_state_id,
      name: getLocaleLanguageValue(
        locale,
        contract.Warehouse.name_ko,
        contract.Warehouse.name_en
      ),
      address : contract.Warehouse.address1_ko,
      period: `${contract.start_date} ~ ${contract.end_date}`,
      area: contract.lease_area,
      price: await getLocalePrice(locale, contract.amount),
      created_date: contract.createdAt,
      contractor_name: contract.User.name,
    });
  }

  return {
    total_page: !count ? 1 : Math.floor((count - 1) / limit) + 1,
    contracts,
  };
};
