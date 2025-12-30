import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, MoreVertical, Send, Smile, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import {
    sendSocketMessage,
    emitTypingStart,
    emitTypingStop,
    joinChat
} from '../../utils/socket';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { formatLastSeen, shouldShowDateSeparator, formatMessageDate } from '../../utils/helpers';

const ChatWindow = ({ chat, onBack }) => {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const { user } = useAuthStore();
    const {
        messages,
        sendMessage,
        fetchMessages,
        markChatAsRead,
        typingUsers
    } = useChatStore();

    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const { participant } = chat;
    const isPartnerTyping = typingUsers[chat._id];

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    // Join chat room on mount
    useEffect(() => {
        if (chat._id) {
            joinChat(chat._id);
            markChatAsRead(chat._id);
        }
    }, [chat._id]);

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        if (!isTyping) {
            setIsTyping(true);
            emitTypingStart(chat._id);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            emitTypingStop(chat._id);
        }, 2000);
    }, [chat._id, isTyping]);

    const handleInputChange = (e) => {
        setMessageText(e.target.value);
        handleTyping();
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        const content = messageText.trim();
        if (!content) return;

        setMessageText('');
        setIsTyping(false);
        emitTypingStop(chat._id);

        // Send via API
        const result = await sendMessage(chat._id, content);

        if (result.success) {
            // Also send via socket for real-time delivery
            sendSocketMessage(chat._id, content, participant._id, result.message._id);
        } else {
            toast.error('Failed to send message');
            setMessageText(content);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profilePicture}`;
    };

    return (
        <div className="flex flex-col h-full bg-dark-50 dark:bg-dark-900">
            {/* Header */}
            <header className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors md:hidden"
                >
                    <ArrowLeft className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                </button>

                {/* Avatar */}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center overflow-hidden">
                        {participant?.profilePicture ? (
                            <img
                                src={getProfilePictureUrl(participant.profilePicture)}
                                alt={participant.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white font-bold">
                                {participant?.username?.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* Online indicator */}
                    {participant?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-800" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-dark-900 dark:text-white truncate">
                        {participant?.username}
                    </h2>
                    <p className="text-xs text-dark-500">
                        {isPartnerTyping ? (
                            <span className="text-primary-500">typing...</span>
                        ) : participant?.isOnline ? (
                            <span className="text-green-500">Online</span>
                        ) : (
                            `Last seen ${formatLastSeen(participant?.lastSeen)}`
                        )}
                    </p>
                </div>

                {/* Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                    >
                        <MoreVertical className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-700 rounded-xl shadow-xl border border-dark-200 dark:border-dark-600 z-20 overflow-hidden">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        toast.success('Chat cleared');
                                    }}
                                    className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-dark-50 dark:hover:bg-dark-600 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear Chat
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const showDate = shouldShowDateSeparator(
                        message.createdAt,
                        prevMessage?.createdAt
                    );

                    return (
                        <div key={message._id}>
                            {/* Date separator */}
                            {showDate && (
                                <div className="flex items-center justify-center my-4">
                                    <span className="px-3 py-1 bg-dark-200 dark:bg-dark-700 rounded-full text-xs text-dark-500">
                                        {formatMessageDate(message.createdAt)}
                                    </span>
                                </div>
                            )}

                            <MessageBubble
                                message={message}
                                isOwn={message.sender?._id === user?._id || message.sender === user?._id}
                            />
                        </div>
                    );
                })}

                {/* Typing indicator */}
                {isPartnerTyping && (
                    <TypingIndicator username={participant?.username} />
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-dark-800 border-t border-dark-200 dark:border-dark-700"
            >
                <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={messageText}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            rows={1}
                            className="w-full px-4 py-3 bg-dark-100 dark:bg-dark-700 border-0 rounded-2xl text-dark-900 dark:text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none max-h-32 transition-all"
                            style={{ minHeight: '48px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!messageText.trim()}
                        className="p-3 gradient-primary rounded-xl text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
