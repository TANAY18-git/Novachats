import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Lock, Camera, Loader2,
    Eye, EyeOff, Check, X, LogOut, MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Settings = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { user, updateProfile, updatePassword, updateProfilePicture, logout, isLoading } = useAuthStore();

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
        if (!passwordChecks.length || !passwordChecks.match) {
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
        <div className="settings-page">
            {/* Header */}
            <header className="settings-header">
                <button className="icon-btn" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                </button>
                <h1>Settings</h1>
            </header>

            <main className="settings-content">
                {/* Profile Picture */}
                <div className="profile-section">
                    <div className="profile-avatar-wrapper">
                        <div className="profile-avatar">
                            {user?.profilePicture ? (
                                <img src={getProfilePictureUrl()} alt={user.name} />
                            ) : (
                                <MessageCircle size={36} color="#64748b" />
                            )}
                        </div>
                        <button
                            className="avatar-upload-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingPicture}
                        >
                            {uploadingPicture ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePictureChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h2>{user?.name}</h2>
                    <p>@{user?.username}</p>
                </div>

                {/* Tabs */}
                <div className="settings-tabs">
                    <button
                        className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={16} />
                        Profile
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <Lock size={16} />
                        Security
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="settings-section">
                        <form onSubmit={handleProfileUpdate} className="settings-card">
                            <h3>Profile Information</h3>

                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="settings-input"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    value={profileData.username}
                                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    className="settings-input"
                                />
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
                            </button>
                        </form>

                        {/* Logout */}
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordUpdate} className="settings-card">
                        <h3>Change Password</h3>

                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="settings-input"
                                    style={{ paddingRight: '46px' }}
                                />
                                <button
                                    type="button"
                                    className="input-toggle-btn"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="settings-input"
                                    style={{ paddingRight: '46px' }}
                                />
                                <button
                                    type="button"
                                    className="input-toggle-btn"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="settings-input"
                                    style={{ paddingRight: '46px' }}
                                />
                                <button
                                    type="button"
                                    className="input-toggle-btn"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Password Requirements */}
                        <div className="password-requirements">
                            <div className={`password-check ${passwordChecks.length ? 'valid' : 'invalid'}`}>
                                {passwordChecks.length ? <Check size={14} /> : <X size={14} />}
                                At least 6 characters
                            </div>
                            <div className={`password-check ${passwordChecks.match ? 'valid' : 'invalid'}`}>
                                {passwordChecks.match ? <Check size={14} /> : <X size={14} />}
                                Passwords match
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default Settings;
