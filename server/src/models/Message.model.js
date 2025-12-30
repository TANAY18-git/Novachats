const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for faster message queries
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Mark message as read
messageSchema.methods.markAsRead = async function (userId) {
    const alreadyRead = this.readBy.some(
        read => read.user.toString() === userId.toString()
    );

    if (!alreadyRead) {
        this.readBy.push({ user: userId, readAt: new Date() });
        await this.save();
    }

    return this;
};

// Static method to get messages for a chat with pagination
messageSchema.statics.getMessagesForChat = async function (chatId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const messages = await this.find({ chat: chatId, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username profilePicture')
        .lean();

    return messages.reverse();
};

// Static method to get total message count for a chat
messageSchema.statics.getMessageCount = async function (chatId) {
    return await this.countDocuments({ chat: chatId, isDeleted: false });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
