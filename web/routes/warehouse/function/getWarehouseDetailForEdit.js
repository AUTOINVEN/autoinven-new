const getIotInfo = (iot_devices) => {
  if (!iot_devices || !iot_devices.length) {
    return [];
  } else {
    return iot_devices.map((iot) => {
      return {
        device_id: iot.device_id,
        url: iot.url,
      };
    });
  }
};

const getImages = (images) => {
  if (!images || !images.length) {
    return [];
  } else {
    return images.map((img) => {
      return img.url;
    });
  }
};

module.exports = async (db, locale, warehouse_id) => {
  const { fn, col } = require('sequelize');

  const getLocalePrice = require('$base/utils/getLocalePrice');

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
        model: db.Address,
        required: true,
      },
      {
        model: db.WarehouseImage,
        attributes: ['url'],
      },
      {
        model: db.IotDevice,
        attributes: ['device_id', 'url'],
      },
    ],
  });

  if (!warehouse_result) {
    const error = new Error('Warehouse Not Found');
    error.statusCode = 404;

    throw error;
  }

  

  return {
    warehouse_id: warehouse_result.warehouse_id,
    name: warehouse_result.name_ko,
    name_en: warehouse_result.name_en,
    category: warehouse_result.Category.name,
    rent: await getLocalePrice(locale, warehouse_result.rent),
    zip_code: warehouse_result.Address.zip_code,
    latitude: warehouse_result.Address.latitude,
    longitude: warehouse_result.Address.longitude,
    address1: warehouse_result.address1_ko,
    address2: warehouse_result.address2_ko,
    address1_en: warehouse_result.address1_en,
    address2_en: warehouse_result.address2_en,
    land_area: warehouse_result.land_area,
    common_area: warehouse_result.common_area,
    possible_area: warehouse_result.possible_area,
    dedicated_area: warehouse_result.dedicated_area,
    total_ground_area: warehouse_result.total_ground_area,
    story: warehouse_result.story,
    height: warehouse_result.height,
    restriction: warehouse_result.restriction_ko,
    restriction_en: warehouse_result.restriction_en,
    completion_date: warehouse_result.completion_date,
    access: warehouse_result.access_ko,
    access_en: warehouse_result.access_en,
    description: warehouse_result.description_ko,
    description_en: warehouse_result.description_en,
    note: warehouse_result.note_ko,
    note_en: warehouse_result.note_en,
    is_bonded: warehouse_result.is_bonded,
    commercial_lift: warehouse_result.commercial_lift,
    is_verified: warehouse_result.is_verified,
    docking_station: warehouse_result.docking_station,
    rack: warehouse_result.rack,
    images: getImages(warehouse_result.WarehouseImages),
    devices: getIotInfo(warehouse_result.IotDevices),
    email:warehouse_result.email,
    tel:warehouse_result.tel,
    leasestart:warehouse_result.leasestart,
    leaseend:warehouse_result.leaseend,
    sensor_id:warehouse_result.sensor_id
  };
};
