const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../models');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

let razorpay = null;
function getRazorpay() {
  if (!razorpay && process.env.RAZORPAY_KEY_ID) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// Create payment order
exports.createOrder = async (req, res, next) => {
  try {
    const { month } = req.body;
    const user = await db.User.findByPk(req.user.id);

    // Get applicable maintenance fee
    const fee = await db.MaintenanceFee.findOne({
      where: { isActive: true },
      order: [['effectiveFrom', 'DESC']],
    });

    if (!fee) {
      return res.status(400).json({ error: 'Maintenance fee not configured.' });
    }

    // Check if already paid
    const existingPayment = await db.Payment.findOne({
      where: { userId: req.user.id, month, status: 'completed' },
    });
    if (existingPayment) {
      return res.status(400).json({ error: 'Payment already completed for this month.' });
    }

    // Calculate late fee
    const dueDate = new Date(`${month}-${String(fee.dueDay).padStart(2, '0')}`);
    let lateFee = 0;
    if (new Date() > dueDate) {
      const daysLate = Math.ceil((new Date() - dueDate) / (1000 * 60 * 60 * 24));
      lateFee = daysLate * parseFloat(fee.lateFeePerDay);
    }

    const totalAmount = parseFloat(fee.amount) + lateFee;

    // Create Razorpay order
    let razorpayOrderId = null;
    const rp = getRazorpay();
    if (rp) {
      const order = await rp.orders.create({
        amount: Math.round(totalAmount * 100), // paise
        currency: 'INR',
        receipt: `payment_${req.user.id}_${month}`,
        notes: { userId: req.user.id, month },
      });
      razorpayOrderId = order.id;
    }

    // Create payment record
    const payment = await db.Payment.create({
      userId: req.user.id,
      amount: fee.amount,
      lateFee,
      totalAmount,
      month,
      dueDate,
      razorpayOrderId,
    });

    res.status(201).json({
      payment,
      razorpayOrderId,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

// Verify Razorpay payment
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    const payment = await db.Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    // Verify signature
    if (process.env.RAZORPAY_KEY_SECRET) {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        payment.status = 'failed';
        await payment.save();
        return res.status(400).json({ error: 'Payment verification failed.' });
      }
    }

    payment.status = 'completed';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paymentMethod = 'razorpay';
    payment.paidAt = new Date();
    await payment.save();

    // Send receipt email
    const user = await db.User.findByPk(payment.userId);
    await emailService.sendPaymentReceipt(user.email, user.name, payment);

    // Notify
    await notificationService.notify(
      payment.userId,
      'Payment Successful',
      `Your maintenance payment of ₹${payment.totalAmount} for ${payment.month} is confirmed.`,
      'payment',
      payment.id,
      'Payment'
    );

    res.json({ message: 'Payment verified.', payment });
  } catch (error) {
    next(error);
  }
};

// Get payment history
exports.getMyPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const { rows, count } = await db.Payment.findAndCountAll({
      where: { userId: req.user.id },
      order: [['month', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ payments: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

// Admin: get all payments
exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, month, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (month) where.month = month;

    const offset = (page - 1) * limit;
    const { rows, count } = await db.Payment.findAndCountAll({
      where,
      include: [{ model: db.User, as: 'user', attributes: ['id', 'name', 'houseNumber', 'tower', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ payments: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

// Record cash/cheque payment (admin)
exports.recordOfflinePayment = async (req, res, next) => {
  try {
    const { userId, month, paymentMethod, amount } = req.body;

    const payment = await db.Payment.create({
      userId,
      amount,
      lateFee: 0,
      totalAmount: amount,
      month,
      status: 'completed',
      paymentMethod,
      paidAt: new Date(),
      dueDate: new Date(),
    });

    await notificationService.notify(
      userId,
      'Payment Recorded',
      `Your ${paymentMethod} payment of ₹${amount} for ${month} has been recorded.`,
      'payment',
      payment.id,
      'Payment'
    );

    res.status(201).json({ message: 'Payment recorded.', payment });
  } catch (error) {
    next(error);
  }
};
