import { Menu, ArrowLeft, MessageCircle } from 'lucide-react';

const MobileNav = ({ isMenuOpen, onToggleMenu, showBackButton, onBack }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-b border-dark-200 dark:border-dark-700 md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    {showBackButton ? (
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                        </button>
                    ) : (
                        <button
                            onClick={onToggleMenu}
                            className="p-2 -ml-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                        >
                            <Menu className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-dark-900 dark:text-white">Novachats</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default MobileNav;
