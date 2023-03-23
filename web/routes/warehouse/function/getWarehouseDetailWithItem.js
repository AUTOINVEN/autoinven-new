const getIotUrl = (iot_devices) => {
  if (!iot_devices || !iot_devices.length) {
    return [];
  } else {
    return iot_devices.map((iot) => {
      return iot.url;
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

const getFirstImage = (images) => {
  if (!images || !images.length) {
    return null;
  } else {
    return images[0].url;
  }
};

const getItemTimeStamp = (item) => {
  const time_stamps = item.ItemTimestamps;

  if (!time_stamps || !time_stamps.length) {
    return item.createdAt;
  } else {
    return time_stamps[0].createdAt;
  }
};

const getItemsOfContract = (items) => {
  if (!items || !items.length) {
    return [];
  } else {
    return items.map((item) => {
      return {
        item_id: item.item_id,
        name: item.name,
        state: item.i_state_id,
        owner_name: item.User.name,
        date: getItemTimeStamp(item),
        image: getFirstImage(item.ItemImages),
      };
    });
  }
};

const getItemsOfWarehouse = (contracts) => {
  if (!contracts || !contracts.length) {
    return [];
  } else {
    return contracts.reduce((item_array, contract) => {
      return item_array.concat(getItemsOfContract(contract.Items));
    }, []);
  }
};

module.exports = async (db, locale, warehouse_id, user_email) => {
  const { fn, col } = require('sequelize');

  const getLocalePrice = require('$base/utils/getLocalePrice');
  const getLocaleLanguageValue = require('$base/utils/getLocaleLanguageValue');
  const where_clause = user_email ? { user_email } : null;

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
      {
        model: db.LeaseContract,
        where: where_clause,
        include: {
          model: db.Item,
          attributes: {
            include: [
              [
                fn(
                  'date_format',
                  col('LeaseContracts->Items.createdAt'),
                  '%Y-%m-%d %H:%i'
                ),
                'createdAt',
              ],
            ],
            exclude: ['qrcode', 'note'],
          },
          include: [
            {
              model: db.User,
              required: true,
              attributes: ['name'],
            },
            {
              model: db.ItemTimestamp,
              attributes: [
                [
                  fn(
                    'date_format',
                    col('LeaseContracts->Items->ItemTimestamps.createdAt'),
                    '%Y-%m-%d %H:%i'
                  ),
                  'createdAt',
                ],
              ],
              order: ['createdAt', 'DESC'],
            },
            {
              model: db.ItemImage,
              attributes: ['url'],
            },
          ],
        },
      },
    ],
  });

  if (!warehouse_result) {
    const error = new Error('Warehouse Not Found');
    error.statusCode = 404;

    throw error;
  }

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
    rent: await getLocalePrice(locale, warehouse_result.rent),
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
    iot_url: getIotUrl(warehouse_result.IotDevices),
    images: getImages(warehouse_result.WarehouseImages),
    items: getItemsOfWarehouse(warehouse_result.LeaseContracts),
    type : warehouse_result.data_type,
    email : warehouse_result.email,
    tel : warehouse_result.tel
  };
};
