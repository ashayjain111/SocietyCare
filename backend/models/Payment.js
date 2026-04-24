const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Payment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    lateFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    month: {
      type: DataTypes.STRING(7), // YYYY-MM format
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(10),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    razorpayOrderId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    razorpaySignature: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    receiptUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'payments',
    timestamps: true,
  });
};
