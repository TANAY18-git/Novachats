import { MessageCircle } from 'lucide-react';
import { formatChatTime, truncateText } from '../../utils/helpers';

const ChatListItem = ({ chat, isSelected, onClick }) => {
    const { participant, lastMessage, unreadCount } = chat;

    const getProfilePictureUrl = (profilePicture) => {
        if (!profilePicture) return null;
        if (profilePicture.startsWith('http')) return profilePicture;
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${profilePicture}`;
    };

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 flex items-center gap-3 hover:bg-dark-50 dark:hover:bg-dark-700/50 transition-colors ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                }`}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center overflow-hidden">
                    {participant?.profilePicture ? (
                        <img
                            src={getProfilePictureUrl(participant.profilePicture)}
                            alt={participant.username}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <MessageCircle className="w-6 h-6 text-white" />
                    )}
                </div>
                {/* Online indicator */}
                {participant?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-dark-800" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-dark-900 dark:text-white truncate">
                        {participant?.username || 'Unknown User'}
                    </span>
                    {lastMessage?.timestamp && (
                        <span className="text-xs text-dark-500 flex-shrink-0 ml-2">
                            {formatChatTime(lastMessage.timestamp)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-dark-500 truncate">
                        {lastMessage?.content ? truncateText(lastMessage.content, 35) : 'Start a conversation'}
                    </p>
                    {unreadCount > 0 && (
                        <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-primary-500 rounded-full text-xs text-white font-medium flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
};

export default ChatListItem;
