const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        content: {
            type: String,
            default: ''
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: null
        }
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: new Map()
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster participant queries
chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

// Get the other participant
chatSchema.methods.getOtherParticipant = function (userId) {
    return this.participants.find(
        participant => participant._id.toString() !== userId.toString()
    );
};

// Static method to find chat between two users
chatSchema.statics.findChatBetweenUsers = async function (userId1, userId2) {
    return await this.findOne({
        participants: { $all: [userId1, userId2] },
        isActive: true
    }).populate('participants', 'username profilePicture isOnline lastSeen');
};

// Static method to create or get chat between two users
chatSchema.statics.getOrCreateChat = async function (userId1, userId2) {
    let chat = await this.findChatBetweenUsers(userId1, userId2);

    if (!chat) {
        chat = await this.create({
            participants: [userId1, userId2],
            unreadCount: new Map([[userId1.toString(), 0], [userId2.toString(), 0]])
        });
        await chat.populate('participants', 'username profilePicture isOnline lastSeen');
    }

    return chat;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
