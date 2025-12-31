import { MessageCircle, Link2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useChatStore from '../../store/chatStore';
import { copyToClipboard } from '../../utils/helpers';

const EmptyChat = () => {
    const { generateChatLink, chatLink, isLoading } = useChatStore();
    const [showLink, setShowLink] = useState(false);

    const handleGenerateLink = async () => {
        const result = await generateChatLink();
        if (result.success) {
            setShowLink(true);
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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-dark-900">
            <div className="max-w-md text-center">
                {/* Icon */}
                <div className="empty-icon mx-auto">
                    <MessageCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-3">Start a Conversation</h2>
                <p className="text-dark-400 mb-8">
                    Select a chat from the sidebar or generate a link to invite someone
                </p>

                {/* Action Card */}
                <div className="card p-6 text-left mb-8">
                    <div className="flex items-start gap-4 mb-5">
                        <div className="avatar">
                            <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">Share a Chat Link</h3>
                            <p className="text-sm text-dark-400">Anyone with the link can start chatting</p>
                        </div>
                    </div>

                    {showLink && chatLink?.code ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-dark-900 rounded-lg">
                                <code className="text-sm text-primary-400 font-mono break-all">
                                    {window.location.origin}/join/{chatLink.code}
                                </code>
                            </div>
                            <button onClick={handleCopyLink} className="btn-primary w-full">
                                Copy Link
                            </button>
                        </div>
                    ) : (
                        <button onClick={handleGenerateLink} disabled={isLoading} className="btn-primary w-full">
                            Generate Chat Link
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* How it works */}
                <div className="text-left">
                    <h4 className="text-xs font-semibold text-dark-500 uppercase tracking-wider mb-4">
                        How it works
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                            <span className="step-badge step-1">1</span>
                            <span className="text-dark-200">Generate a unique chat link</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                            <span className="step-badge step-2">2</span>
                            <span className="text-dark-200">Share the link with someone</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg">
                            <span className="step-badge step-3">3</span>
                            <span className="text-dark-200">Start chatting in real-time</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyChat;
