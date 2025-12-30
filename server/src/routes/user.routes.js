const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { linkGenerationLimiter } = require('../middleware/rateLimiter.middleware');
const {
    validateProfileUpdate,
    validatePasswordUpdate,
    validateChatLink
} = require('../middleware/validation.middleware');
const { upload } = require('../services/upload.service');

// All routes are protected
router.use(protect);

// Profile routes
router.put('/profile', validateProfileUpdate, userController.updateProfile);
router.put('/password', validatePasswordUpdate, userController.updatePassword);
router.put('/profile-picture', upload.single('profilePicture'), userController.updateProfilePicture);

// Chat link routes
router.get('/chat-link', userController.getChatLink);
router.post('/chat-link', linkGenerationLimiter, userController.generateChatLink);
router.delete('/chat-link', userController.invalidateChatLink);
router.get('/validate-link/:code', validateChatLink, userController.validateChatLink);

module.exports = router;
