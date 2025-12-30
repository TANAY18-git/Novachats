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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-dark-50 dark:bg-dark-900">
            <div className="max-w-md text-center">
                {/* Illustration */}
                <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto gradient-primary rounded-3xl flex items-center justify-center shadow-glow-lg animate-pulse-slow">
                        <MessageCircle className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 left-1/2 w-24 h-24 bg-purple-500/30 rounded-full blur-2xl" />
                </div>

                <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">
                    Start a Conversation
                </h2>
                <p className="text-dark-500 mb-8">
                    Select a chat from the sidebar or generate a link to invite someone to chat with you
                </p>

                {/* Generate Link Card */}
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-xl border border-dark-200 dark:border-dark-700">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                            <Link2 className="w-6 h-6 text-primary-500" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-semibold text-dark-900 dark:text-white">Share a Chat Link</h3>
                            <p className="text-sm text-dark-500">Anyone with the link can start chatting</p>
                        </div>
                    </div>

                    {showLink && chatLink?.code ? (
                        <div className="space-y-3">
                            <div className="p-3 bg-dark-50 dark:bg-dark-700 rounded-xl">
                                <code className="text-sm text-primary-500 font-mono break-all">
                                    {window.location.origin}/join/{chatLink.code}
                                </code>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="w-full py-3 gradient-primary rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
                            >
                                Copy Link
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateLink}
                            disabled={isLoading}
                            className="w-full py-3 gradient-primary rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            Generate Chat Link
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* How it works */}
                <div className="mt-8 text-left">
                    <h4 className="text-sm font-semibold text-dark-500 uppercase tracking-wide mb-4">How it works</h4>
                    <div className="space-y-3">
                        {[
                            { step: 1, text: 'Generate a unique chat link' },
                            { step: 2, text: 'Share the link with someone' },
                            { step: 3, text: 'Start chatting in real-time' }
                        ].map(({ step, text }) => (
                            <div key={step} className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-sm font-bold text-primary-500">
                                    {step}
                                </span>
                                <span className="text-dark-600 dark:text-dark-300">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyChat;
