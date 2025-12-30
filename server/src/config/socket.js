const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

let io;

// Store online users: { oderId: socketId }
const onlineUsers = new Map();

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? ['https://novachats.vercel.app', 'https://novachats.netlify.app']
                : ['http://localhost:5173', 'http://127.0.0.1:5173'],
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`👤 User connected: ${socket.user.username} (${socket.id})`);

        // Add user to online users
        onlineUsers.set(socket.user._id.toString(), socket.id);

        // Update user's online status
        User.findByIdAndUpdate(socket.user._id, {
            isOnline: true,
            lastSeen: new Date()
        }).exec();

        // Broadcast user online status
        socket.broadcast.emit('user:online', {
            oderId: socket.user._id.toString(),
            isOnline: true
        });

        // Join a chat room
        socket.on('chat:join', (chatId) => {
            socket.join(chatId);
            console.log(`📍 ${socket.user.username} joined chat: ${chatId}`);
        });

        // Leave a chat room
        socket.on('chat:leave', (chatId) => {
            socket.leave(chatId);
            console.log(`📍 ${socket.user.username} left chat: ${chatId}`);
        });

        // Handle new message
        socket.on('message:send', async (data) => {
            const { chatId, content, recipientId } = data;

            // Emit message to chat room
            socket.to(chatId).emit('message:receive', {
                chatId,
                content,
                sender: {
                    _id: socket.user._id,
                    username: socket.user.username,
                    profilePicture: socket.user.profilePicture
                },
                timestamp: new Date(),
                tempId: data.tempId
            });

            // Send notification to recipient if they're online but not in the chat room
            const recipientSocketId = onlineUsers.get(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('message:notification', {
                    chatId,
                    sender: {
                        _id: socket.user._id,
                        username: socket.user.username,
                        profilePicture: socket.user.profilePicture
                    },
                    preview: content.substring(0, 50)
                });
            }
        });

        // Handle typing indicator
        socket.on('typing:start', (data) => {
            socket.to(data.chatId).emit('typing:start', {
                oderId: socket.user._id.toString(),
                username: socket.user.username
            });
        });

        socket.on('typing:stop', (data) => {
            socket.to(data.chatId).emit('typing:stop', {
                oderId: socket.user._id.toString()
            });
        });

        // Handle message read status
        socket.on('message:read', (data) => {
            socket.to(data.chatId).emit('message:read', {
                chatId: data.chatId,
                oderId: socket.user._id.toString(),
                messageIds: data.messageIds
            });
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`👋 User disconnected: ${socket.user.username}`);

            // Remove user from online users
            onlineUsers.delete(socket.user._id.toString());

            // Update user's offline status
            await User.findByIdAndUpdate(socket.user._id, {
                isOnline: false,
                lastSeen: new Date()
            });

            // Broadcast user offline status
            socket.broadcast.emit('user:offline', {
                oderId: socket.user._id.toString(),
                lastSeen: new Date()
            });
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

const getOnlineUsers = () => onlineUsers;

module.exports = { initializeSocket, getIO, getOnlineUsers };
