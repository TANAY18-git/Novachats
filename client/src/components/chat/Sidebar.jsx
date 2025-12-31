import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Settings, Link2, Plus, MessageCircle,
    Copy, RefreshCw, Clock, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import ChatListItem from './ChatListItem';
import { copyToClipboard, formatExpiryTime } from '../../utils/helpers';

const Sidebar = ({ onChatSelect, selectedChatId }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { chats, chatLink, fetchChats, generateChatLink, getChatLink, isLoading } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkTimeRemaining, setLinkTimeRemaining] = useState('');

    useEffect(() => {
        getChatLink();
    }, []);

    // Update countdown timer
    useEffect(() => {
        if (!chatLink?.expiresAt) return;

        const updateTimer = () => {
            setLinkTimeRemaining(formatExpiryTime(chatLink.expiresAt));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [chatLink?.expiresAt]);

    const filteredChats = chats.filter(chat =>
        chat.participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleGenerateLink = async () => {
        const result = await generateChatLink();
        if (result.success) {
            toast.success('Chat link generated!');
        } else {
            toast.error(result.message);
        }
    };

    const handleCopyLink = async () => {
        if (!chatLink?.code) return;

        const fullLink = `${window.location.origin}/join/${chatLink.code}`;
        const success = await copyToClipboard(fullLink);

        if (success) {
            toast.success('Link copied to clipboard!');
        } else {
            toast.error('Failed to copy link');
        }
    };

    const getProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profilePicture}`;
    };

    return (
        <>
            <div className="sidebar h-full flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-dark-200 dark:border-dark-700">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="avatar-ring">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img
                                            src={getProfilePictureUrl(user.profilePicture)}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full gradient-primary flex items-center justify-center">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-dark-900 dark:text-white">Novachats</h1>
                                <p className="text-xs text-dark-500">@{user?.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="p-2.5 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-xl transition-all shadow-sm"
                                title="Generate chat link"
                            >
                                <Link2 className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                            </button>
                            <button
                                onClick={() => navigate('/settings')}
                                className="p-2.5 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-xl transition-all shadow-sm"
                                title="Settings"
                            >
                                <Settings className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="input-styled w-full pl-12 pr-4 py-3 text-dark-900 dark:text-white placeholder-dark-400"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto hide-scrollbar">
                    {filteredChats.length > 0 ? (
                        filteredChats.map(chat => (
                            <ChatListItem
                                key={chat._id}
                                chat={chat}
                                isSelected={chat._id === selectedChatId}
                                onClick={() => onChatSelect(chat)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 dark:from-dark-700 dark:to-dark-600 rounded-full flex items-center justify-center mb-5 shadow-lg">
                                <MessageCircle className="w-10 h-10 text-primary-500" />
                            </div>
                            <h3 className="text-lg font-bold text-dark-900 dark:text-white mb-2">No chats yet</h3>
                            <p className="text-sm text-dark-500 mb-5">
                                Generate a chat link to start a conversation
                            </p>
                            <button
                                onClick={() => setShowLinkModal(true)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="card w-full max-w-md animate-fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-dark-700">
                            <h2 className="text-xl font-bold text-dark-900 dark:text-white">Share Chat Link</h2>
                            <button
                                onClick={() => setShowLinkModal(false)}
                                className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-dark-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            <p className="text-dark-600 dark:text-dark-300 mb-6">
                                Share this link with someone to start a private chat. The link expires after 60 minutes for security.
                            </p>

                            {chatLink?.code ? (
                                <div className="space-y-4">
                                    {/* Link Display */}
                                    <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl border border-dark-200 dark:border-dark-600">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-medium text-dark-500 uppercase tracking-wider">Your Chat Link</span>
                                            <div className="flex items-center gap-1 text-xs text-primary-500 font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{linkTimeRemaining}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm text-primary-600 dark:text-primary-400 font-mono bg-white dark:bg-dark-800 px-3 py-2 rounded-lg truncate">
                                                {window.location.origin}/join/{chatLink.code}
                                            </code>
                                            <button
                                                onClick={handleCopyLink}
                                                className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-md"
                                                title="Copy link"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Regenerate Button */}
                                    <button
                                        onClick={handleGenerateLink}
                                        disabled={isLoading}
                                        className="w-full py-3 bg-dark-100 dark:bg-dark-700 hover:bg-dark-200 dark:hover:bg-dark-600 rounded-xl text-dark-700 dark:text-dark-200 font-medium transition-colors flex items-center justify-center gap-2 border border-dark-200 dark:border-dark-600"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        Generate New Link
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={isLoading}
                                    className="btn-primary w-full py-4 text-center"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-5 h-5 mx-auto animate-spin" />
                                    ) : (
                                        'Generate Chat Link'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
