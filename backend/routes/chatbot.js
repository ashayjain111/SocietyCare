const express = require('express');
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /chatbot:
 *   post:
 *     tags: [Chatbot]
 *     summary: Chat with AI assistant
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', authenticate, chatbotController.chat);

module.exports = router;
