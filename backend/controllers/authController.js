const { validationResult } = require('express-validator');
const db = require('../models');
const { generateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, password, houseNumber, tower, role } = req.body;

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await db.User.create({
      name,
      email,
      phone,
      password,
      houseNumber,
      tower,
      role: role || 'resident',
    });

    // Generate and send OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    await emailService.sendOTP(email, otp);

    const token = generateToken(user);
    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent.',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({ message: 'Login successful.', token, user });
  } catch (error) {
    next(error);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.otp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await emailService.sendOTP(email, otp);

    res.json({ message: 'OTP resent successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      include: [{ model: db.FamilyMember, as: 'familyMembers' }],
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, houseNumber, tower, emergencyContact, language } = req.body;
    const user = await db.User.findByPk(req.user.id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (houseNumber) user.houseNumber = houseNumber;
    if (tower) user.tower = tower;
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (language) user.language = language;

    await user.save();
    res.json({ message: 'Profile updated.', user });
  } catch (error) {
    next(error);
  }
};

exports.updateFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await db.User.update({ fcmToken }, { where: { id: req.user.id } });
    res.json({ message: 'FCM token updated.' });
  } catch (error) {
    next(error);
  }
};

// Family member management
exports.addFamilyMember = async (req, res, next) => {
  try {
    const { name, relation, age, phone } = req.body;
    const member = await db.FamilyMember.create({
      userId: req.user.id,
      name,
      relation,
      age,
      phone,
    });
    res.status(201).json({ message: 'Family member added.', member });
  } catch (error) {
    next(error);
  }
};

exports.removeFamilyMember = async (req, res, next) => {
  try {
    const member = await db.FamilyMember.findOne({
      where: { id: req.params.memberId, userId: req.user.id },
    });
    if (!member) {
      return res.status(404).json({ error: 'Family member not found.' });
    }
    await member.destroy();
    res.json({ message: 'Family member removed.' });
  } catch (error) {
    next(error);
  }
};
