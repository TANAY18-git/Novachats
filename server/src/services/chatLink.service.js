const { v4: uuidv4 } = require('uuid');
const User = require('../models/User.model');

class ChatLinkService {
    // Generate a unique chat code
    static generateCode() {
        // Generate a short, URL-friendly code
        const uuid = uuidv4().replace(/-/g, '');
        return uuid.substring(0, 8).toUpperCase();
    }

    // Create or regenerate chat link for a user
    static async createChatLink(userId) {
        const code = this.generateCode();
        const expiryMinutes = parseInt(process.env.CHAT_LINK_EXPIRY_MINUTES) || 60;
        const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

        const user = await User.findByIdAndUpdate(
            userId,
            {
                chatLink: {
                    code,
                    expiresAt
                }
            },
            { new: true }
        );

        return {
            code: user.chatLink.code,
            expiresAt: user.chatLink.expiresAt,
            link: `/join/${user.chatLink.code}`
        };
    }

    // Validate and get user from chat link
    static async validateChatLink(code) {
        const user = await User.findOne({
            'chatLink.code': code.toUpperCase(),
            'chatLink.expiresAt': { $gt: new Date() }
        }).select('_id username profilePicture isOnline lastSeen chatLink');

        if (!user) {
            return {
                valid: false,
                message: 'Chat link is invalid or has expired'
            };
        }

        return {
            valid: true,
            user: user.getPublicProfile(),
            userId: user._id
        };
    }

    // Invalidate user's chat link
    static async invalidateChatLink(userId) {
        await User.findByIdAndUpdate(userId, {
            chatLink: {
                code: null,
                expiresAt: null
            }
        });

        return { success: true };
    }

    // Get remaining time for chat link
    static getRemainingTime(expiresAt) {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
            return { expired: true, remaining: 0 };
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return {
            expired: false,
            remaining: diff,
            formatted: `${minutes}m ${seconds}s`
        };
    }
}

module.exports = ChatLinkService;
