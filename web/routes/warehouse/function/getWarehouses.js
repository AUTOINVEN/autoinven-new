const { fn, col, Op } = require('sequelize');
const getFullAddress = require('$base/utils/getFullAddress');
const getLocaleLanguageValue = require('$base/utils/getLocaleLanguageValue');

const getImage = (images) => {
  if (!images || !images.length) {
    return null;
  } else {
    return images[0].url;
  }
};

// 유저와 계약된 창고목록
const getMyWarehouses = async (
  db,
  locale,
  user_email,
  offset,
  limit,
  conditions
) => {
  let where_clause;
  if (conditions.length === 0) {
    where_clause = {};
  } else {
    where_clause = { [Op.or]: conditions };
  }
  const contracts_result = await db.LeaseContract.findAll({
    attributes: [
      [
        fn('date_format', col('LeaseContract.start_date'), '%Y-%m-%d'),
        'start_date',
      ],
      [
        fn('date_format', col('LeaseContract.end_date'), '%Y-%m-%d'),
        'end_date',
      ],
      'lease_area',
    ],
    where: { user_email, c_state_id: 3, where_clause },
    include: {
      model: db.Warehouse,
      required: true,
      attributes: [
        'warehouse_id',
        'name_ko',
        'name_en',
        'address1_ko',
        'address1_en',
        'address2_ko',
        'address2_en',
        'is_verified',
      ],
      include: {
        model: db.WarehouseImage,
        attributes: ['url'],
      },
    },
    offset,
    limit,
  });

  return contracts_result.map((contract) => {
    return {
      warehouse_id: contract.Warehouse.warehouse_id,
      start_date: contract.start_date,
      end_date: contract.end_date,
      name: getLocaleLanguageValue(
        locale,
        contract.Warehouse.name_ko,
        contract.Warehouse.name_en
      ),
      address: getLocaleLanguageValue(
        locale,
        getFullAddress(
          contract.Warehouse.address1_ko,
          contract.Warehouse.address2_ko
        ),
        getFullAddress(
          contract.Warehouse.address1_en,
          contract.Warehouse.address2_en
        )
      ),
      area: contract.lease_area,
      is_verified: contract.Warehouse.is_verified,
      image: getImage(contract.Warehouse.WarehouseImages),
    };
  });
};

// 모든 창고목록
const getAllWarehouses = async (db, locale, offset, limit, conditions) => {
  let where_clause;
  if (conditions.length === 0) {
    where_clause = {};
  } else {
    where_clause = { [Op.or]: conditions };
  }
  console.log(where_clause);
  const warehouses_result = await db.Warehouse.findAll({
    attributes: [
      'warehouse_id',
      'name_ko',
      'name_en',
      'address1_ko',
      'address1_en',
      'address2_ko',
      'address2_en',
      'is_verified',
    ],
    where: where_clause,
    include: {
      model: db.WarehouseImage,
      attributes: ['url'],
    },
    offset,
    limit,
  });

  return warehouses_result.map((warehouse) => {
    return {
      warehouse_id: warehouse.warehouse_id,
      name: getLocaleLanguageValue(
        locale,
        warehouse.name_ko,
        warehouse.name_en
      ),
      address: getLocaleLanguageValue(
        locale,
        getFullAddress(warehouse.address1_ko, warehouse.address2_ko),
        getFullAddress(warehouse.address1_en, warehouse.address2_en)
      ),
      is_verified: warehouse.is_verified,
      image: getImage(warehouse.WarehouseImages),
    };
  });
};

const getConditions = (keyword) => {
  const regex = / /gi;
  let keywords;
  if (keyword) {
    keywords = [keyword.replace(regex, ''), keyword.trim()];
  } else {
    return [];
  }
  let conditions = [];
  for (x in keywords) {
    conditions.push({
      name_ko: {
        [Op.like]: `%${keywords[x]}%`,
      },
    });
    conditions.push({
      name_en: {
        [Op.like]: `%${keywords[x]}%`,
      },
    });
    conditions.push({
      address1_ko: {
        [Op.like]: `%${keywords[x]}%`,
      },
    });
    conditions.push({
      address1_en: {
        [Op.like]: `%${keywords[x]}%`,
      },
    });
    conditions.push({
      warehouse_id: {
        [Op.like]: `%${keywords[x]}%`,
      },
    });
  }
  return conditions;
};

module.exports = async (db, locale, page_num, keyword, user_email) => {
  let warehouses = [];
  let offset = 0;
  const limit = 10;
  if (!page_num) {
    page_num = 1;
  } else if (page_num > 1) {
    offset = limit * (page_num - 1);
  }
  console.log(offset, page_num);

  const conditions = getConditions(keyword);

  // 유저일 경우
  if (user_email) {
    warehouses = getMyWarehouses(
      db,
      locale,
      user_email,
      offset,
      limit,
      conditions
    );
  }

  // 관리자일 경우
  else {
    warehouses = getAllWarehouses(db, locale, offset, limit, conditions);
  }

  return warehouses;
};
