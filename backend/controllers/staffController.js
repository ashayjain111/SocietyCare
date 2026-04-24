const db = require('../models');
const notificationService = require('../services/notificationService');

// Get assigned tasks for the logged-in staff
exports.getMyTasks = async (req, res, next) => {
  try {
    const personnel = await db.ServicePersonnel.findOne({ where: { userId: req.user.id } });
    if (!personnel) {
      return res.status(404).json({ error: 'Staff profile not found.' });
    }

    const { status } = req.query;
    const where = { personnelId: personnel.id };
    if (status) where.status = status;

    const assignments = await db.Assignment.findAll({
      where,
      include: [
        {
          model: db.ServiceRequest,
          as: 'serviceRequest',
          include: [{ model: db.User, as: 'resident', attributes: ['id', 'name', 'houseNumber', 'tower', 'phone'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ assignments });
  } catch (error) {
    next(error);
  }
};

// Update task status
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const personnel = await db.ServicePersonnel.findOne({ where: { userId: req.user.id } });
    if (!personnel) {
      return res.status(404).json({ error: 'Staff profile not found.' });
    }

    const assignment = await db.Assignment.findOne({
      where: { id: req.params.id, personnelId: personnel.id },
      include: [{ model: db.ServiceRequest, as: 'serviceRequest' }],
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    assignment.status = status;
    if (notes) assignment.notes = notes;
    if (status === 'in_progress') assignment.startedAt = new Date();
    if (status === 'completed') assignment.completedAt = new Date();

    await assignment.save();

    // Update service request status
    const request = assignment.serviceRequest;
    if (status === 'in_progress') {
      request.status = 'in_progress';
    } else if (status === 'completed') {
      request.status = 'completed';
      request.resolvedAt = new Date();
    }
    await request.save();

    // Notify resident
    await notificationService.notify(
      request.userId,
      'Task Update',
      `Your request "${request.title}" is now ${status}.`,
      'service_request',
      request.id,
      'ServiceRequest'
    );

    res.json({ message: 'Task status updated.', assignment });
  } catch (error) {
    next(error);
  }
};

// Upload proof of service
exports.uploadProof = async (req, res, next) => {
  try {
    const personnel = await db.ServicePersonnel.findOne({ where: { userId: req.user.id } });
    if (!personnel) {
      return res.status(404).json({ error: 'Staff profile not found.' });
    }

    const assignment = await db.Assignment.findOne({
      where: { id: req.params.id, personnelId: personnel.id },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found.' });
    }

    if (req.file) {
      assignment.proofImage = `/uploads/${req.file.filename}`;
    }
    if (req.body.digitalSignature) {
      assignment.digitalSignature = req.body.digitalSignature;
    }

    await assignment.save();
    res.json({ message: 'Proof uploaded.', assignment });
  } catch (error) {
    next(error);
  }
};
