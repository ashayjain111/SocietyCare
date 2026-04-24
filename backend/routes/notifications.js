const express = require('express');
const { authenticate } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.put('/read-all', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'All marked as read.' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
