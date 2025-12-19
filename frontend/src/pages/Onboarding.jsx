import React, { useState } from 'react';

export default function Onboarding() {
  const [step, setStep] = useState(1); // Step 1: Account, Step 2: Verify, Step 3: Profile
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [storeName, setStoreName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRegister() {
    setError('');
    if (!email || !password || password !== passwordConfirm) {
      setError('Please fill all fields and ensure passwords match');
      return;
    }
    
    setLoading(true);
    try {
      const registerRes = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!registerRes.ok) {
        const errData = await registerRes.json().catch(() => ({}));
        throw new Error(errData.error || `Registration failed: ${registerRes.status}`);
      }
      
      const loginRes = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json().catch(() => ({}));
        throw new Error(errData.error || `Login failed: ${loginRes.status}`);
      }

      const res = await loginRes.json();
      
      if (!res.token) throw new Error('No token received from login');
      setToken(res.token);
      
      // Decode JWT to get user role
      try {
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        const role = payload.role || 'buyer';
        localStorage.setItem('userRole', role);
      } catch (e) {
        localStorage.setItem('userRole', 'buyer');
      }
      
      const sellerRes = await fetch('/sellers', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${res.token}`, 'Content-Type': 'application/json' },
      });

      if (!sellerRes.ok) {
        const errData = await sellerRes.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Seller creation failed: ${sellerRes.status}`);
      }
      
      const codeRes = await fetch('/auth/verify/request', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${res.token}` },
      });

      if (!codeRes.ok) {
        const errData = await codeRes.json().catch(() => ({}));
        throw new Error(errData.error || `Verification request failed: ${codeRes.status}`);
      }

      setMsg(`Verification code sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Account creation failed. Make sure the API is running.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    setError('');
    if (!verifyCode) {
      setError('Please enter the verification code');
      return;
    }
    
    setLoading(true);
    try {
      await fetch('/auth/verify/confirm', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verifyCode }),
      });
      
      setMsg('Email verified! Please complete your seller profile.');
      setStep(3);
    } catch (err) {
      setError('Verification failed. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCompleteProfile() {
    setError('');
    if (!storeName || !bankAccount || !bankHolder || !idNumber) {
      setError('Please fill all profile fields');
      return;
    }
    
    setLoading(true);
    try {
      // Save seller profile
      await fetch('/sellers', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeName, bankAccount, bankHolder, idNumber }),
      });
      
      setMsg('Welcome! Your seller account is ready. You can now list products.');
      setStep(4);
    } catch (err) {
      setError('Profile update failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg p-6 border border-gray-200">
      {/* Step indicators */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {/* Step 1: Account Creation */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Your Seller Account</h2>
            <p className="text-sm text-gray-600 mt-1">Get started selling on MzansiMart in minutes</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="Re-enter password"
                value={passwordConfirm}
                onChange={e => setPasswordConfirm(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
          {msg && <div className="text-sm text-green-600 bg-green-50 p-2 rounded">{msg}</div>}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>
      )}

      {/* Step 2: Email Verification */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verify Your Email</h2>
            <p className="text-sm text-gray-600 mt-1">We sent a code to {email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            Check your email for a verification code (or spam folder)
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Verification Code</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
              placeholder="Enter 6-digit code"
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value)}
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            onClick={() => setStep(1)}
            className="w-full text-primary py-2 text-sm hover:underline"
          >
            Back to Account
          </button>
        </div>
      )}

      {/* Step 3: Store Profile */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Store Profile</h2>
            <p className="text-sm text-gray-600 mt-1">Add banking and store details</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-700">Store Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="e.g., TechHub SA"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">ID/Passport Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="Your ID number"
                value={idNumber}
                onChange={e => setIdNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Bank Account Number</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="Account number (for payouts)"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">Account Holder Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                placeholder="Name on bank account"
                value={bankHolder}
                onChange={e => setBankHolder(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <button
            onClick={handleCompleteProfile}
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving profile...' : 'Complete Profile'}
          </button>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="space-y-4 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to MzansiMart!</h2>
          <p className="text-sm text-gray-600">Your seller account is ready. Start listing products to reach thousands of buyers.</p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            {msg}
          </div>

          <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Go to Seller Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
