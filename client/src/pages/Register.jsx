import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff, User, Lock, UserPlus, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const { register, isLoading } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const passwordChecks = {
        length: formData.password.length >= 6,
        match: formData.password === formData.confirmPassword && formData.confirmPassword !== ''
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const result = await register(formData.name, formData.username, formData.password);

        if (result.success) {
            toast.success('Account created!');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <MessageCircle size={28} color="white" />
                    </div>
                    <h1>Create Account</h1>
                    <p>Join Novachats today</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <UserPlus className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <User className="input-icon" />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="form-input"
                                style={{ paddingRight: '46px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div style={{ marginBottom: '20px', padding: '14px', background: '#0f172a', borderRadius: '10px' }}>
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
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
