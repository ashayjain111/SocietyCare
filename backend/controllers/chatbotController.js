const aiService = require('../services/aiService');

exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const context = `Resident: ${req.user.name}, House: ${req.user.houseNumber}, Tower: ${req.user.tower}`;
    const result = await aiService.chatbotResponse(message, context);

    res.json({ response: result.response });
  } catch (error) {
    next(error);
  }
};
