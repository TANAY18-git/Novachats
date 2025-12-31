import { MessageCircle, Link2, ArrowRight, Sparkles } from 'lucide-react';
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
        <div className="main-content flex-1 flex flex-col items-center justify-center p-8">
            <div className="max-w-lg w-full text-center">
                {/* Hero Icon */}
                <div className="relative inline-block mb-8">
                    <div className="empty-icon">
                        <MessageCircle className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Start a Conversation</h2>
                <p className="text-lg text-dark-400 mb-10">
                    Select a chat from the sidebar or generate a link to invite someone
                </p>

                {/* Action Card */}
                <div className="card-glow p-8 text-left mb-10">
                    <div className="flex items-start gap-5 mb-6">
                        <div className="avatar">
                            <Link2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Share a Chat Link</h3>
                            <p className="text-dark-400">Anyone with the link can start chatting with you</p>
                        </div>
                    </div>

                    {showLink && chatLink?.code ? (
                        <div className="space-y-4">
                            <div className="code-block break-all">
                                {window.location.origin}/join/{chatLink.code}
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
                    <h4 className="text-sm font-bold text-dark-500 uppercase tracking-widest mb-5">
                        How it works
                    </h4>
                    <div className="space-y-4">
                        <div className="step-item">
                            <span className="step-badge step-1">1</span>
                            <span className="text-dark-200 font-medium">Generate a unique chat link</span>
                        </div>
                        <div className="step-item">
                            <span className="step-badge step-2">2</span>
                            <span className="text-dark-200 font-medium">Share the link with someone</span>
                        </div>
                        <div className="step-item">
                            <span className="step-badge step-3">3</span>
                            <span className="text-dark-200 font-medium">Start chatting in real-time</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyChat;
