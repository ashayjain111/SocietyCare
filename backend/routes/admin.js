const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     security: [{ bearerAuth: [] }]
 */
router.get('/dashboard', authenticate, authorize('admin'), adminController.getDashboardStats);

// Personnel management
router.post('/personnel', authenticate, authorize('admin'), adminController.addPersonnel);
router.get('/personnel', authenticate, authorize('admin'), adminController.getPersonnel);
router.put('/personnel/:id', authenticate, authorize('admin'), adminController.updatePersonnel);

// Assignment
router.post('/assign', authenticate, authorize('admin'), adminController.assignPersonnel);

// Residents
router.get('/residents', authenticate, authorize('admin'), adminController.getResidents);

// Announcements
router.post('/announcements', authenticate, authorize('admin'), adminController.createAnnouncement);
router.get('/announcements', authenticate, adminController.getAnnouncements);

// Maintenance fees
router.post('/maintenance-fees', authenticate, authorize('admin'), adminController.setMaintenanceFee);
router.get('/maintenance-fees', authenticate, adminController.getMaintenanceFees);

module.exports = router;
