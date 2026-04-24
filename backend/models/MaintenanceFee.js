const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('MaintenanceFee', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tower: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    flatType: {
      type: DataTypes.STRING(20), // 1BHK, 2BHK, 3BHK, etc.
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    lateFeePerDay: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 50.00,
    },
    dueDay: {
      type: DataTypes.INTEGER, // Day of month (1-28)
      defaultValue: 10,
    },
    effectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'maintenance_fees',
    timestamps: true,
  });
};
