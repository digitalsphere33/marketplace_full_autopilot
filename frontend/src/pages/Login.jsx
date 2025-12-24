import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient.js';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initialMode = typeof window !== 'undefined' ? (sessionStorage.getItem('loginMode') || 'login') : 'login';
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = {};
      try {
        const text = await res.text();
        if (text) {
          data = JSON.parse(text);
        }
      } catch (parseErr) {
        console.error('Failed to parse response:', parseErr);
        data = { error: 'Invalid server response' };
      }

      if (!res.ok) {
        throw new Error(data.error || `${mode} failed (${res.status})`);
      }

      const token = data.token || data.jwt;

      if (!token) throw new Error('No token received');

      // Store JWT
      localStorage.setItem('jwt', token);

      // Decode JWT to get role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || 'buyer';
        localStorage.setItem('userRole', role);
      } catch (e) {
        console.error('Failed to decode JWT:', e);
        localStorage.setItem('userRole', 'buyer');
      }

      setError('');
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      setError(err.message || `${mode} failed`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Top navigation bar with logo */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.location.href = '/'} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🛒</span>
            <span className="text-xl font-bold text-gray-900">MzansiMart</span>
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-sm text-gray-600 hover:text-blue-600 font-medium"
          >
            ← Continue shopping
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center p-4 pt-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left side - Branding & Benefits */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🛒</div>
              <h1 className="text-4xl font-bold text-gray-900">MzansiMart</h1>
            </div>
            <p className="text-xl text-gray-600">South Africa's Trusted Multi-Vendor Marketplace</p>
          </div>

          <div className="space-y-4 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Why join MzansiMart?</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🛍️</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Shop with Confidence</div>
                  <div className="text-sm text-gray-600">Verified sellers, secure payments, buyer protection</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🚚</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Fast & Reliable Delivery</div>
                  <div className="text-sm text-gray-600">Track orders, quick dispatch, hassle-free returns</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💎</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Best Deals Daily</div>
                  <div className="text-sm text-gray-600">Personalized recommendations, exclusive offers</div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏪</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Become a Seller</div>
                  <div className="text-sm text-gray-600">Reach thousands of buyers, easy setup</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✓</span>
              <span>Verified sellers</span>
            </div>
            <div className="flex items-center gap-1">
              <span>↩️</span>
              <span>Easy returns</span>
            </div>
          </div>
        </motion.div>

        {/* Right side - Login/Register Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 lg:p-12 space-y-6">
            
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">🛒</span>
                <h1 className="text-2xl font-bold text-gray-900">MzansiMart</h1>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login' 
                  ? 'Log in to access your account and orders'
                  : 'Sign up to start shopping on MzansiMart'}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
              >
                <span>❌</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-base"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-300 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                {mode === 'register' && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <span>ℹ️</span>
                    <span>Password must be at least 6 characters</span>
                  </p>
                )}
              </div>

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    <span>Processing...</span>
                  </span>
                ) : (
                  mode === 'login' ? 'Log In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* OAuth - Google via Supabase */}
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.origin + '/oauth/callback' }
                  });
                  if (error) throw error;
                  // The callback page will handle the session
                } catch (e) {
                  setError(e.message || 'Google sign-in failed');
                }
              }}
              className="w-full border border-gray-300 bg-white text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>🔐</span> Continue with Google
            </button>

            {/* Toggle mode */}
            <div className="text-center">
              {mode === 'login' ? (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                      type="button"
                      onClick={() => { setMode('register'); setError(''); sessionStorage.setItem('loginMode','register'); }}
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); sessionStorage.setItem('loginMode','login'); }}
                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline"
                  >
                    Log in here
                  </button>
                </p>
              )}
            </div>

            {/* Trust badges */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>256-bit SSL</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🇿🇦</span>
                  <span>Proudly SA</span>
                </div>
              </div>
            </div>

            {/* Dev mode credentials (remove in production) */}
            {mode === 'login' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
                <div className="font-semibold text-yellow-800 mb-1">🧪 Development Mode</div>
                <div className="text-yellow-700">
                  <div>Admin: digitalsphere33@gmail.com / Admin@123</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
