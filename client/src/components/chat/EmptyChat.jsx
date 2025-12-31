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
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-dark-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-900 dark:to-dark-800">
            <div className="max-w-lg text-center">
                {/* Illustration */}
                <div className="relative mb-10">
                    <div className="w-36 h-36 mx-auto gradient-primary rounded-3xl flex items-center justify-center shadow-glow-lg transform rotate-3 hover:rotate-0 transition-transform duration-500">
                        <MessageCircle className="w-20 h-20 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 animate-bounce">
                        <Sparkles className="w-6 h-6 text-yellow-900" />
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent blur-xl" />
                </div>

                <h2 className="text-3xl font-extrabold text-dark-900 dark:text-white mb-4">
                    Start a Conversation
                </h2>
                <p className="text-lg text-dark-500 dark:text-dark-400 mb-10">
                    Select a chat from the sidebar or generate a link to invite someone to chat with you
                </p>

                {/* Generate Link Card */}
                <div className="card p-8 text-left">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-4 gradient-primary rounded-2xl shadow-glow">
                            <Link2 className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-1">Share a Chat Link</h3>
                            <p className="text-dark-500">Anyone with the link can start chatting with you</p>
                        </div>
                    </div>

                    {showLink && chatLink?.code ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-dark-50 dark:bg-dark-700 rounded-xl border border-dark-200 dark:border-dark-600">
                                <code className="text-sm text-primary-600 dark:text-primary-400 font-mono break-all">
                                    {window.location.origin}/join/{chatLink.code}
                                </code>
                            </div>
                            <button
                                onClick={handleCopyLink}
                                className="btn-primary w-full py-4 text-center"
                            >
                                Copy Link
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGenerateLink}
                            disabled={isLoading}
                            className="btn-primary w-full py-4 flex items-center justify-center gap-3"
                        >
                            Generate Chat Link
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* How it works */}
                <div className="mt-10 text-left">
                    <h4 className="text-sm font-bold text-dark-400 dark:text-dark-500 uppercase tracking-widest mb-5">How it works</h4>
                    <div className="space-y-4">
                        {[
                            { step: 1, text: 'Generate a unique chat link', color: 'from-blue-500 to-cyan-500' },
                            { step: 2, text: 'Share the link with someone', color: 'from-purple-500 to-pink-500' },
                            { step: 3, text: 'Start chatting in real-time', color: 'from-green-500 to-emerald-500' }
                        ].map(({ step, text, color }) => (
                            <div key={step} className="flex items-center gap-4 p-4 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-100 dark:border-dark-700 hover:shadow-md transition-shadow">
                                <span className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                    {step}
                                </span>
                                <span className="text-dark-700 dark:text-dark-200 font-medium">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmptyChat;
