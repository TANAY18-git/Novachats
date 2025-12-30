import { create } from 'zustand';
import api from '../utils/api';

const useChatStore = create((set, get) => ({
    chats: [],
    currentChat: null,
    messages: [],
    isLoading: false,
    error: null,
    typingUsers: {},
    onlineUsers: {},
    chatLink: null,

    // Set chats
    setChats: (chats) => set({ chats }),

    // Set current chat
    setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),

    // Set messages
    setMessages: (messages) => set({ messages }),

    // Add message
    addMessage: (message) => {
        const messages = get().messages;
        const exists = messages.some(m => m._id === message._id);
        if (!exists) {
            set({ messages: [...messages, message] });
        }
    },

    // Update chat in list
    updateChatInList: (chatId, updates) => {
        const chats = get().chats.map(chat =>
            chat._id === chatId ? { ...chat, ...updates } : chat
        );
        // Sort by updatedAt
        chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        set({ chats });
    },

    // Fetch all chats
    fetchChats: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/chats');
            set({ chats: response.data.data.chats, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to load chats',
                isLoading: false
            });
        }
    },

    // Create or get chat
    createChat: async (userId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/chats', { userId });
            const chat = response.data.data.chat;

            // Add to chats if not exists
            const chats = get().chats;
            const exists = chats.some(c => c._id === chat._id);
            if (!exists) {
                set({ chats: [chat, ...chats] });
            }

            set({ currentChat: chat, isLoading: false });
            return { success: true, chat };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create chat';
            set({ error: message, isLoading: false });
            return { success: false, message };
        }
    },

    // Join chat by link
    joinChatByLink: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/chats/join/${code}`);
            const chat = response.data.data.chat;

            // Add to chats if not exists
            const chats = get().chats;
            const exists = chats.some(c => c._id === chat._id);
            if (!exists) {
                set({ chats: [chat, ...chats] });
            }

            set({ currentChat: chat, isLoading: false });
            return { success: true, chat };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to join chat';
            set({ error: message, isLoading: false });
            return { success: false, message };
        }
    },

    // Fetch messages for a chat
    fetchMessages: async (chatId, page = 1) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(`/messages/${chatId}?page=${page}`);
            const { messages, pagination } = response.data.data;

            if (page === 1) {
                set({ messages, isLoading: false });
            } else {
                set({ messages: [...messages, ...get().messages], isLoading: false });
            }

            return { success: true, pagination };
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Failed to load messages',
                isLoading: false
            });
            return { success: false };
        }
    },

    // Send message
    sendMessage: async (chatId, content) => {
        try {
            const response = await api.post(`/messages/${chatId}`, { content });
            const message = response.data.data.message;

            // Add message to state
            get().addMessage(message);

            // Update chat in list
            get().updateChatInList(chatId, {
                lastMessage: {
                    content: content.substring(0, 100),
                    sender: message.sender._id,
                    timestamp: new Date()
                },
                updatedAt: new Date()
            });

            return { success: true, message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send message'
            };
        }
    },

    // Mark chat as read
    markChatAsRead: async (chatId) => {
        try {
            await api.put(`/chats/${chatId}/read`);
            get().updateChatInList(chatId, { unreadCount: 0 });
        } catch (error) {
            console.error('Failed to mark chat as read:', error);
        }
    },

    // Generate chat link
    generateChatLink: async () => {
        set({ isLoading: true });
        try {
            const response = await api.post('/users/chat-link');
            const chatLink = response.data.data.chatLink;
            set({ chatLink, isLoading: false });
            return { success: true, chatLink };
        } catch (error) {
            set({ isLoading: false });
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to generate link'
            };
        }
    },

    // Get current chat link
    getChatLink: async () => {
        try {
            const response = await api.get('/users/chat-link');
            set({ chatLink: response.data.data.chatLink });
        } catch (error) {
            console.error('Failed to get chat link:', error);
        }
    },

    // Set user typing
    setTypingUser: (chatId, userId, isTyping) => {
        const typingUsers = { ...get().typingUsers };
        if (isTyping) {
            typingUsers[chatId] = userId;
        } else if (typingUsers[chatId] === userId) {
            delete typingUsers[chatId];
        }
        set({ typingUsers });
    },

    // Set user online status
    setUserOnline: (userId, isOnline, lastSeen = null) => {
        const onlineUsers = { ...get().onlineUsers };
        onlineUsers[userId] = { isOnline, lastSeen };
        set({ onlineUsers });

        // Update in current chat if applicable
        const currentChat = get().currentChat;
        if (currentChat && currentChat.participant._id === userId) {
            set({
                currentChat: {
                    ...currentChat,
                    participant: {
                        ...currentChat.participant,
                        isOnline,
                        lastSeen: lastSeen || currentChat.participant.lastSeen
                    }
                }
            });
        }

        // Update in chats list
        const chats = get().chats.map(chat => {
            if (chat.participant._id === userId) {
                return {
                    ...chat,
                    participant: {
                        ...chat.participant,
                        isOnline,
                        lastSeen: lastSeen || chat.participant.lastSeen
                    }
                };
            }
            return chat;
        });
        set({ chats });
    },

    // Clear current chat
    clearCurrentChat: () => set({ currentChat: null, messages: [] }),

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useChatStore;
