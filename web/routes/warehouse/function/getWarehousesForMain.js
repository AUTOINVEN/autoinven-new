const getImage = (images) => {
  if (!images || !images.length) {
    return null;
  } else {
    return images[0].url;
  }
};

// 최신등록된 12개 창고목록
module.exports = async (db, locale) => {
  const getLocaleLanguageValue = require('$base/utils/getLocaleLanguageValue');
  const getFullAddress = require('$base/utils/getFullAddress');

  const offset = 0;
  const limit = 8;

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
      'createdAt',
    ],
    include: [
      {
        model: db.Category,
        required: true,
      },
      {
        model: db.WarehouseImage,
        attributes: ['url'],
      },
    ],
    order: [['createdAt', 'DESC']],
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
      category: getLocaleLanguageValue(
        locale,
        warehouse.Category.name_ko,
        warehouse.Category.name_en
      ),
      image: getImage(warehouse.WarehouseImages),
    };
  });
};
