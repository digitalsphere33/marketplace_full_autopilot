import React, { useState } from 'react';

export default function Orders() {
  const [token, setToken] = useState('');
  const [orders, setOrders] = useState([]);
  async function load() {
    const res = await fetch('/orders/me', { headers: { 'Authorization': `Bearer ${token}` } }).then(r=>r.json());
    setOrders(res);
  }
  return (
    <div className="space-y-3">
      <div className="font-semibold">Order Tracking</div>
      <input className="border p-2 w-full" placeholder="JWT token" value={token} onChange={e=>setToken(e.target.value)} />
      <button className="bg-primary text-white px-3 py-2 rounded" onClick={load}>Load Orders</button>
      <ul className="text-sm">{orders.map(o => <li key={o.id}>{o.id} – {o.status}</li>)}</ul>
    </div>
  );
}
