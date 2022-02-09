module.exports = async (db, locale, warehouse_id) => {
  const { fn, col } = require('sequelize');

  const getLocaleLanguageValue = require('$base/utils/getLocaleLanguageValue');

  const warehouse_result = await db.Warehouse.findOne({
    attributes: {
      include: [
        [
          fn('date_format', col('Warehouse.completion_date'), '%Y-%m-%d'),
          'completion_date',
        ],
      ],
    },
    where: { warehouse_id },
    include: [
      {
        model: db.Category,
        required: true,
        attributes: ['name_ko', 'name_en'],
      },
      {
        model: db.IotDevice,
        attributes: ['url'],
      },
      {
        model: db.WarehouseImage,
        attributes: ['url'],
      },
    ],
  });

  return {
    warehouse_id,
    name: getLocaleLanguageValue(
      locale,
      warehouse_result.name_ko,
      warehouse_result.name_en
    ),
    category: getLocaleLanguageValue(
      locale,
      warehouse_result.Category.name_ko,
      warehouse_result.Category.name_en
    ),
    rent: warehouse_result.rent,
    address1: getLocaleLanguageValue(
      locale,
      warehouse_result.address1_ko,
      warehouse_result.address1_en
    ),
    address2: getLocaleLanguageValue(
      locale,
      warehouse_result.address2_ko,
      warehouse_result.address2_en
    ),
    land_area: warehouse_result.land_area,
    common_area: warehouse_result.common_area,
    dedicated_area: warehouse_result.dedicated_area,
    total_ground_area: warehouse_result.total_ground_area,
    story: warehouse_result.story,
    height: warehouse_result.height,
    restriction: getLocaleLanguageValue(
      locale,
      warehouse_result.restriction_ko,
      warehouse_result.restriction_en
    ),
    completion_date: warehouse_result.completion_date,
    access: getLocaleLanguageValue(
      locale,
      warehouse_result.access_ko,
      warehouse_result.access_en
    ),
    description: getLocaleLanguageValue(
      locale,
      warehouse_result.description_ko,
      warehouse_result.description_en
    ),
    note: getLocaleLanguageValue(
      locale,
      warehouse_result.note_ko,
      warehouse_result.note_en
    ),
    is_bonded: warehouse_result.is_bonded,
    commercial_lift: warehouse_result.commercial_lift,
    is_verified: warehouse_result.is_verified,
    docking_station: warehouse_result.docking_station,
    rack: warehouse_result.rack,
    iot_url: warehouse_result.IotDevices.map((iot) => {
      return iot.url;
    }),
    images: warehouse_result.WarehouseImages.map((img) => {
      return img.url;
    }),
  };
};
