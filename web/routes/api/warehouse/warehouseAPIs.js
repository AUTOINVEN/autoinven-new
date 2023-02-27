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
  request_email
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
  request_email
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
  warehouse.request_email = checkEmpty(warehouse.request_email);

  return warehouse;
};

const registerWarehouse = async (req, db) => {
  const newWarehouse = checkEmptyWarehouseAttribute(getNewWarehouse(req.body)); // 창고 가져오기

  let { device_ids } = req.body;
  if (device_ids === '') {
    device_ids = null;
  } else {
    device_ids.pop();
  }
  if (newWarehouse.completion_date == '') {
    delete newWarehouse.completion_date;
  }
  const addressInfo = getAddressInfo(req.body); // 주소 가져오기
  const whFiles = req.files; // 이미지 파일들 가져오기
  // 주소가 기존에 존재하는지 검색(제약조건 때문)
  let address = await db.Address.findByPk(addressInfo.address);
  // 주소가 등록되어 있지 않다면 등록
  if (!address) {
    address = await db.Address.create(addressInfo);
  }
  // 창고 등록
  const warehouse = await db.Warehouse.create(newWarehouse);
  if (!warehouse) {
    const err = new Error('warehouse register error');
    err.statusCode(500);
    throw err;
  }
  // 이미지 등록
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
  const newInfo = checkEmptyWarehouseAttribute(getNewWarehouse(req.body)); // 새 창고정보 가져오기
  const addressInfo = getAddressInfo(req.body); // 주소 가져오기
  let { deleted_iot_device_ids, added_iot_device_ids } = req.body; // iot 허브 디바이스 아이디들 가져오기

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
  // 주소가 기존에 존재하는지 검색(제약조건 때문)
  let address = await db.Address.findByPk(addressInfo.address);
  // 주소가 등록되어 있지 않다면 등록
  if (!address) {
    address = await db.Address.create(addressInfo);
  }
  // 삭제할 iot 디바이스 허브 아이디 모두 삭제
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
  // 기존 창고 사진 모두 삭제
  const result = await db.WarehouseImage.destroy({ where: { warehouse_id } });

  // 창고 정보 업데이트
  const result3 = await db.Warehouse.update(newInfo, {
    where: { warehouse_id },
  });
  // 수정된 창고 사진 재등록
  for (index in whFiles) {
    const { path } = whFiles[index];
    await db.WarehouseImage.create({
      url: `/${path}`,
      warehouse_id: warehouse_id,
    });
  }
  // 추가할 iot device 추가
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
  // 타입이 입력되지 않으면 전체타입으로 대체
  if (!type) {
    type = [1, 2, 3];
  }
  // 면적이 입력 되지 않으면 현재 1 이상 사용가능한 공간만 검색
  if (!area) {
    area = 1;
  }
  // 1. 기간이 있다면
  if (startDate) {
    //(1) 해당 기간이 포함 된 계약 모두 조회
    //  - warehouse_id 로 그룹
    //  - 각 창고별로 대여 공간 합 구하기
    //(2) (각 창고의 사용가능공간 - 각 창고의 대여공간 합) > 대여할 공간 인 창고만 고르기
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
    //(3) 해당 창고들을 return
    //  - 호출한 함수에서 지도에 찍고, 거리순으로 리스팅
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
  //(3) 해당 창고들을 return
  //  - 호출한 함수에서 지도에 찍고, 거리순으로 리스팅
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
