const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');
const { messageLimiter } = require('../middleware/rateLimiter.middleware');
const { validateMessage, validatePagination } = require('../middleware/validation.middleware');

// All routes are protected
router.use(protect);

// Message routes
router.get('/:chatId', validatePagination, messageController.getMessages);
router.post('/:chatId', messageLimiter, validateMessage, messageController.sendMessage);
router.put('/:chatId/read', messageController.markMessagesAsRead);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;
