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
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">
                        <MessageCircle size={22} />
                    </div>
                    <div className="logo-text">
                        <h1>Novachats</h1>
                        <p>@{user?.username}</p>
                    </div>
                    <div className="header-actions" style={{ marginLeft: 'auto' }}>
                        <button className="icon-btn" onClick={() => setShowLinkModal(true)} title="Share Link">
                            <Link2 size={18} />
                        </button>
                        <button className="icon-btn" onClick={() => navigate('/settings')} title="Settings">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                <div className="search-box">
                    <Search className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Chat List or Empty State */}
            {filteredChats.length > 0 ? (
                <div className="chat-list hide-scrollbar">
                    {filteredChats.map(chat => (
                        <ChatListItem
                            key={chat._id}
                            chat={chat}
                            isSelected={chat._id === selectedChatId}
                            onClick={() => onChatSelect(chat)}
                        />
                    ))}
                </div>
            ) : (
                <div className="empty-sidebar">
                    <div className="empty-sidebar-icon">
                        <MessageCircle size={32} color="white" />
                    </div>
                    <h3>No chats yet</h3>
                    <p>Generate a link to start chatting</p>
                    <button className="btn-primary" onClick={() => setShowLinkModal(true)}>
                        <Plus size={18} />
                        New Chat
                    </button>
                </div>
            )}

            {/* Share Link Modal */}
            {showLinkModal && (
                <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
                    <div className="modal-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Share Chat Link</h2>
                            <button className="icon-btn" onClick={() => setShowLinkModal(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>
                            Share this link with someone to start a private chat. Links expire in 60 minutes.
                        </p>

                        {chatLink?.code ? (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em' }}>Your Link</span>
                                    <span style={{ fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} />
                                        {linkTimeRemaining}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    <div className="code-block" style={{ flex: 1 }}>
                                        {window.location.origin}/join/{chatLink.code}
                                    </div>
                                    <button className="btn-primary" style={{ padding: '12px 16px' }} onClick={handleCopyLink}>
                                        <Copy size={18} />
                                    </button>
                                </div>

                                <button className="btn-secondary" style={{ width: '100%' }} onClick={handleGenerateLink} disabled={isLoading}>
                                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                                    Generate New Link
                                </button>
                            </div>
                        ) : (
                            <button className="btn-primary" style={{ width: '100%' }} onClick={handleGenerateLink} disabled={isLoading}>
                                {isLoading ? 'Generating...' : 'Generate Chat Link'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
