const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Visitor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    visitorName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    visitorPhone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    purpose: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    vehicleNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checkInTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    checkOutTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(15),
      defaultValue: 'expected',
    },
    expectedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'visitors',
    timestamps: true,
  });
};
