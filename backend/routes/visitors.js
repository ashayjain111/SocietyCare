const express = require('express');
const visitorController = require('../controllers/visitorController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /visitors:
 *   post:
 *     tags: [Visitors]
 *     summary: Register a visitor
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', authenticate, authorize('resident'), visitorController.registerVisitor);
router.get('/my', authenticate, authorize('resident'), visitorController.getMyVisitors);
router.put('/:id/check-in', authenticate, authorize('admin', 'staff'), visitorController.checkInVisitor);
router.put('/:id/check-out', authenticate, authorize('admin', 'staff'), visitorController.checkOutVisitor);
router.get('/', authenticate, authorize('admin'), visitorController.getAllVisitors);

module.exports = router;
