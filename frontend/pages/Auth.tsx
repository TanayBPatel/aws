
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apple, Chrome, Hexagon, Mail, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        let response;
        if (isLogin) {
            response = await api.login({ email, password });
        } else {
            response = await api.register({ name, email, password, role: role === 'user' ? 'investor' : 'admin' });
        }

        if (response && response.success) {
            // Save user session
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('role', response.role);
            localStorage.setItem('userName', response.name || name);
            
            if (response.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } else {
            setError(response?.message || 'Authentication failed. Please check backend connection.');
        }
    } catch (err) {
        setError('Something went wrong.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-bgDark font-sans">
      <div className="absolute top-[-20%] left-1/2 transform -translate-x-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 bg-cardDark/50 backdrop-blur-xl border border-borderBase p-8 rounded-[32px] shadow-2xl">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-textPrimary mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-textSecondary text-sm">
                {isLogin ? 'Enter your credentials to access your account' : 'Enter your details to create a new account'}
            </p>
        </div>

        {/* Role Selection */}
        <div className="bg-surfaceLight p-1 rounded-xl flex mb-6">
            <button
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    role === 'user' 
                    ? 'bg-cardDark text-textPrimary shadow-sm' 
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
            >
                <User size={16} />
                User
            </button>
            <button
                onClick={() => setRole('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    role === 'admin' 
                    ? 'bg-cardDark text-textPrimary shadow-sm' 
                    : 'text-textSecondary hover:text-textPrimary'
                }`}
            >
                <ShieldCheck size={16} />
                Admin
            </button>
        </div>

        {error && (
            <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2 text-error text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4 mb-6">
            {!isLogin && (
                 <div className="space-y-1">
                    <label className="text-xs font-medium text-textSecondary uppercase ml-1">Full Name</label>
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary">
                            <User size={20} />
                        </div>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full bg-surfaceLight border border-borderBase rounded-xl py-3.5 pl-12 pr-4 text-textPrimary focus:outline-none focus:border-primary/50 transition-all"
                            required
                        />
                    </div>
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-medium text-textSecondary uppercase ml-1">Email Address</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary">
                        <Mail size={20} />
                    </div>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hello@example.com"
                        className="w-full bg-surfaceLight border border-borderBase rounded-xl py-3.5 pl-12 pr-4 text-textPrimary focus:outline-none focus:border-primary/50 transition-all"
                        required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-textSecondary uppercase ml-1">Password</label>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary">
                        <Lock size={20} />
                    </div>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-surfaceLight border border-borderBase rounded-xl py-3.5 pl-12 pr-4 text-textPrimary focus:outline-none focus:border-primary/50 transition-all"
                        required
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 mt-2 flex items-center justify-center"
            >
                {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
        </form>

        <div className="mt-8 text-center">
            <p className="text-textSecondary text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                    className="text-primary font-medium hover:underline ml-1"
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};
