import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Lock, Camera, Moon, Sun, Loader2,
    Eye, EyeOff, Check, X, LogOut, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Settings = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { user, updateProfile, updatePassword, updateProfilePicture, logout, isLoading } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    const [activeTab, setActiveTab] = useState('profile');
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        username: user?.username || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [uploadingPicture, setUploadingPicture] = useState(false);

    const passwordChecks = {
        length: passwordData.newPassword.length >= 6,
        uppercase: /[A-Z]/.test(passwordData.newPassword),
        lowercase: /[a-z]/.test(passwordData.newPassword),
        number: /\d/.test(passwordData.newPassword),
        match: passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword.length > 0
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (!profileData.name.trim()) {
            toast.error('Name is required');
            return;
        }

        const result = await updateProfile(profileData);
        if (result.success) {
            toast.success('Profile updated successfully');
        } else {
            toast.error(result.message);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword) {
            toast.error('Current password is required');
            return;
        }

        if (!Object.values(passwordChecks).every(Boolean)) {
            toast.error('Please meet all password requirements');
            return;
        }

        const result = await updatePassword(passwordData.currentPassword, passwordData.newPassword);
        if (result.success) {
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            toast.error(result.message);
        }
    };

    const handlePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setUploadingPicture(true);
        const result = await updateProfilePicture(file);
        setUploadingPicture(false);

        if (result.success) {
            toast.success('Profile picture updated');
        } else {
            toast.error(result.message);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
        toast.success('Logged out successfully');
    };

    const getProfilePictureUrl = () => {
        if (!user?.profilePicture) return null;
        if (user.profilePicture.startsWith('http')) return user.profilePicture;
        return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.profilePicture}`;
    };

    return (
        <div className="min-h-screen bg-dark-100 dark:bg-dark-900">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-dark-800/80 backdrop-blur-lg border-b border-dark-200 dark:border-dark-700">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-dark-600 dark:text-dark-300" />
                    </button>
                    <h1 className="text-xl font-bold text-dark-900 dark:text-white">Settings</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6">
                {/* Profile Picture */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 p-1">
                            <div className="w-full h-full rounded-full bg-dark-100 dark:bg-dark-800 flex items-center justify-center overflow-hidden">
                                {user?.profilePicture ? (
                                    <img
                                        src={getProfilePictureUrl()}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <MessageCircle className="w-10 h-10 text-dark-400" />
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPicture}
                            className="absolute bottom-0 right-0 p-2.5 gradient-primary rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {uploadingPicture ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <Camera className="w-5 h-5 text-white" />
                            )}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            className="hidden"
                        />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-dark-900 dark:text-white">{user?.name}</h2>
                    <p className="text-dark-500">@{user?.username}</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-dark-200 dark:bg-dark-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'profile'
                                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow'
                                : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                            }`}
                    >
                        <User className="w-4 h-4 inline-block mr-2" />
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'security'
                                ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-white shadow'
                                : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                            }`}
                    >
                        <Lock className="w-4 h-4 inline-block mr-2" />
                        Security
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <form onSubmit={handleProfileUpdate} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Profile Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-6 w-full py-3 gradient-primary rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </form>

                        {/* Theme Toggle */}
                        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Appearance</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {theme === 'dark' ? (
                                        <Moon className="w-5 h-5 text-primary-500" />
                                    ) : (
                                        <Sun className="w-5 h-5 text-amber-500" />
                                    )}
                                    <div>
                                        <p className="font-medium text-dark-900 dark:text-white">Dark Mode</p>
                                        <p className="text-sm text-dark-500">
                                            {theme === 'dark' ? 'Currently enabled' : 'Currently disabled'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`w-14 h-8 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-primary-500' : 'bg-dark-300'
                                        }`}
                                >
                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Change Password</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400"
                                    >
                                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400"
                                    >
                                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {passwordData.newPassword && (
                                    <div className="mt-2 space-y-1">
                                        <CheckItem checked={passwordChecks.length} text="At least 6 characters" />
                                        <CheckItem checked={passwordChecks.uppercase} text="One uppercase letter" />
                                        <CheckItem checked={passwordChecks.lowercase} text="One lowercase letter" />
                                        <CheckItem checked={passwordChecks.number} text="One number" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-2">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 bg-dark-50 dark:bg-dark-700 border border-dark-200 dark:border-dark-600 rounded-xl text-dark-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400"
                                    >
                                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {passwordData.confirmPassword && (
                                    <div className="mt-2">
                                        <CheckItem checked={passwordChecks.match} text="Passwords match" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mt-6 w-full py-3 gradient-primary rounded-xl text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                            ) : (
                                'Update Password'
                            )}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

const CheckItem = ({ checked, text }) => (
    <div className={`flex items-center gap-2 text-sm ${checked ? 'text-green-500' : 'text-dark-500'}`}>
        {checked ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
        <span>{text}</span>
    </div>
);

export default Settings;
