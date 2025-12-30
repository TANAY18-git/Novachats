import { formatMessageTime } from '../../utils/helpers';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isOwn }) => {
    const { content, createdAt, readBy } = message;
    const isRead = readBy && readBy.length > 1;

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
            <div
                className={`
          max-w-[75%] md:max-w-[60%] px-4 py-2.5 animate-fade-in
          ${isOwn
                        ? 'message-sent'
                        : 'message-received'
                    }
        `}
            >
                <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-white/70' : 'text-dark-400'}`}>
                    <span className="text-[10px]">{formatMessageTime(createdAt)}</span>
                    {isOwn && (
                        isRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-primary-200" />
                        ) : (
                            <Check className="w-3.5 h-3.5" />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
