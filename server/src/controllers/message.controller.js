const Message = require('../models/Message.model');
const Chat = require('../models/Chat.model');

// @desc    Get messages for a chat
// @route   GET /api/messages/:chatId
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        // Verify user is part of the chat
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

        // Get messages
        const messages = await Message.getMessagesForChat(chatId, page, limit);
        const totalMessages = await Message.getMessageCount(chatId);
        const totalPages = Math.ceil(totalMessages / limit);

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMessages,
                    hasMore: page < totalPages
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message
// @route   POST /api/messages/:chatId
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        // Verify user is part of the chat
        const chat = await Chat.findOne({
            _id: chatId,
            participants: req.user._id,
            isActive: true
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        // Create message
        const message = await Message.create({
            chat: chatId,
            sender: req.user._id,
            content,
            readBy: [{ user: req.user._id, readAt: new Date() }]
        });

        // Populate sender info
        await message.populate('sender', 'username profilePicture');

        // Update chat's last message
        const otherParticipant = chat.participants.find(
            p => p.toString() !== req.user._id.toString()
        );

        chat.lastMessage = {
            content: content.substring(0, 100),
            sender: req.user._id,
            timestamp: new Date()
        };

        // Increment unread count for other participant
        const currentUnread = chat.unreadCount.get(otherParticipant.toString()) || 0;
        chat.unreadCount.set(otherParticipant.toString(), currentUnread + 1);

        await chat.save();

        res.status(201).json({
            success: true,
            data: {
                message: {
                    _id: message._id,
                    chat: message.chat,
                    sender: message.sender,
                    content: message.content,
                    createdAt: message.createdAt,
                    readBy: message.readBy
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:chatId/read
// @access  Private
exports.markMessagesAsRead = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const { messageIds } = req.body;

        // Verify user is part of the chat
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

        // Mark messages as read
        if (messageIds && messageIds.length > 0) {
            await Message.updateMany(
                {
                    _id: { $in: messageIds },
                    chat: chatId,
                    'readBy.user': { $ne: req.user._id }
                },
                {
                    $push: {
                        readBy: { user: req.user._id, readAt: new Date() }
                    }
                }
            );
        } else {
            // Mark all unread messages as read
            await Message.updateMany(
                {
                    chat: chatId,
                    sender: { $ne: req.user._id },
                    'readBy.user': { $ne: req.user._id }
                },
                {
                    $push: {
                        readBy: { user: req.user._id, readAt: new Date() }
                    }
                }
            );
        }

        // Reset unread count
        chat.unreadCount.set(req.user._id.toString(), 0);
        await chat.save();

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res, next) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findOne({
            _id: messageId,
            sender: req.user._id
        });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found or you do not have permission to delete it'
            });
        }

        // Soft delete
        message.isDeleted = true;
        message.content = 'This message was deleted';
        await message.save();

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
