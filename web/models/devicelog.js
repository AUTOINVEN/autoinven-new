'use strict';
const { Model, fn } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DeviceLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  }
  DeviceLog.init(
    {
      uid: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.STRING,
      },
      serial: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      data03: {
        type: DataTypes.STRING,
      },
      data04: {
        type: DataTypes.STRING,
      },
      data05: {
        type: DataTypes.STRING,
      },
      data06: {
        type: DataTypes.STRING,
      },
      data07: {
        type: DataTypes.STRING,
      },
      data08: {
        type: DataTypes.STRING,
      },
      data09: {
        type: DataTypes.STRING,
      },
      data10: {
        type: DataTypes.STRING,
      },
      regdate: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: fn('now'),
      }
    },
    {
      sequelize,
      modelName: 'DeviceLog',
    }
  );
  return DeviceLog;
};
