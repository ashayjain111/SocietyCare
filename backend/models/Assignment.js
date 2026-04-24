const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Assignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    requestId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'service_requests', key: 'id' },
    },
    personnelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'service_personnel', key: 'id' },
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    status: {
      type: DataTypes.STRING(15),
      defaultValue: 'assigned',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    proofImage: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    digitalSignature: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'assignments',
    timestamps: true,
  });
};
