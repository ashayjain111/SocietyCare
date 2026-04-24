const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     tags: [Payments]
 *     summary: Create a payment order
 *     security: [{ bearerAuth: [] }]
 */
router.post('/create-order', authenticate, authorize('resident'), paymentController.createOrder);
router.post('/verify', authenticate, paymentController.verifyPayment);
router.get('/my', authenticate, authorize('resident'), paymentController.getMyPayments);
router.get('/', authenticate, authorize('admin'), paymentController.getAllPayments);
router.post('/offline', authenticate, authorize('admin'), paymentController.recordOfflinePayment);

module.exports = router;
