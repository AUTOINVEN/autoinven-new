const { Op, literal } = require('sequelize');
const warehouseWithItems = require('../../warehouse/function/getWarehouseDetailWithItem');

const getNewWarehouse = ({
  name_ko,
  name_en,
  land_area,
  total_ground_area,
  common_area,
  dedicated_area,
  completion_date,
  address1_ko,
  address1_en,
  address2_ko,
  address2_en,
  description_ko,
  description_en,
  note_ko,
  note_en,
  story,
  rent,
  category_id,
  restriction_ko,
  restriction_en,
  access_ko,
  access_en,
  height,
  docking_station,
  rack,
  is_bounded,
  commercial_lift,
  is_verified,
}) => ({
  name_ko,
  name_en,
  land_area,
  total_ground_area,
  common_area,
  dedicated_area,
  completion_date,
  address1_ko,
  address1_en,
  address2_ko,
  address2_en,
  description_ko,
  description_en,
  note_ko,
  note_en,
  story,
  rent,
  category_id,
  restriction_ko,
  restriction_en,
  access_ko,
  access_en,
  height,
  docking_station,
  rack,
  is_bounded,
  commercial_lift,
  is_verified,
});

const getAddressInfo = ({
  address1_ko: address,
  latitude,
  longitude,
  zip_code,
}) => ({
  address,
  latitude,
  longitude,
  zip_code,
});

const getAllWarehouses = async (db) => {
  const warehouses = await db.Warehouse.findAll({
    where: { is_verified: true },
    include: [{ model: db.WarehouseImage, attributes: ['url'] }],
  });
  return warehouses;
};
const getWarehouseInfo = async (warehouse_id, db) => {
  const warehouse = await db.Warehouse.findOne({
    where: { warehouse_id },
    include: [{ model: db.WarehouseImage, attributes: ['url'] }],
  });
  return warehouse;
};

const getItemsOfWarehouse = async (db, warehouse_id) => {
  const { items } = await warehouseWithItems(db, 'ko', warehouse_id);
  return items;
};

const checkEmpty = (data) => {
  if (data === '') {
    return null;
  } else {
    return data;
  }
};

const checkEmptyWarehouseAttribute = (warehouse) => {
  warehouse.land_area = checkEmpty(warehouse.land_area);
  warehouse.common_area = checkEmpty(warehouse.common_area);
  warehouse.total_ground_area = checkEmpty(warehouse.total_ground_area);
  warehouse.dedicated_area = checkEmpty(warehouse.dedicated_area);
  warehouse.completion_date = checkEmpty(warehouse.completion_date);
  warehouse.address2_ko = checkEmpty(warehouse.address2_ko);
  warehouse.address2_en = checkEmpty(warehouse.address2_en);
  warehouse.description_ko = checkEmpty(warehouse.description_ko);
  warehouse.description_en = checkEmpty(warehouse.description_en);
  warehouse.note_ko = checkEmpty(warehouse.note_ko);
  warehouse.note_en = checkEmpty(warehouse.note_en);
  warehouse.story = checkEmpty(warehouse.story);
  warehouse.rent = checkEmpty(warehouse.rent);
  warehouse.restriction_ko = checkEmpty(warehouse.restriction_ko);
  warehouse.restriction_en = checkEmpty(warehouse.restriction_en);
  warehouse.access_ko = checkEmpty(warehouse.access_ko);
  warehouse.access_en = checkEmpty(warehouse.access_en);
  warehouse.height = checkEmpty(warehouse.height);
  warehouse.docking_station = checkEmpty(warehouse.docking_station);
  warehouse.rack = checkEmpty(warehouse.rack);
  warehouse.is_bounded = checkEmpty(warehouse.is_bounded);
  warehouse.commercial_lift = checkEmpty(warehouse.commercial_lift);

  return warehouse;
};

const registerWarehouse = async (req, db) => {
  const newWarehouse = checkEmptyWarehouseAttribute(getNewWarehouse(req.body)); // ?????? ????????????

  let { device_ids } = req.body;
  if (device_ids === '') {
    device_ids = null;
  } else {
    device_ids.pop();
  }
  if (newWarehouse.completion_date == '') {
    delete newWarehouse.completion_date;
  }
  const addressInfo = getAddressInfo(req.body); // ?????? ????????????
  const whFiles = req.files; // ????????? ????????? ????????????
  // ????????? ????????? ??????????????? ??????(???????????? ??????)
  let address = await db.Address.findByPk(addressInfo.address);
  // ????????? ???????????? ?????? ????????? ??????
  if (!address) {
    address = await db.Address.create(addressInfo);
  }
  // ?????? ??????
  const warehouse = await db.Warehouse.create(newWarehouse);
  if (!warehouse) {
    const err = new Error('warehouse register error');
    err.statusCode(500);
    throw err;
  }
  // ????????? ??????
  for (index in whFiles) {
    const { path } = whFiles[index];
    await db.WarehouseImage.create({
      url: `/${path}`,
      warehouse_id: warehouse.warehouse_id,
    });
  }
  if (device_ids) {
    for (i in device_ids) {
      const iot_device = await db.IotDevice.create({
        device_id: device_ids[i],
        warehouse_id: warehouse.warehouse_id,
      });
      if (!iot_device) {
        const err = new Error('iot device register error');
        err.statusCode(500);
        throw err;
      }
    }
  }

  return warehouse;
};

const editWarehouse = async (req, db) => {
  const { warehouse_id } = req.params;
  const newInfo = checkEmptyWarehouseAttribute(getNewWarehouse(req.body)); // ??? ???????????? ????????????
  const addressInfo = getAddressInfo(req.body); // ?????? ????????????
  let { deleted_iot_device_ids, added_iot_device_ids } = req.body; // iot ?????? ???????????? ???????????? ????????????

  if (deleted_iot_device_ids === '') {
    deleted_iot_device_ids = null;
  } else {
    deleted_iot_device_ids.pop();
  }
  if (added_iot_device_ids === '') {
    added_iot_device_ids = null;
  } else {
    added_iot_device_ids.pop();
  }
  const whFiles = req.files;
  // ????????? ????????? ??????????????? ??????(???????????? ??????)
  let address = await db.Address.findByPk(addressInfo.address);
  // ????????? ???????????? ?????? ????????? ??????
  if (!address) {
    address = await db.Address.create(addressInfo);
  }
  // ????????? iot ???????????? ?????? ????????? ?????? ??????
  if (deleted_iot_device_ids) {
    for (i in deleted_iot_device_ids) {
      const del_result = await db.WarehouseImage.destroy({
        where: { device_id: deleted_iot_device_ids[i] },
      });
      if (del_result) {
        const err = new Error('iot device delete error');
        err.statusCode = 400;
        throw err;
      }
    }
  }
  // ?????? ?????? ?????? ?????? ??????
  const result = await db.WarehouseImage.destroy({ where: { warehouse_id } });

  // ?????? ?????? ????????????
  const result3 = await db.Warehouse.update(newInfo, {
    where: { warehouse_id },
  });
  // ????????? ?????? ?????? ?????????
  for (index in whFiles) {
    const { path } = whFiles[index];
    await db.WarehouseImage.create({
      url: `/${path}`,
      warehouse_id: warehouse_id,
    });
  }
  // ????????? iot device ??????
  if (added_iot_device_ids) {
    for (i in added_iot_device_ids) {
      const iot_device = await db.IotDevice.create({
        device_id: added_iot_device_ids[i],
        warehouse_id: warehouse_id,
      });
      if (!iot_device) {
        const err = new Error('iot device register error');
        err.statusCode(500);
        throw err;
      }
    }
  }
  if (result3[0]) {
    return result3[0];
  } else {
    const err = new Error('Warehouse Not found');
    err.statusCode = 404;
    throw err;
  }
};

const searchWarehouse = async (req, db) => {
  let { startDate, endDate, type, area } = req.query;
  // ????????? ???????????? ????????? ?????????????????? ??????
  if (!type) {
    type = [1, 2, 3];
  }
  // ????????? ?????? ?????? ????????? ?????? 1 ?????? ??????????????? ????????? ??????
  if (!area) {
    area = 1;
  }
  // 1. ????????? ?????????
  if (startDate) {
    //(1) ?????? ????????? ?????? ??? ?????? ?????? ??????
    //  - warehouse_id ??? ??????
    //  - ??? ???????????? ?????? ?????? ??? ?????????
    //(2) (??? ????????? ?????????????????? - ??? ????????? ???????????? ???) > ????????? ?????? ??? ????????? ?????????
    const warehouses = await db.Warehouse.findAll({
      attributes: [
        'warehouse_id',
        [
          literal('(dedicated_area - IFNULL(SUM(lease_area),0))'),
          'available_area',
        ],
      ],
      include: [
        {
          model: db.LeaseContract,
          required: false,
          attributes: [],
          where: {
            [Op.or]: [
              {
                start_date: {
                  [Op.between]: [startDate, endDate],
                },
              },
              {
                end_date: {
                  [Op.between]: [startDate, endDate],
                },
              },
            ],
          },
        },
      ],
      where: {
        category_id: type,
        is_verified: true,
      },
      group: ['warehouse_id'],
      having: { available_area: { [Op.gte]: area } },
    });
    //(3) ?????? ???????????? return
    //  - ????????? ???????????? ????????? ??????, ??????????????? ?????????
    return warehouses;
  }
};

const getAvailableArea = async (req, db) => {
  const warehouse_id = req.params.warehouse_id;
  let { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    const err = new Error('start date or end date is not proper.');
    err.statusCode = 400;
    throw err;
  }
  const warehouse = await db.Warehouse.findOne({
    attributes: [
      'warehouse_id',
      [
        literal('(dedicated_area - IFNULL(SUM(lease_area),0))'),
        'available_area',
      ],
    ],
    include: [
      {
        model: db.LeaseContract,
        required: false,
        attributes: [],
        where: {
          [Op.or]: [
            {
              start_date: {
                [Op.between]: [startDate, endDate],
              },
            },
            {
              end_date: {
                [Op.between]: [startDate, endDate],
              },
            },
          ],
        },
      },
    ],
    where: {
      warehouse_id,
    },
    group: ['warehouse_id'],
  });
  //(3) ?????? ???????????? return
  //  - ????????? ???????????? ????????? ??????, ??????????????? ?????????
  return warehouse;
};

const getQueryString = (condition, keywords) => {
  let conditions = [];
  for (x in keywords) {
    conditions.push({
      condition: {
        [Op.like]: `%${keywords[x]}%`,
      },
    });
  }
  return conditions;
};

const searchWarehouseByKeyword = async (req, db) => {
  const { keyword, page_num } = req.query;
  let offset = 0;
  const re = /[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/;
  const keywords = keyword.split(re);

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
  if (page_num > 1) {
    offset = 10 * (page_num - 1);
  }

  const warehouses = await db.Warehouse.findAll({
    where: {
      [Op.or]: conditions,
    },
    offset,
    limit: 10,
  });
  return warehouses;
};

module.exports = {
  getAllWarehouses,
  getWarehouseInfo,
  registerWarehouse,
  editWarehouse,
  searchWarehouse,
  getAvailableArea,
  searchWarehouseByKeyword,
  getItemsOfWarehouse,
};
