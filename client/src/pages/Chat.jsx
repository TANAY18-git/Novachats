import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useChatStore from '../store/chatStore';
import { initSocket, disconnectSocket, getSocket, joinChat, leaveChat } from '../utils/socket';
import Sidebar from '../components/chat/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';
import EmptyChat from '../components/chat/EmptyChat';
import MobileNav from '../components/chat/MobileNav';

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
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

    // Initialize socket connection
    useEffect(() => {
        if (token) {
            const socket = initSocket(token);

            // Listen for incoming messages
            socket.on('message:receive', (message) => {
                addMessage({
                    _id: message.tempId || Date.now().toString(),
                    content: message.content,
                    sender: message.sender,
                    createdAt: message.timestamp,
                    chat: message.chatId
                });

                // Update chat in list
                updateChatInList(message.chatId, {
                    lastMessage: {
                        content: message.content.substring(0, 100),
                        sender: message.sender._id,
                        timestamp: message.timestamp
                    },
                    updatedAt: new Date()
                });
            });

            // Listen for message notifications (when not in chat)
            socket.on('message:notification', (data) => {
                // Increment unread count
                const chat = chats.find(c => c._id === data.chatId);
                if (chat) {
                    updateChatInList(data.chatId, {
                        unreadCount: (chat.unreadCount || 0) + 1
                    });
                }
            });

            // Listen for typing indicators
            socket.on('typing:start', (data) => {
                setTypingUser(currentChat?._id, data.userId, true);
            });

            socket.on('typing:stop', (data) => {
                setTypingUser(currentChat?._id, data.userId, false);
            });

            // Listen for online/offline status
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

    // Fetch chats on mount
    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // Handle chat selection from URL
    useEffect(() => {
        if (chatId && chats.length > 0) {
            const chat = chats.find(c => c._id === chatId);
            if (chat) {
                setCurrentChat(chat);
                fetchMessages(chatId);
                joinChat(chatId);
                setIsMobileChatOpen(true);
            }
        }
    }, [chatId, chats]);

    // Clean up on unmount
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
        setIsMobileChatOpen(true);
        setIsMobileMenuOpen(false);
    };

    const handleBackToList = () => {
        setIsMobileChatOpen(false);
        setCurrentChat(null);
        navigate('/');
    };

    return (
        <div className="h-screen flex bg-dark-100 dark:bg-dark-900 overflow-hidden">
            {/* Mobile Navigation */}
            <MobileNav
                isMenuOpen={isMobileMenuOpen}
                onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                showBackButton={isMobileChatOpen}
                onBack={handleBackToList}
            />

            {/* Sidebar */}
            <div className={`
        fixed md:relative inset-y-0 left-0 z-30 w-full md:w-80 lg:w-96
        transform ${isMobileMenuOpen || !isMobileChatOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-out
        ${isMobileChatOpen ? 'hidden md:block' : 'block'}
      `}>
                <Sidebar
                    onChatSelect={handleChatSelect}
                    selectedChatId={currentChat?._id}
                />
            </div>

            {/* Chat Window */}
            <div className={`
        flex-1 flex flex-col
        ${!isMobileChatOpen ? 'hidden md:flex' : 'flex'}
      `}>
                {currentChat ? (
                    <ChatWindow
                        chat={currentChat}
                        onBack={handleBackToList}
                    />
                ) : (
                    <EmptyChat />
                )}
            </div>
        </div>
    );
};

export default Chat;
