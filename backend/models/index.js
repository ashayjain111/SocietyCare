const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

let sequelize;

// Support DATABASE_URL (Supabase / Railway / Render connection strings)
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  });
} else if (dbConfig.dialect === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbConfig.storage,
    logging: dbConfig.logging || false,
  });
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      pool: dbConfig.pool || { max: 5, min: 0, acquire: 30000, idle: 10000 },
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
      },
    }
  );
}

const db = {};

// Import models
db.User = require('./User')(sequelize);
db.FamilyMember = require('./FamilyMember')(sequelize);
db.ServiceRequest = require('./ServiceRequest')(sequelize);
db.ServicePersonnel = require('./ServicePersonnel')(sequelize);
db.Assignment = require('./Assignment')(sequelize);
db.Payment = require('./Payment')(sequelize);
db.Announcement = require('./Announcement')(sequelize);
db.Notification = require('./Notification')(sequelize);
db.Feedback = require('./Feedback')(sequelize);
db.Visitor = require('./Visitor')(sequelize);
db.MaintenanceFee = require('./MaintenanceFee')(sequelize);

// Associations
// User -> FamilyMembers
db.User.hasMany(db.FamilyMember, { foreignKey: 'userId', as: 'familyMembers' });
db.FamilyMember.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User -> ServiceRequests
db.User.hasMany(db.ServiceRequest, { foreignKey: 'userId', as: 'serviceRequests' });
db.ServiceRequest.belongsTo(db.User, { foreignKey: 'userId', as: 'resident' });

// ServiceRequest -> Assignments
db.ServiceRequest.hasMany(db.Assignment, { foreignKey: 'requestId', as: 'assignments' });
db.Assignment.belongsTo(db.ServiceRequest, { foreignKey: 'requestId', as: 'serviceRequest' });

// ServicePersonnel -> Assignments
db.ServicePersonnel.hasMany(db.Assignment, { foreignKey: 'personnelId', as: 'assignments' });
db.Assignment.belongsTo(db.ServicePersonnel, { foreignKey: 'personnelId', as: 'personnel' });

// User -> Payments
db.User.hasMany(db.Payment, { foreignKey: 'userId', as: 'payments' });
db.Payment.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User -> Feedback
db.User.hasMany(db.Feedback, { foreignKey: 'userId', as: 'feedbacks' });
db.Feedback.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// ServiceRequest -> Feedback
db.ServiceRequest.hasOne(db.Feedback, { foreignKey: 'requestId', as: 'feedback' });
db.Feedback.belongsTo(db.ServiceRequest, { foreignKey: 'requestId', as: 'serviceRequest' });

// User -> Notifications
db.User.hasMany(db.Notification, { foreignKey: 'userId', as: 'notifications' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// User -> Visitors
db.User.hasMany(db.Visitor, { foreignKey: 'userId', as: 'visitors' });
db.Visitor.belongsTo(db.User, { foreignKey: 'userId', as: 'resident' });

// User -> Announcements (admin)
db.User.hasMany(db.Announcement, { foreignKey: 'createdBy', as: 'announcements' });
db.Announcement.belongsTo(db.User, { foreignKey: 'createdBy', as: 'author' });

// Assignment -> User (assigned by admin)
db.Assignment.belongsTo(db.User, { foreignKey: 'assignedBy', as: 'admin' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
