import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'

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
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Log in to access your account and orders'
              : 'Sign up to start shopping or selling'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {mode === 'register' && (
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 h-11"
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="text-center text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Sign up here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Log in here
              </button>
            </>
          )}
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
          <div className="font-semibold">✅ Secure Login</div>
          <ul className="text-xs space-y-1">
            <li>• Encrypted password storage</li>
            <li>• JWT token authentication</li>
            <li>• Fast & secure checkout</li>
          </ul>
        </div>

        {/* Demo credentials */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-900">
            <div className="font-semibold mb-1">Demo Credentials (Development Only)</div>
            <div className="text-xs space-y-1">
              <div>📧 Admin: <code className="bg-yellow-100 px-1">admin@mzansimart.co.za</code></div>
              <div>🔑 Password: <code className="bg-yellow-100 px-1">Admin@123</code></div>
              <div className="mt-2 text-yellow-800">Or create a new account to get started</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
