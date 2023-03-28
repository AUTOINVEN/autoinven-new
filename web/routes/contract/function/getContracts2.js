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
    // name_ko: {
    //   [Op.like]: `%${search_keyword[x]}%`,
    // },
    name_ko: {
      [Op.like]: `%${search_keyword}%`,
    },
  });
  conditions.push({
    name_en: {
      [Op.like]: `%${search_keyword}%`,
    },
    // name_en: {
    //   [Op.like]: `%${search_keyword[x]}%`,
    // },
  });
  return conditions;
};

const getConditions2 = ( cstatus,startDate, endDate) => {

  var regex = RegExp(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/);

  let conditions2 = [];

  if(cstatus){
      conditions2.push({
          c_state_id: cstatus ,
      });

  }
  if(!isNaN(startDate)){
    conditions2.push({
        start_date: { [Op.gte]: startDate,
        },
    });

}
if(!isNaN(endDate)){
    conditions2.push({
        end_date: {[Op.lte]: endDate,
        },
    });
}    
  return conditions2;
};

// 모든 계약 목록
module.exports = async (db, locale, page_num, keyword, startDate, endDate, kword, cstatus) => {
  const getLocalePrice = require('$base/utils/getLocalePrice');
  const getLocaleLanguageValue = require('$base/utils/getLocaleLanguageValue');

  let offset = 0;
  const limit = 10;
  if (!page_num) {
    page_num = 1;
  } else if (page_num > 1) {
    offset = limit * (page_num - 1);
  }

  const conditions = getConditions(kword);
  let where_clause;
  if (!conditions.length) {
    where_clause = {};
  } else {
    where_clause = { [Op.or]: conditions };
  }
  



  const conditions2 = getConditions2(cstatus , startDate, endDate );
  let where_clause2;
  if (!conditions2.length) {
    where_clause2 = {};
  } else {
    where_clause2 = { [Op.and]: conditions2 };
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
    where : where_clause2,
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
    include: { model: db.Warehouse, required: true, where: where_clause },
    where: where_clause2,
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

  const testcontract = [];
  for (const contract of contracts_result) {
    testcontract.push({
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
    count,
    total_page: !count ? 1 : Math.floor((count - 1) / limit) + 1,
    contracts,
    testcontract

  };
};
