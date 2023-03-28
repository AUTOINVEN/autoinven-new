'use strict';
const { Model, fn } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Warehouse extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Warehouse.belongsTo(models.Address, {
        foreignKey: 'address1_ko',
      });
      models.Warehouse.belongsTo(models.Category, {
        foreignKey: 'category_id',
      });
      models.Warehouse.hasMany(models.IotDevice, {
        foreignKey: 'warehouse_id',
      });
      models.Warehouse.hasMany(models.LeaseContract, {
        foreignKey: 'warehouse_id',
      });
      models.Warehouse.hasMany(models.WarehouseImage, {
        foreignKey: 'warehouse_id',
      });
    }
  }
  Warehouse.init(
    {
      warehouse_id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER,
      },
      name_ko: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      name_en: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      land_area: DataTypes.DOUBLE,
      total_ground_area: DataTypes.DOUBLE,
      common_area: DataTypes.DOUBLE,
      dedicated_area: DataTypes.DOUBLE,
      completion_date: DataTypes.DATE,
      leasestart: DataTypes.STRING,
      leaseend: DataTypes.STRING,
      possible_area: DataTypes.DOUBLE,
      address1_ko: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      address1_en: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      address2_ko: DataTypes.STRING,
      address2_en: DataTypes.STRING,
      description_ko: DataTypes.TEXT,
      description_en: DataTypes.TEXT,
      note_ko: DataTypes.TEXT,
      note_en: DataTypes.TEXT,
      story: DataTypes.INTEGER,
      rent: DataTypes.INTEGER,
      category_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      restriction_ko: DataTypes.STRING,
      restriction_en: DataTypes.STRING,
      access_ko: DataTypes.STRING,
      access_en: DataTypes.STRING,
      height: DataTypes.DOUBLE,
      docking_station: DataTypes.BOOLEAN,
      rack: DataTypes.BOOLEAN,
      is_bonded: DataTypes.BOOLEAN,
      commercial_lift: DataTypes.BOOLEAN,
      is_verified: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
      data_type: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      tel: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      sensor_id: DataTypes.STRING,
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: fn('now'),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: fn('now'),
      },
      request_email: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Warehouse',
    }
  );
  return Warehouse;
};
