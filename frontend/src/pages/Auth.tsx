import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAccessibility } from '../context/AccessibilityContext';
import { ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';

export const Auth: React.FC<{ type: 'login' | 'register' }> = ({ type }) => {
  const { setAuth } = useStore();
  const { speak } = useAccessibility();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password || (type === 'register' && !name)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      speak('Please fill in all required fields.');
      return;
    }

    try {
      const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
      const payload = type === 'login' ? { email, password } : { name, email, password };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      setAuth(res.data.user, res.data.token);

      speak(`Successfully signed in. Welcome back to EcoWise ${res.data.user.name}.`);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Authentication credentials failed. Please try again.';
      setError(errMsg);
      speak(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="text-5xl block mb-4">🌿</span>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          {type === 'login' ? 'Sign in to EcoWise AI' : 'Create your EcoWise account'}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Your personal carbon footprint & sustainability assistant.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10 glass-card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm text-center font-semibold animate-bounce">
                ⚠️ {error}
              </div>
            )}

            {type === 'register' && (
              <div>
                <label htmlFor="name-input" className="block text-sm font-semibold text-slate-300">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email-input" className="block text-sm font-semibold text-slate-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="user@ecowise.ai"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary hover:bg-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200"
              >
                {loading ? 'Processing...' : type === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Quick Demo Logins Helper */}
          <div className="mt-6 border-t border-slate-800 pt-6">
            <p className="text-center text-xs font-semibold text-slate-400 mb-3">DEMO LOGIN CREDENTIALS</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('user@ecowise.ai');
                  setPassword('userpassword123');
                  speak('Filled standard demo user details.');
                }}
                className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700 text-[10px] py-1.5 px-2 rounded-lg text-slate-300 text-center truncate"
              >
                User (user@ecowise.ai)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@ecowise.ai');
                  setPassword('adminpassword123');
                  speak('Filled administrator demo credentials.');
                }}
                className="bg-slate-800/40 hover:bg-slate-800 border border-slate-700 text-[10px] py-1.5 px-2 rounded-lg text-slate-300 text-center truncate"
              >
                Admin (admin@ecowise.ai)
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <div className="text-sm">
              {type === 'login' ? (
                <span className="text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-primary hover:underline">
                    Sign up now
                  </Link>
                </span>
              ) : (
                <span className="text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-primary hover:underline">
                    Sign in instead
                  </Link>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
