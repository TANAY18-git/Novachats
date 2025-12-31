import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Settings, Link2, Plus, MessageCircle, Copy, RefreshCw, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import ChatListItem from './ChatListItem';
import { copyToClipboard, formatExpiryTime } from '../../utils/helpers';

const Sidebar = ({ onChatSelect, selectedChatId }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { chats, chatLink, generateChatLink, getChatLink, isLoading } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkTimeRemaining, setLinkTimeRemaining] = useState('');

    useEffect(() => {
        getChatLink();
    }, []);

    useEffect(() => {
        if (!chatLink?.expiresAt) return;
        const updateTimer = () => setLinkTimeRemaining(formatExpiryTime(chatLink.expiresAt));
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
            toast.success('Link copied!');
        }
    };

    return (
        <>
            <div className="sidebar h-full flex flex-col">
                {/* Header */}
                <div className="sidebar-header">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                            <div className="avatar">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Novachats</h1>
                                <p className="text-sm text-primary-400 font-medium">@{user?.username}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowLinkModal(true)} className="icon-btn" title="Generate link">
                                <Link2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => navigate('/settings')} className="icon-btn" title="Settings">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chats..."
                            className="sidebar-search"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto hide-scrollbar py-2">
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
                        <div className="empty-state">
                            <div className="empty-icon">
                                <MessageCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No chats yet</h3>
                            <p className="text-dark-400 mb-6">Generate a link to start chatting</p>
                            <button onClick={() => setShowLinkModal(true)} className="btn-primary">
                                <Plus className="w-5 h-5" />
                                New Chat
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showLinkModal && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="card-glow w-full max-w-md p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">Share Chat Link</h2>
                            <button onClick={() => setShowLinkModal(false)} className="icon-btn">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-dark-400 mb-8">
                            Share this link to start a private chat. The link expires in 60 minutes for security.
                        </p>

                        {chatLink?.code ? (
                            <div className="space-y-5">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-dark-500 uppercase tracking-wider">Your Link</span>
                                        <span className="text-sm text-primary-400 font-medium flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {linkTimeRemaining}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="code-block flex-1 truncate">
                                            {window.location.origin}/join/{chatLink.code}
                                        </div>
                                        <button onClick={handleCopyLink} className="btn-primary px-4 py-3">
                                            <Copy className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <button onClick={handleGenerateLink} disabled={isLoading} className="btn-secondary w-full">
                                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                                    Generate New Link
                                </button>
                            </div>
                        ) : (
                            <button onClick={handleGenerateLink} disabled={isLoading} className="btn-primary w-full">
                                {isLoading ? (
                                    <><RefreshCw className="w-5 h-5 animate-spin" /> Generating...</>
                                ) : (
                                    'Generate Chat Link'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
