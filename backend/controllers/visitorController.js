const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

// Register a visitor (resident pre-approves)
exports.registerVisitor = async (req, res, next) => {
  try {
    const { visitorName, visitorPhone, purpose, vehicleNumber, expectedDate } = req.body;

    const visitorId = uuidv4();
    const qrData = JSON.stringify({
      id: visitorId,
      visitorName,
      residentId: req.user.id,
      houseNumber: req.user.houseNumber,
      tower: req.user.tower,
      expectedDate,
    });

    const qrCode = await QRCode.toDataURL(qrData);

    const visitor = await db.Visitor.create({
      userId: req.user.id,
      visitorName,
      visitorPhone,
      purpose,
      vehicleNumber,
      qrCode,
      expectedDate,
    });

    res.status(201).json({ message: 'Visitor registered.', visitor });
  } catch (error) {
    next(error);
  }
};

// Get my visitors
exports.getMyVisitors = async (req, res, next) => {
  try {
    const visitors = await db.Visitor.findAll({
      where: { userId: req.user.id },
      order: [['expectedDate', 'DESC']],
    });
    res.json({ visitors });
  } catch (error) {
    next(error);
  }
};

// Check-in visitor (security/admin)
exports.checkInVisitor = async (req, res, next) => {
  try {
    const visitor = await db.Visitor.findByPk(req.params.id);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    visitor.status = 'checked_in';
    visitor.checkInTime = new Date();
    await visitor.save();

    res.json({ message: 'Visitor checked in.', visitor });
  } catch (error) {
    next(error);
  }
};

// Check-out visitor
exports.checkOutVisitor = async (req, res, next) => {
  try {
    const visitor = await db.Visitor.findByPk(req.params.id);
    if (!visitor) {
      return res.status(404).json({ error: 'Visitor not found.' });
    }

    visitor.status = 'checked_out';
    visitor.checkOutTime = new Date();
    await visitor.save();

    res.json({ message: 'Visitor checked out.', visitor });
  } catch (error) {
    next(error);
  }
};

// Get all visitors (admin)
exports.getAllVisitors = async (req, res, next) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) where.expectedDate = date;

    const offset = (page - 1) * limit;
    const { rows, count } = await db.Visitor.findAndCountAll({
      where,
      include: [{ model: db.User, as: 'resident', attributes: ['id', 'name', 'houseNumber', 'tower'] }],
      order: [['expectedDate', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ visitors: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};
