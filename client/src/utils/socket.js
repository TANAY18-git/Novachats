import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initSocket = (token) => {
    if (socket?.connected) {
        return socket;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinChat = (chatId) => {
    if (socket?.connected) {
        socket.emit('chat:join', chatId);
    }
};

export const leaveChat = (chatId) => {
    if (socket?.connected) {
        socket.emit('chat:leave', chatId);
    }
};

export const sendSocketMessage = (chatId, content, recipientId, tempId) => {
    if (socket?.connected) {
        socket.emit('message:send', { chatId, content, recipientId, tempId });
    }
};

export const emitTypingStart = (chatId) => {
    if (socket?.connected) {
        socket.emit('typing:start', { chatId });
    }
};

export const emitTypingStop = (chatId) => {
    if (socket?.connected) {
        socket.emit('typing:stop', { chatId });
    }
};

export const emitMessageRead = (chatId, messageIds) => {
    if (socket?.connected) {
        socket.emit('message:read', { chatId, messageIds });
    }
};
