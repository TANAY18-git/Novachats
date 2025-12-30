import { MessageCircle } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-950 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <div className="w-20 h-20 mx-auto gradient-primary rounded-2xl flex items-center justify-center animate-pulse-slow shadow-glow">
                        <MessageCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 mx-auto rounded-2xl gradient-primary opacity-30 animate-ping" />
                </div>
                <h1 className="mt-6 text-2xl font-bold text-gradient">Novachats</h1>
                <p className="mt-2 text-dark-500 dark:text-dark-400">Loading...</p>
            </div>
        </div>
    );
};

export default LoadingScreen;
