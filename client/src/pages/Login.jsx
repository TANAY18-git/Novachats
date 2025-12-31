import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Eye, EyeOff, User, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username.trim() || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        const result = await login(formData.username, formData.password);

        if (result.success) {
            toast.success('Welcome back!');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="avatar-lg mx-auto mb-4">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Welcome to Novachats</h1>
                    <p className="text-dark-400 mt-2">Sign in to continue</p>
                </div>

                {/* Form Card */}
                <div className="glass-card">
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="mb-5">
                            <label className="form-label">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="mb-6">
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    className="form-input"
                                    style={{ paddingRight: '44px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-dark-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="link">
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-dark-500 text-sm mt-6">
                    Secure, private, real-time messaging
                </p>
            </div>
        </div>
    );
};

export default Login;
