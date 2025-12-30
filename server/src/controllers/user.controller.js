const User = require('../models/User.model');
const ChatLinkService = require('../services/chatLink.service');
const { deleteFile } = require('../services/upload.service');
const path = require('path');
const fs = require('fs');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
    try {
        const { name, username } = req.body;
        const updateData = {};

        if (name) updateData.name = name;

        if (username && username !== req.user.username) {
            // Check if new username is available
            const existingUser = await User.findOne({
                username: username.toLowerCase(),
                _id: { $ne: req.user._id }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken'
                });
            }

            updateData.username = username.toLowerCase();
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: user.getOwnProfile()
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        // Check current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
exports.updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload an image file'
            });
        }

        const user = await User.findById(req.user._id);

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '../../uploads', path.basename(user.profilePicture));
            deleteFile(oldPath);
        }

        // Update profile picture URL
        const profilePictureUrl = `/uploads/${req.file.filename}`;
        user.profilePicture = profilePictureUrl;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Profile picture updated successfully',
            data: {
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate chat link
// @route   POST /api/users/chat-link
// @access  Private
exports.generateChatLink = async (req, res, next) => {
    try {
        const chatLink = await ChatLinkService.createChatLink(req.user._id);

        res.json({
            success: true,
            message: 'Chat link generated successfully',
            data: {
                chatLink
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current chat link
// @route   GET /api/users/chat-link
// @access  Private
exports.getChatLink = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.chatLink.code || new Date() > user.chatLink.expiresAt) {
            return res.json({
                success: true,
                data: {
                    chatLink: null,
                    message: 'No active chat link'
                }
            });
        }

        const remaining = ChatLinkService.getRemainingTime(user.chatLink.expiresAt);

        res.json({
            success: true,
            data: {
                chatLink: {
                    code: user.chatLink.code,
                    expiresAt: user.chatLink.expiresAt,
                    remaining: remaining.formatted,
                    link: `/join/${user.chatLink.code}`
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Invalidate chat link
// @route   DELETE /api/users/chat-link
// @access  Private
exports.invalidateChatLink = async (req, res, next) => {
    try {
        await ChatLinkService.invalidateChatLink(req.user._id);

        res.json({
            success: true,
            message: 'Chat link invalidated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Validate chat link and get user info
// @route   GET /api/users/validate-link/:code
// @access  Private
exports.validateChatLink = async (req, res, next) => {
    try {
        const { code } = req.params;
        const result = await ChatLinkService.validateChatLink(code);

        if (!result.valid) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        // Prevent user from joining their own link
        if (result.userId.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot join your own chat link'
            });
        }

        res.json({
            success: true,
            data: {
                user: result.user,
                userId: result.userId
            }
        });
    } catch (error) {
        next(error);
    }
};
