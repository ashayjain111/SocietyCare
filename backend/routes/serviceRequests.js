const express = require('express');
const serviceRequestController = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * /service-requests:
 *   post:
 *     tags: [Service Requests]
 *     summary: Create a new service request
 *     security: [{ bearerAuth: [] }]
 *   get:
 *     tags: [Service Requests]
 *     summary: Get all service requests (admin)
 *     security: [{ bearerAuth: [] }]
 */
router.post('/',
  authenticate,
  authorize('resident'),
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'videos', maxCount: 2 },
    { name: 'voiceNote', maxCount: 1 },
  ]),
  serviceRequestController.createRequest
);

router.get('/my', authenticate, authorize('resident'), serviceRequestController.getMyRequests);
router.get('/', authenticate, authorize('admin'), serviceRequestController.getAllRequests);
router.get('/:id', authenticate, serviceRequestController.getRequestById);

/**
 * @swagger
 * /service-requests/{id}/status:
 *   put:
 *     tags: [Service Requests]
 *     summary: Update request status (admin)
 */
router.put('/:id/status', authenticate, authorize('admin'), serviceRequestController.updateRequestStatus);
router.put('/:id/confirm', authenticate, authorize('resident'), serviceRequestController.confirmService);
router.post('/:id/feedback', authenticate, authorize('resident'), serviceRequestController.submitFeedback);

/**
 * @swagger
 * /service-requests/emergency/sos:
 *   post:
 *     tags: [Service Requests]
 *     summary: Emergency SOS
 */
router.post('/emergency/sos', authenticate, serviceRequestController.emergencySOS);

module.exports = router;
