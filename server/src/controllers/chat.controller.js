const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const User = require('../models/User.model');
const ChatLinkService = require('../services/chatLink.service');

// @desc    Get all chats for current user
// @route   GET /api/chats
// @access  Private
exports.getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            participants: req.user._id,
            isActive: true
        })
            .populate('participants', 'username profilePicture isOnline lastSeen')
            .sort({ updatedAt: -1 });

        // Format chats with other participant info
        const formattedChats = chats.map(chat => {
            const otherParticipant = chat.participants.find(
                p => p._id.toString() !== req.user._id.toString()
            );

            return {
                _id: chat._id,
                participant: {
                    _id: otherParticipant._id,
                    username: otherParticipant.username,
                    profilePicture: otherParticipant.profilePicture,
                    isOnline: otherParticipant.isOnline,
                    lastSeen: otherParticipant.lastSeen
                },
                lastMessage: chat.lastMessage,
                unreadCount: chat.unreadCount.get(req.user._id.toString()) || 0,
                updatedAt: chat.updatedAt
            };
        });

        res.json({
            success: true,
            data: {
                chats: formattedChats
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get or create chat with a user
// @route   POST /api/chats
// @access  Private
exports.createChat = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Verify the other user exists
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent chat with self
        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create chat with yourself'
            });
        }

        // Get or create chat
        const chat = await Chat.getOrCreateChat(req.user._id, userId);

        const otherParticipant = chat.participants.find(
            p => p._id.toString() !== req.user._id.toString()
        );

        res.status(201).json({
            success: true,
            data: {
                chat: {
                    _id: chat._id,
                    participant: {
                        _id: otherParticipant._id,
                        username: otherParticipant.username,
                        profilePicture: otherParticipant.profilePicture,
                        isOnline: otherParticipant.isOnline,
                        lastSeen: otherParticipant.lastSeen
                    },
                    lastMessage: chat.lastMessage,
                    createdAt: chat.createdAt
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Join chat via link
// @route   POST /api/chats/join/:code
// @access  Private
exports.joinChatByLink = async (req, res, next) => {
    try {
        const { code } = req.params;

        // Validate chat link
        const linkResult = await ChatLinkService.validateChatLink(code);

        if (!linkResult.valid) {
            return res.status(400).json({
                success: false,
                message: linkResult.message
            });
        }

        // Prevent joining own link
        if (linkResult.userId.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot join your own chat link'
            });
        }

        // Get or create chat
        const chat = await Chat.getOrCreateChat(req.user._id, linkResult.userId);

        const otherParticipant = chat.participants.find(
            p => p._id.toString() !== req.user._id.toString()
        );

        res.json({
            success: true,
            message: 'Successfully joined chat',
            data: {
                chat: {
                    _id: chat._id,
                    participant: {
                        _id: otherParticipant._id,
                        username: otherParticipant.username,
                        profilePicture: otherParticipant.profilePicture,
                        isOnline: otherParticipant.isOnline,
                        lastSeen: otherParticipant.lastSeen
                    }
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single chat
// @route   GET /api/chats/:chatId
// @access  Private
exports.getChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        }).populate('participants', 'username profilePicture isOnline lastSeen');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        const otherParticipant = chat.participants.find(
            p => p._id.toString() !== req.user._id.toString()
        );

        res.json({
            success: true,
            data: {
                chat: {
                    _id: chat._id,
                    participant: {
                        _id: otherParticipant._id,
                        username: otherParticipant.username,
                        profilePicture: otherParticipant.profilePicture,
                        isOnline: otherParticipant.isOnline,
                        lastSeen: otherParticipant.lastSeen
                    },
                    lastMessage: chat.lastMessage
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete/Leave chat
// @route   DELETE /api/chats/:chatId
// @access  Private
exports.deleteChat = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Mark chat as inactive instead of deleting
        chat.isActive = false;
        await chat.save();

        res.json({
            success: true,
            message: 'Chat deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Clear unread count for a chat
// @route   PUT /api/chats/:chatId/read
// @access  Private
exports.markChatAsRead = async (req, res, next) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Reset unread count for current user
        chat.unreadCount.set(req.user._id.toString(), 0);
        await chat.save();

        res.json({
            success: true,
            message: 'Chat marked as read'
        });
    } catch (error) {
        next(error);
    }
};
