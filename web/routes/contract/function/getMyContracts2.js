const { fn, col, Op } = require('sequelize');

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
  }
  return conditions;
};


const getConditions2 = (user_email, startDate, endDate, cstatus ) => {

    let conditions2 = [];

    if(user_email){

        conditions2.push(
            {user_email: user_email},
       );

    }
    if(cstatus){

      conditions2.push(
          {c_state_id: cstatus},
     );

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
  


// 자신의 계약목록
module.exports = async (db, user_email, locale, page_num, keyword, startDate, endDate, kword, cstatus) => {
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

  let where_clause2;

  if(startDate != ""){

    const conditions2 = getConditions2(user_email, startDate, endDate, cstatus );  
    if (!conditions2.length) {
      where_clause2 = {};
    } else {
      where_clause2 = { [Op.and]: conditions2 };
    }
    
  }
  

console.log(where_clause2);
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
    where: where_clause2 ,
    
    include: {
      model: db.Warehouse,
      required: true,
      attributes: ['name_ko', 'name_en', 'address1_ko'],
      where: where_clause,
    },
    
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  const count = await db.LeaseContract.count({
    include: { model: db.Warehouse, required: true, where: where_clause },
    where: { user_email },
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
    });
  }
  return {
    count,
    total_page: !count ? 1 : Math.floor((count - 1) / limit) + 1,
    contracts,
    testcontract
  };

  
};

