const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ServiceRequest', {
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
    category: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: { isIn: [['electrical', 'plumbing', 'carpentry', 'cleaning', 'painting', 'pest_control', 'security', 'other']] },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    originalLanguage: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    originalText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aiSummary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.STRING(10),
      defaultValue: 'medium',
      validate: { isIn: [['low', 'medium', 'high', 'urgent']] },
    },
    status: {
      type: DataTypes.STRING(15),
      defaultValue: 'pending',
      validate: { isIn: [['pending', 'assigned', 'in_progress', 'completed', 'reopened', 'cancelled']] },
    },
    images: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('images');
        try { return val ? JSON.parse(val) : []; } catch { return []; }
      },
      set(val) {
        this.setDataValue('images', JSON.stringify(val || []));
      },
    },
    videos: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('videos');
        try { return val ? JSON.parse(val) : []; } catch { return []; }
      },
      set(val) {
        this.setDataValue('videos', JSON.stringify(val || []));
      },
    },
    voiceNote: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    helpReceived: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    issueResolved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reopenReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'service_requests',
    timestamps: true,
  });
};
