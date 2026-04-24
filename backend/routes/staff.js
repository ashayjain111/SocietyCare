const express = require('express');
const staffController = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /staff/tasks:
 *   get:
 *     tags: [Staff]
 *     summary: Get assigned tasks
 *     security: [{ bearerAuth: [] }]
 */
router.get('/tasks', authenticate, authorize('staff'), staffController.getMyTasks);

/**
 * @swagger
 * /staff/tasks/{id}/status:
 *   put:
 *     tags: [Staff]
 *     summary: Update task status
 */
router.put('/tasks/:id/status', authenticate, authorize('staff'), staffController.updateTaskStatus);
router.post('/tasks/:id/proof', authenticate, authorize('staff'), upload.single('proof'), staffController.uploadProof);

module.exports = router;
