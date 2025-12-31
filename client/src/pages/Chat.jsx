import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import { initSocket, disconnectSocket, getSocket, joinChat, leaveChat } from '../utils/socket';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import EmptyChat from '../components/chat/EmptyChat';

const Chat = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { token, user } = useAuthStore();
    const {
        currentChat,
        setCurrentChat,
        fetchChats,
        fetchMessages,
        addMessage,
        updateChatInList,
        setTypingUser,
        setUserOnline,
        chats
    } = useChatStore();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (token) {
            const socket = initSocket(token);

            socket.on('message:receive', (message) => {
                addMessage({
                    _id: message.tempId || Date.now().toString(),
                    content: message.content,
                    sender: message.sender,
                    createdAt: message.timestamp,
                    chat: message.chatId
                });

                updateChatInList(message.chatId, {
                    lastMessage: {
                        content: message.content.substring(0, 100),
                        sender: message.sender._id,
                        timestamp: message.timestamp
                    },
                    updatedAt: new Date()
                });
            });

            socket.on('message:notification', (data) => {
                const chat = chats.find(c => c._id === data.chatId);
                if (chat) {
                    updateChatInList(data.chatId, {
                        unreadCount: (chat.unreadCount || 0) + 1
                    });
                }
            });

            socket.on('typing:start', (data) => {
                setTypingUser(currentChat?._id, data.userId, true);
            });

            socket.on('typing:stop', (data) => {
                setTypingUser(currentChat?._id, data.userId, false);
            });

            socket.on('user:online', (data) => {
                setUserOnline(data.userId, true);
            });

            socket.on('user:offline', (data) => {
                setUserOnline(data.userId, false, data.lastSeen);
            });

            return () => {
                socket.off('message:receive');
                socket.off('message:notification');
                socket.off('typing:start');
                socket.off('typing:stop');
                socket.off('user:online');
                socket.off('user:offline');
            };
        }
    }, [token, currentChat?._id]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (chatId && chats.length > 0) {
            const chat = chats.find(c => c._id === chatId);
            if (chat) {
                setCurrentChat(chat);
                fetchMessages(chatId);
                joinChat(chatId);
            }
        }
    }, [chatId, chats]);

    useEffect(() => {
        return () => {
            if (currentChat?._id) {
                leaveChat(currentChat._id);
            }
        };
    }, [currentChat?._id]);

    const handleChatSelect = (chat) => {
        if (currentChat?._id) {
            leaveChat(currentChat._id);
        }
        setCurrentChat(chat);
        fetchMessages(chat._id);
        joinChat(chat._id);
        navigate(`/chat/${chat._id}`);
    };

    const handleBackToList = () => {
        setCurrentChat(null);
        navigate('/');
    };

    return (
        <div className="app-container">
            {/* Sidebar */}
            <div className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
                <Sidebar
                    onChatSelect={handleChatSelect}
                    selectedChatId={currentChat?._id}
                />
            </div>

            {/* Main Content */}
            <div className="main-container">
                {currentChat ? (
                    <ChatWindow chat={currentChat} onBack={handleBackToList} />
                ) : (
                    <EmptyChat />
                )}
            </div>
        </div>
    );
};

export default Chat;
