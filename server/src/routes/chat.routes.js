const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateChatLink } = require('../middleware/validation.middleware');

// All routes are protected
router.use(protect);

// Chat routes
router.get('/', chatController.getChats);
router.post('/', chatController.createChat);
router.get('/:chatId', chatController.getChat);
router.delete('/:chatId', chatController.deleteChat);
router.put('/:chatId/read', chatController.markChatAsRead);

// Join chat via link
router.post('/join/:code', validateChatLink, chatController.joinChatByLink);

module.exports = router;
