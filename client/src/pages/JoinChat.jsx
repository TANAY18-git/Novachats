import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageCircle, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatStore from '../store/chatStore';
import api from '../utils/api';

const JoinChat = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { joinChatByLink } = useChatStore();

    const [status, setStatus] = useState('validating'); // validating, valid, invalid, joining, success
    const [linkOwner, setLinkOwner] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        validateLink();
    }, [code]);

    const validateLink = async () => {
        try {
            const response = await api.get(`/users/validate-link/${code}`);
            setLinkOwner(response.data.data.user);
            setStatus('valid');
        } catch (error) {
            setStatus('invalid');
            setError(error.response?.data?.message || 'Invalid or expired link');
        }
    };

    const handleJoin = async () => {
        setStatus('joining');

        const result = await joinChatByLink(code);

        if (result.success) {
            setStatus('success');
            toast.success('Chat joined successfully!');
            setTimeout(() => {
                navigate(`/chat/${result.chat._id}`);
            }, 1500);
        } else {
            setStatus('invalid');
            setError(result.message);
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-950 to-primary-950 flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-dark-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to chats</span>
                </button>

                <div className="glass-dark rounded-3xl p-8 shadow-2xl border border-dark-700/50 text-center">
                    {/* Validating */}
                    {status === 'validating' && (
                        <>
                            <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Validating Link</h2>
                            <p className="text-dark-400">Please wait while we verify the chat link...</p>
                        </>
                    )}

                    {/* Invalid */}
                    {status === 'invalid' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <AlertCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
                            <p className="text-dark-400 mb-6">{error}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-dark-700 hover:bg-dark-600 rounded-xl text-white font-medium transition-colors"
                            >
                                Go to Chats
                            </button>
                        </>
                    )}

                    {/* Valid - Ready to join */}
                    {status === 'valid' && (
                        <>
                            <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center mb-6">
                                <MessageCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Join Chat</h2>
                            <p className="text-dark-400 mb-6">
                                You've been invited to start a conversation
                            </p>

                            {/* User preview */}
                            <div className="p-4 bg-dark-800/50 rounded-xl mb-6">
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center mb-3">
                                    {linkOwner?.profilePicture ? (
                                        <img
                                            src={linkOwner.profilePicture}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <MessageCircle className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <p className="text-dark-300 text-sm">Chat with this user</p>
                            </div>

                            <button
                                onClick={handleJoin}
                                className="w-full py-3.5 gradient-primary rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                            >
                                Join Chat
                            </button>
                        </>
                    )}

                    {/* Joining */}
                    {status === 'joining' && (
                        <>
                            <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center mb-6">
                                <Loader2 className="w-10 h-10 text-white animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Joining Chat</h2>
                            <p className="text-dark-400">Setting up your conversation...</p>
                        </>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
                            <p className="text-dark-400">Redirecting to your chat...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JoinChat;
