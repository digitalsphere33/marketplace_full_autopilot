import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('jwt') || '');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  
  // Add product form
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Electronics');
  const [newDescription, setNewDescription] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [images, setImages] = useState([]); // File objects
  const [uploading, setUploading] = useState(false);
  
  const categories = ['Electronics', 'Home & Living', 'Fashion', 'Health & Beauty', 'Baby & Kids', 'Sports & Outdoors', 'Office & School'];

  async function loadData() {
    if (!token) {
      setError('Please log in to access admin panel');
      return;
    }
    
    setLoading(true);
    setError('');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    try {
      const [statsRes, ordersRes, flaggedRes, listingsRes] = await Promise.all([
        fetch('/admin/stats', { headers }),
        fetch('/admin/orders', { headers }),
        fetch('/admin/flagged', { headers }),
        fetch('/admin/listings', { headers })
      ]);
      
      if (!statsRes.ok) throw new Error('Unauthorized - Admin access required');
      
      setStats(await statsRes.json());
      setOrders(await ordersRes.json());
      setFlagged(await flaggedRes.json());
      setListings(await listingsRes.json());
      setMsg('Data loaded successfully');
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    setError('');
    setMsg('');
    try {
      const res = await fetch(`/admin/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete product');
      
      setMsg('Product deleted successfully');
      setListings(listings.filter(l => l.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function addProduct() {
    if (!newTitle || !newPrice) {
      setError('Title and price are required');
      return;
    }
    
    setError('');
    setMsg('');
    try {
      // 1) Upload images to Supabase Storage (bucket: product-images)
      setUploading(true);
      const urls = [];
      for (let i = 0; i < Math.min(images.length, 5); i++) {
        const file = images[i];
        const path = `products/${Date.now()}_${i}_${file.name}`;
        const { error: upErr } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
        if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
        const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(pub.publicUrl);
      }
      setUploading(false);

      // 2) Create product via API
      const res = await fetch('/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          price: parseFloat(newPrice),
          stock: Number(newStock || 0),
          category: newCategory,
          images: urls
        })
      });

      if (!res.ok) throw new Error('Failed to add product');

      setMsg('Product added successfully!');
      setNewTitle('');
      setNewPrice('');
      setNewCategory('Electronics');
      setNewDescription('');
      setNewStock(0);
      setImages([]);
      loadData();
    } catch (err) {
      setError(err.message);
      setUploading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-300 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage products, orders, and platform moderation</p>
          </div>
          {!token && (
            <div className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
              ⚠️ Please log in with admin account
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-300 pb-2">
        {['dashboard', 'products', 'add-product', 'orders', 'moderation'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          ❌ {error}
        </div>
      )}
      {msg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {msg}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <button
            onClick={loadData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 h-11"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          
          {stats && (
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600">{stats.users}</div>
                <div className="text-sm text-gray-600 mt-2">Total Users</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-green-600">{stats.sellers}</div>
                <div className="text-sm text-gray-600 mt-2">Active Sellers</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-600">{stats.listings}</div>
                <div className="text-sm text-gray-600 mt-2">Total Products</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-orange-600">{stats.orders}</div>
                <div className="text-sm text-gray-600 mt-2">Orders Placed</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Products ({listings.length})</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading products...</div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products yet</div>
          ) : (
            <div className="space-y-3">
              {listings.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{product.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      R {Number(product.price || 0).toFixed(2)} • {product.category || 'Uncategorized'} • Status: {product.status}
                    </div>
                    {product.seller_email && (
                      <div className="text-xs text-gray-500 mt-1">Seller: {product.seller_email}</div>
                    )}
                  </div>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add-product' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="e.g., Samsung Galaxy S24"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                rows={3}
                placeholder="Short description of the product"
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (ZAR)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="e.g., 1299.99"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="e.g., 10"
                value={newStock}
                onChange={e => setNewStock(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Images (up to 5)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => setImages(Array.from(e.target.files || []).slice(0,5))}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
              {images?.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">{images.length} image(s) selected</div>
              )}
            </div>
            
            <button
              onClick={addProduct}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all h-11 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Add Product'}
            </button>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders ({orders.length})</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders yet</div>
          ) : (
            <div className="space-y-2">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="text-sm">
                    <span className="font-mono text-xs text-gray-600">{order.id.slice(0, 8)}...</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">R {Number(order.total || 0).toFixed(2)}</div>
                  <div className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">{order.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Moderation Tab */}
      {activeTab === 'moderation' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Flagged Items ({flagged.length})</h2>
          {flagged.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No flagged items</div>
          ) : (
            <div className="space-y-2">
              {flagged.map(item => (
                <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div className="font-semibold text-gray-900">{item.listing_title}</div>
                  <div className="text-sm text-red-700 mt-1">Reason: {item.reason}</div>
                  <div className="text-xs text-gray-600 mt-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
