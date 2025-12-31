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
        <div className="main-empty">
            {/* Hero Icon */}
            <div className="main-empty-icon">
                <MessageCircle size={48} color="white" />
                <div className="badge-sparkle">
                    <Sparkles size={18} color="white" />
                </div>
            </div>

            <h2>Start a Conversation</h2>
            <p>Select a chat from the sidebar or generate a link to invite someone to chat with you</p>

            {/* Action Card */}
            <div className="action-card">
                <div className="action-card-header">
                    <div className="action-card-icon">
                        <Link2 size={24} color="white" />
                    </div>
                    <div className="action-card-text">
                        <h3>Share a Chat Link</h3>
                        <p>Anyone with the link can start chatting with you</p>
                    </div>
                </div>

                {showLink && chatLink?.code ? (
                    <div>
                        <div className="code-block" style={{ marginBottom: '12px' }}>
                            {window.location.origin}/join/{chatLink.code}
                        </div>
                        <button className="btn-primary" style={{ width: '100%' }} onClick={handleCopyLink}>
                            Copy Link
                        </button>
                    </div>
                ) : (
                    <button className="btn-primary" style={{ width: '100%' }} onClick={handleGenerateLink} disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Chat Link'}
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>

            {/* How It Works */}
            <div className="steps-section">
                <div className="steps-title">How it works</div>

                <div className="step-item">
                    <span className="step-badge blue">1</span>
                    <span className="step-text">Generate a unique chat link</span>
                </div>

                <div className="step-item">
                    <span className="step-badge purple">2</span>
                    <span className="step-text">Share the link with someone</span>
                </div>

                <div className="step-item">
                    <span className="step-badge green">3</span>
                    <span className="step-text">Start chatting in real-time</span>
                </div>
            </div>
        </div>
    );
};

export default EmptyChat;
