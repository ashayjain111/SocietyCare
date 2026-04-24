const { Op } = require('sequelize');
const db = require('../models');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');

exports.createRequest = async (req, res, next) => {
  try {
    const { title, description, category, priority, originalLanguage } = req.body;

    // AI processing: translate and summarize
    let processedDescription = description;
    let aiSummary = '';
    let detectedCategory = category;
    let detectedPriority = priority || 'medium';
    let detectedTitle = title;

    if (description) {
      // Translate if not English
      if (originalLanguage && originalLanguage !== 'en') {
        const translation = await aiService.translateToEnglish(description, originalLanguage);
        processedDescription = translation.translatedText;
      }

      // AI summarization and categorization
      const analysis = await aiService.summarizeAndCategorize(processedDescription);
      aiSummary = analysis.summary;
      if (!category) detectedCategory = analysis.category;
      if (!priority) detectedPriority = analysis.priority;
      if (!title) detectedTitle = analysis.title;
    }

    // Handle file uploads
    const images = req.files?.images?.map((f) => `/uploads/${f.filename}`) || [];
    const videos = req.files?.videos?.map((f) => `/uploads/${f.filename}`) || [];
    const voiceNote = req.files?.voiceNote?.[0] ? `/uploads/${req.files.voiceNote[0].filename}` : null;

    // If voice note, transcribe it
    if (voiceNote && req.files?.voiceNote?.[0]) {
      const fs = require('fs');
      const audioBuffer = fs.readFileSync(req.files.voiceNote[0].path);
      const transcription = await aiService.speechToText(audioBuffer, originalLanguage || 'hi');
      if (transcription.text) {
        processedDescription = processedDescription
          ? `${processedDescription}\n\n[Voice Note]: ${transcription.text}`
          : transcription.text;
      }
    }

    const request = await db.ServiceRequest.create({
      userId: req.user.id,
      title: detectedTitle || 'Service Request',
      description: processedDescription,
      category: detectedCategory || 'other',
      priority: detectedPriority,
      originalLanguage: originalLanguage || 'en',
      originalText: description !== processedDescription ? description : null,
      aiSummary,
      images,
      videos,
      voiceNote,
    });

    // Notify admins
    const admins = await db.User.findAll({ where: { role: 'admin', isActive: true } });
    for (const admin of admins) {
      await notificationService.notify(
        admin.id,
        'New Service Request',
        `${req.user.name} submitted a ${detectedCategory} request: ${detectedTitle}`,
        'service_request',
        request.id,
        'ServiceRequest'
      );
    }

    res.status(201).json({ message: 'Service request created.', request });
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await db.ServiceRequest.findAndCountAll({
      where,
      include: [
        { model: db.Assignment, as: 'assignments', include: [{ model: db.ServicePersonnel, as: 'personnel' }] },
        { model: db.Feedback, as: 'feedback' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ requests: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getAllRequests = async (req, res, next) => {
  try {
    const { status, category, priority, page = 1, limit = 20, search } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;
    const { rows, count } = await db.ServiceRequest.findAndCountAll({
      where,
      include: [
        { model: db.User, as: 'resident', attributes: ['id', 'name', 'houseNumber', 'tower', 'phone'] },
        { model: db.Assignment, as: 'assignments', include: [{ model: db.ServicePersonnel, as: 'personnel' }] },
        { model: db.Feedback, as: 'feedback' },
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    res.json({ requests: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const request = await db.ServiceRequest.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'resident', attributes: ['id', 'name', 'houseNumber', 'tower', 'phone', 'email'] },
        { model: db.Assignment, as: 'assignments', include: [{ model: db.ServicePersonnel, as: 'personnel' }] },
        { model: db.Feedback, as: 'feedback' },
      ],
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    // Residents can only view their own requests
    if (req.user.role === 'resident' && request.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ request });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await db.ServiceRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    request.status = status;
    if (status === 'completed') {
      request.resolvedAt = new Date();
    }
    await request.save();

    // Notify resident
    await notificationService.notify(
      request.userId,
      'Request Status Updated',
      `Your service request "${request.title}" is now ${status}.`,
      'service_request',
      request.id,
      'ServiceRequest'
    );

    res.json({ message: 'Status updated.', request });
  } catch (error) {
    next(error);
  }
};

exports.confirmService = async (req, res, next) => {
  try {
    const { helpReceived, issueResolved, reopenReason } = req.body;
    const request = await db.ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    request.helpReceived = helpReceived;
    request.issueResolved = issueResolved;

    if (issueResolved === false && reopenReason) {
      request.status = 'reopened';
      request.reopenReason = reopenReason;
    }

    await request.save();
    res.json({ message: 'Service confirmation recorded.', request });
  } catch (error) {
    next(error);
  }
};

exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment, personnelBehavior, serviceQuality, timeliness } = req.body;
    const request = await db.ServiceRequest.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    const feedback = await db.Feedback.create({
      userId: req.user.id,
      requestId: request.id,
      rating,
      comment,
      personnelBehavior,
      serviceQuality,
      timeliness,
    });

    // Update personnel rating
    const assignments = await db.Assignment.findAll({ where: { requestId: request.id } });
    for (const assignment of assignments) {
      const personnel = await db.ServicePersonnel.findByPk(assignment.personnelId);
      if (personnel) {
        const totalRating = personnel.rating * personnel.totalJobs + rating;
        personnel.totalJobs += 1;
        personnel.rating = totalRating / personnel.totalJobs;
        await personnel.save();
      }
    }

    res.status(201).json({ message: 'Feedback submitted.', feedback });
  } catch (error) {
    next(error);
  }
};

// Emergency SOS
exports.emergencySOS = async (req, res, next) => {
  try {
    const { message } = req.body;

    const request = await db.ServiceRequest.create({
      userId: req.user.id,
      title: 'EMERGENCY SOS',
      description: message || 'Emergency assistance needed!',
      category: 'security',
      priority: 'urgent',
      status: 'pending',
    });

    // Notify all admins immediately
    const admins = await db.User.findAll({ where: { role: 'admin', isActive: true } });
    for (const admin of admins) {
      await notificationService.notify(
        admin.id,
        '🚨 EMERGENCY SOS',
        `${req.user.name} (${req.user.houseNumber}, ${req.user.tower}) needs emergency assistance!`,
        'emergency',
        request.id,
        'ServiceRequest'
      );
    }

    res.status(201).json({ message: 'Emergency SOS sent. Help is on the way.', request });
  } catch (error) {
    next(error);
  }
};
