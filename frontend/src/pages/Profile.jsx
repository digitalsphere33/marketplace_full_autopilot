import React, { useEffect, useState } from 'react';

export default function Profile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [active, setActive] = useState('orders'); // 'orders' | 'returns'
  const [orders, setOrders] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [newReturnOrderId, setNewReturnOrderId] = useState('');
  const [newReturnReason, setNewReturnReason] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  async function login() {
    setError('');
    setMsg('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Login failed (${res.status})`);
      }
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      setToken(data.token);
      localStorage.setItem('jwt', data.token);
      
      // Decode JWT to get user role (basic base64 decode of payload)
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        const role = payload.role || 'buyer';
        localStorage.setItem('userRole', role);
      } catch (e) {
        localStorage.setItem('userRole', 'buyer');
      }
      
      setMsg('Logged in successfully! Refresh to see updated navigation.');
      // Trigger page reload to update parent state
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError(e.message);
    }
  }

  async function loadOrders() {
    setError('');
    try {
      const res = await fetch('/orders/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load orders');
    }
  }

  async function loadDisputes() {
    setError('');
    try {
      const res = await fetch('/disputes', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDisputes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Failed to load returns');
    }
  }

  async function createReturn() {
    setError('');
    setMsg('');
    if (!newReturnOrderId || !newReturnReason) {
      setError('Order ID and reason required');
      return;
    }
    try {
      const res = await fetch('/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_id: newReturnOrderId, reason: newReturnReason })
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed (${res.status})`);
      }
      setNewReturnOrderId('');
      setNewReturnReason('');
      setMsg('Return request submitted');
      await loadDisputes();
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (token) {
      // Auto-load current tab on token presence
      if (active === 'orders') loadOrders();
      if (active === 'returns') loadDisputes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, active]);

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-lg p-4">
        <div className="font-bold text-lg mb-2">Your Account</div>
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input className="w-full border rounded p-2" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input type="password" className="w-full border rounded p-2" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button onClick={login} className="bg-primary text-white px-3 py-2 rounded">Log in</button>
            <button onClick={() => { setToken(''); localStorage.removeItem('jwt'); }} className="border px-3 py-2 rounded">Log out</button>
          </div>
        </div>
        {token && <div className="mt-2 text-xs text-green-700">JWT loaded</div>}
        {error && <div className="mt-2 text-xs text-red-700">{error}</div>}
        {msg && <div className="mt-2 text-xs text-green-700">{msg}</div>}
      </div>

      <div className="flex gap-2">
        <button className={`px-3 py-1 rounded-full text-sm border ${active==='orders'?'bg-primary text-white border-primary':'bg-white'}`} onClick={()=>setActive('orders')}>Orders</button>
        <button className={`px-3 py-1 rounded-full text-sm border ${active==='returns'?'bg-primary text-white border-primary':'bg-white'}`} onClick={()=>setActive('returns')}>Returns & Disputes</button>
      </div>

      {active === 'orders' && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Your Orders</div>
          {!token ? (
            <div className="text-sm text-gray-600">Log in to view your orders.</div>
          ) : (
            <ul className="text-sm space-y-2">
              {orders.length === 0 ? <li className="text-gray-500">No orders yet.</li> : orders.map(o => (
                <li key={o.id} className="flex items-center justify-between border rounded p-2">
                  <span>{o.id}</span>
                  <span className="text-xs text-gray-600">{o.status || 'processing'}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {active === 'returns' && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <div className="font-semibold mb-2">Request a Return</div>
            {!token ? (
              <div className="text-sm text-gray-600">Log in to request returns.</div>
            ) : (
              <div className="grid sm:grid-cols-3 gap-3 items-end">
                <input className="border rounded p-2" placeholder="Order ID" value={newReturnOrderId} onChange={e=>setNewReturnOrderId(e.target.value)} />
                <input className="border rounded p-2" placeholder="Reason" value={newReturnReason} onChange={e=>setNewReturnReason(e.target.value)} />
                <button onClick={createReturn} className="bg-primary text-white px-3 py-2 rounded">Submit</button>
              </div>
            )}
          </div>

          <div className="bg-white border rounded-lg p-4">
            <div className="font-semibold mb-2">Your Returns & Disputes</div>
            {!token ? (
              <div className="text-sm text-gray-600">Log in to view your returns.</div>
            ) : (
              <ul className="text-sm space-y-2">
                {disputes.length === 0 ? <li className="text-gray-500">No returns or disputes.</li> : disputes.map(d => (
                  <li key={d.id} className="flex items-center justify-between border rounded p-2">
                    <span>{d.reason || 'Return'} • {d.order_id}</span>
                    <span className="text-xs text-gray-600">{d.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
