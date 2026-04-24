const { Op } = require('sequelize');
const db = require('../models');
const notificationService = require('../services/notificationService');

// Assign service personnel to a request
exports.assignPersonnel = async (req, res, next) => {
  try {
    const { requestId, personnelId, notes } = req.body;

    const request = await db.ServiceRequest.findByPk(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Service request not found.' });
    }

    const personnel = await db.ServicePersonnel.findByPk(personnelId);
    if (!personnel) {
      return res.status(404).json({ error: 'Service personnel not found.' });
    }

    const assignment = await db.Assignment.create({
      requestId,
      personnelId,
      assignedBy: req.user.id,
      notes,
    });

    request.status = 'assigned';
    await request.save();

    // Notify resident
    await notificationService.notify(
      request.userId,
      'Service Personnel Assigned',
      `${personnel.name} (${personnel.specialization}) has been assigned to your request: "${request.title}"`,
      'assignment',
      request.id,
      'ServiceRequest'
    );

    // Notify staff if they have a user account
    if (personnel.userId) {
      await notificationService.notify(
        personnel.userId,
        'New Task Assigned',
        `You have been assigned to: "${request.title}"`,
        'assignment',
        request.id,
        'ServiceRequest'
      );
    }

    res.status(201).json({ message: 'Personnel assigned.', assignment });
  } catch (error) {
    next(error);
  }
};

// Manage service personnel
exports.addPersonnel = async (req, res, next) => {
  try {
    const { name, phone, email, specialization } = req.body;

    // Optionally create a user account for the staff member
    let userId = null;
    if (email) {
      const existingUser = await db.User.findOne({ where: { email } });
      if (!existingUser) {
        const user = await db.User.create({
          name,
          email,
          phone: phone || null,
          password: 'Staff@123',
          role: 'staff',
          isEmailVerified: true,
        });
        userId = user.id;
      } else {
        userId = existingUser.id;
      }
    }

    const personnel = await db.ServicePersonnel.create({
      name,
      phone,
      email,
      specialization,
      userId,
    });

    res.status(201).json({ message: 'Service personnel added.', personnel });
  } catch (error) {
    next(error);
  }
};

exports.getPersonnel = async (req, res, next) => {
  try {
    const { specialization, available } = req.query;
    const where = {};
    if (specialization) where.specialization = specialization;
    if (available !== undefined) where.isAvailable = available === 'true';

    const personnel = await db.ServicePersonnel.findAll({ where, order: [['rating', 'DESC']] });
    res.json({ personnel });
  } catch (error) {
    next(error);
  }
};

exports.updatePersonnel = async (req, res, next) => {
  try {
    const personnel = await db.ServicePersonnel.findByPk(req.params.id);
    if (!personnel) {
      return res.status(404).json({ error: 'Personnel not found.' });
    }

    const { name, phone, email, specialization, isAvailable } = req.body;
    if (name) personnel.name = name;
    if (phone) personnel.phone = phone;
    if (email) personnel.email = email;
    if (specialization) personnel.specialization = specialization;
    if (isAvailable !== undefined) personnel.isAvailable = isAvailable;

    await personnel.save();
    res.json({ message: 'Personnel updated.', personnel });
  } catch (error) {
    next(error);
  }
};

// Manage residents
exports.getResidents = async (req, res, next) => {
  try {
    const { search, tower, page = 1, limit = 20 } = req.query;
    const where = { role: 'resident' };
    if (tower) where.tower = tower;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { houseNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await db.User.findAndCountAll({
      where,
      include: [{ model: db.FamilyMember, as: 'familyMembers' }],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ residents: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

// Announcements
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, expiresAt } = req.body;

    const announcement = await db.Announcement.create({
      title,
      content,
      category: category || 'general',
      createdBy: req.user.id,
      expiresAt,
    });

    // Notify all residents
    await notificationService.notifyAllResidents(
      `📢 ${title}`,
      content.substring(0, 200),
      'announcement'
    );

    res.status(201).json({ message: 'Announcement created.', announcement });
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await db.Announcement.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } },
        ],
      },
      include: [{ model: db.User, as: 'author', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ announcements });
  } catch (error) {
    next(error);
  }
};

// Analytics / Dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalResidents = await db.User.count({ where: { role: 'resident', isActive: true } });
    const totalRequests = await db.ServiceRequest.count();
    const pendingRequests = await db.ServiceRequest.count({ where: { status: 'pending' } });
    const inProgressRequests = await db.ServiceRequest.count({ where: { status: { [Op.in]: ['assigned', 'in_progress'] } } });
    const completedRequests = await db.ServiceRequest.count({ where: { status: 'completed' } });
    const totalPersonnel = await db.ServicePersonnel.count();

    const totalPayments = await db.Payment.sum('totalAmount', { where: { status: 'completed' } });
    const pendingPayments = await db.Payment.count({ where: { status: 'pending' } });

    // Category breakdown
    const categoryStats = await db.ServiceRequest.findAll({
      attributes: ['category', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
      group: ['category'],
    });

    // Monthly request trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const dialect = db.sequelize.getDialect();
    const monthExpr = dialect === 'postgres'
      ? db.sequelize.fn('TO_CHAR', db.sequelize.col('ServiceRequest.createdAt'), 'YYYY-MM')
      : db.sequelize.fn('strftime', '%Y-%m', db.sequelize.col('ServiceRequest.createdAt'));
    const monthlyTrend = await db.ServiceRequest.findAll({
      attributes: [
        [monthExpr, 'month'],
        [db.sequelize.fn('COUNT', db.sequelize.col('ServiceRequest.id')), 'count'],
      ],
      where: { createdAt: { [Op.gte]: sixMonthsAgo } },
      group: [monthExpr],
      order: [[monthExpr, 'ASC']],
      raw: true,
    });

    res.json({
      stats: {
        totalResidents,
        totalRequests,
        pendingRequests,
        inProgressRequests,
        completedRequests,
        totalPersonnel,
        totalPayments: totalPayments || 0,
        pendingPayments,
      },
      categoryStats,
      monthlyTrend,
    });
  } catch (error) {
    next(error);
  }
};

// Maintenance fee management
exports.setMaintenanceFee = async (req, res, next) => {
  try {
    const { tower, flatType, amount, lateFeePerDay, dueDay, effectiveFrom } = req.body;

    // Deactivate old fee structure
    await db.MaintenanceFee.update(
      { isActive: false },
      { where: { tower: tower || null, flatType: flatType || null, isActive: true } }
    );

    const fee = await db.MaintenanceFee.create({
      tower,
      flatType,
      amount,
      lateFeePerDay: lateFeePerDay || 50,
      dueDay: dueDay || 10,
      effectiveFrom: effectiveFrom || new Date(),
    });

    res.status(201).json({ message: 'Maintenance fee set.', fee });
  } catch (error) {
    next(error);
  }
};

exports.getMaintenanceFees = async (req, res, next) => {
  try {
    const fees = await db.MaintenanceFee.findAll({ where: { isActive: true } });
    res.json({ fees });
  } catch (error) {
    next(error);
  }
};
