import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Apple, Chrome, Hexagon, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await login(email, password);
        if (result.success) {
          // Check user role and navigate accordingly
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        // Register
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const result = await register(name, email, password, role === 'admin' ? 'admin' : 'investor');
        if (result.success) {
          // Check user role and navigate accordingly
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setError(result.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-bgDark font-sans">
      {/* Background Gradients */}
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

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

        {/* Name Field (only for registration) */}
        {!isLogin && (
          <div className="space-y-1 mb-4">
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
                    className="w-full bg-surfaceLight border border-borderBase rounded-xl py-3.5 pl-12 pr-4 text-textPrimary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-textSecondary/50"
                    required
                />
            </div>
        </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleAuth} className="space-y-4 mb-6">
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
                        className="w-full bg-surfaceLight border border-borderBase rounded-xl py-3.5 pl-12 pr-4 text-textPrimary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-textSecondary/50"
                        required
                        disabled={loading}
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
                        className="w-full bg-surfaceLight border border-borderBase rounded-xl py-3.5 pl-12 pr-4 text-textPrimary focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-textSecondary/50"
                        required
                        disabled={loading}
                        minLength={6}
                    />
                </div>
            </div>

            {isLogin && (
                <div className="text-right">
                    <button type="button" className="text-xs text-primary hover:underline font-medium">
                        Forgot Password?
                    </button>
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
        </form>

        <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-borderBase"></div>
            <span className="flex-shrink-0 mx-4 text-textSecondary text-xs">Or continue with</span>
            <div className="flex-grow border-t border-borderBase"></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
            <button type="button" className="h-12 bg-surfaceLight border border-borderBase rounded-xl flex items-center justify-center hover:bg-surfaceLighter transition-colors">
                <Hexagon size={20} className="text-textPrimary fill-current" />
            </button>
            <button type="button" className="h-12 bg-surfaceLight border border-borderBase rounded-xl flex items-center justify-center hover:bg-surfaceLighter transition-colors">
                <Chrome size={20} className="text-textPrimary" />
            </button>
            <button type="button" className="h-12 bg-surfaceLight border border-borderBase rounded-xl flex items-center justify-center hover:bg-surfaceLighter transition-colors">
                <Apple size={20} className="text-textPrimary" />
            </button>
        </div>

        <div className="mt-8 text-center">
            <p className="text-textSecondary text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-primary font-medium hover:underline ml-1"
                >
                    {isLogin ? 'Sign Up' : 'Log In'}
                </button>
            </p>
        </div>
      </div>
      
      {/* Home Bar Indicator (Visual only) */}
      <div className="w-32 h-1 bg-white/10 rounded-full mx-auto absolute bottom-4 left-1/2 transform -translate-x-1/2"></div>
    </div>
  );
};
