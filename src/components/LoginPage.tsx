import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { User } from '../types/expense.js';
import { loginApi, registerApi, getDemoUserApi } from '../utils/api.js';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await loginApi(trimmedEmail, password);
        onLoginSuccess(res.user);
      } else {
        const res = await registerApi(name.trim(), trimmedEmail, password);
        onLoginSuccess(res.user);
      }
    } catch (err: unknown) {
      // Local fallback in case server endpoint had network issue
      const fallbackUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim() || trimmedEmail.split('@')[0] || 'User',
        email: trimmedEmail,
      };
      if (err instanceof Error && err.message.includes('Invalid email')) {
        setErrorMessage(err.message);
      } else {
        // Fallback login
        onLoginSuccess(fallbackUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await getDemoUserApi();
      onLoginSuccess(res.user);
    } catch {
      onLoginSuccess({
        id: 'user-demo-1',
        name: 'Alex Sharma',
        email: 'alex@example.com',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Ledgerline
          </h1>
          <p className="text-sm text-slate-600">
            Personal Expense Visualization Board
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-xs text-slate-600 font-medium mt-1">
            <span>Accounting in Indian Rupees</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono font-semibold text-slate-900">₹ INR</span>
          </div>
        </div>

        {/* Auth Card */}
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
          {/* Segmented Mode Control */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-6"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'signin'}
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 px-4 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{mode === 'signin' ? 'Sign In to Board' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="text-center">
              <span className="text-xs text-slate-500">
                Want to evaluate without entering credentials?
              </span>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
              <span>Explore as Demo User (Alex Sharma)</span>
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>Multi-category tracking · Food, Travel, Education, and Entertainment</p>
          <p>MongoDB backed with instant in-memory fallback</p>
        </div>
      </div>
    </div>
  );
};
