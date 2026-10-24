import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { LogIn, Key, Mail, ShieldAlert, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.login({ email, password });
      if (res.success) {
        login(res.token, res.user);
        if (res.user.role === 'organizer') {
          navigate('/organizer/dashboard');
        } else if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/participant/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role: 'participant' | 'organizer' | 'admin') => {
    if (role === 'participant') {
      setEmail('participant@eventsphere.io');
      setPassword('Password123!');
    } else if (role === 'organizer') {
      setEmail('organizer@eventsphere.io');
      setPassword('Password123!');
    } else {
      setEmail('admin@eventsphere.io');
      setPassword('Password123!');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      {/* Brand Heading */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to EventSphere
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to access your digital tickets, attendance history, and rewards
        </p>
      </div>

      {/* Quick Demo Credentials Panel */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2.5">
        <div className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          One-Click Demo Credentials
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => fillDemoCredentials('participant')}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors shadow-2xs"
          >
            Participant
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials('organizer')}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors shadow-2xs"
          >
            Organizer
          </button>
          <button
            type="button"
            onClick={() => fillDemoCredentials('admin')}
            className="px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition-colors shadow-2xs"
          >
            Admin
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
