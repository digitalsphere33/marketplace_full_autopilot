import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Login from './Login.jsx';
import Onboarding from './Onboarding.jsx';
import Checkout from './Checkout.jsx';
import Admin from './Admin.jsx';
import Orders from './Orders.jsx';
import Profile from './Profile.jsx';
import ProductDetail from './ProductDetail.jsx';
import { supabase } from '../supabaseClient.js';

// Tabs are now computed dynamically based on user role - see getVisibleTabs() below
const categories = [
  'All Deals',
  'Electronics',
  'Home & Living',
  'Fashion',
  'Health & Beauty',
  'Baby & Kids',
  'Sports & Outdoors',
  'Office & School',
];

const mockProducts = [
  { id: 'm1', title: 'Noise Cancelling Headphones', price: 1299, category: 'Electronics', oldPrice: 1699, discount: 23, rating: 4.8, reviews: 243 },
  { id: 'm2', title: 'Smartwatch with Heart Monitor', price: 899, category: 'Electronics', oldPrice: 1199, discount: 25, rating: 4.6, reviews: 156 },
  { id: 'm3', title: 'Air Fryer 5L Family Size', price: 1499, category: 'Home & Living', oldPrice: 2199, discount: 32, rating: 4.9, reviews: 512 },
  { id: 'm4', title: 'Laptop Backpack Waterproof', price: 499, category: 'Office & School', oldPrice: 699, discount: 29, rating: 4.7, reviews: 89 },
  { id: 'm5', title: '4K Smart TV 55"', price: 7499, category: 'Electronics', oldPrice: 9999, discount: 25, rating: 4.8, reviews: 342, stock: 5 },
  { id: 'm6', title: 'Trail Running Shoes', price: 999, category: 'Sports & Outdoors', oldPrice: 1399, discount: 29, rating: 4.9, reviews: 201 },
  { id: 'm7', title: 'Wireless Charging Pad', price: 299, category: 'Electronics', oldPrice: 399, discount: 25, rating: 4.8, reviews: 412 },
  { id: 'm8', title: 'Coffee Table Set', price: 1799, category: 'Home & Living', oldPrice: 2499, discount: 28, rating: 4.7, reviews: 78 },
];

function PillButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm border ${active ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  );
}

function ProductCard({ item, onAddToCart, onOpen }) {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = item.image_url || item.imageUrl;

  const handleAddToCart = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    onAddToCart({ ...item, quantity });
    setQuantity(1);
  };

  const savings = item.oldPrice ? item.oldPrice - item.price : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpen && onOpen(item.id)}
      role="button"
      tabIndex={0}
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col transition-all duration-300 ${
        isHovered ? 'shadow-lg scale-[1.02]' : 'shadow-sm'
      }`}
    >
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title || 'Product image'}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className={`h-full flex items-center justify-center text-gray-400 text-sm transition-transform duration-300 ${
            isHovered ? 'scale-105' : ''
          }`}>
            📦 Image
          </div>
        )}
        {item.discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold shadow-md">
            {item.discount}% OFF
          </div>
        )}
        {item.stock && item.stock < 10 && (
          <div className="absolute bottom-2 left-2 bg-orange-600 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            Only {item.stock} left
          </div>
        )}
      </div>
      <div className="p-4 space-y-2 flex-1">
        <div className="text-sm font-medium text-gray-900 leading-5 line-clamp-2 h-10">{item.title || 'Untitled item'}</div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-bold text-blue-600">R {Number(item.price || 0).toFixed(2)}</div>
            {item.oldPrice && (
              <div className="text-sm text-gray-500 line-through">R {item.oldPrice.toFixed(2)}</div>
            )}
          </div>
          {savings > 0 && (
            <div className="text-xs text-green-600 font-semibold">
              Save R{savings.toFixed(2)} ({item.discount}%)
            </div>
          )}
        </div>
        {item.rating && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-600">⭐</span>
            <span className="font-medium text-gray-700">{item.rating}</span>
            <span className="text-xs text-gray-500">({item.reviews || 0})</span>
          </div>
        )}
        <div className="text-xs text-green-700 font-medium flex items-center gap-1">
          <span>✓</span> Fast dispatch • Secure
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <div className="flex-1 flex items-center gap-1 bg-gray-100 rounded-md h-11">
          <button
            onClick={(e) => { e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
            className="px-3 h-full hover:bg-gray-200 rounded-l-md text-sm font-semibold transition-colors"
          >
            −
          </button>
          <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setQuantity(quantity + 1); }}
            className="px-3 h-full hover:bg-gray-200 rounded-r-md text-sm font-semibold transition-colors"
          >
            +
          </button>
        </div>
        <button
          onClick={(e) => handleAddToCart(e)}
          className="flex-1 bg-blue-600 text-white text-sm font-semibold h-11 rounded-md hover:bg-blue-700 active:scale-95 transition-all duration-200"
        >
          Add to Cart
        </button>
        <button onClick={(e) => e.stopPropagation()} className="w-11 h-11 text-lg border border-gray-300 rounded-md hover:bg-gray-50 hover:border-red-300 hover:text-red-500 transition-all">
          ♡
        </button>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [tab, setTab] = useState('listings');
  const [selectedCategory, setSelectedCategory] = useState('All Deals');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'buyer');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('jwt'));
  const [accountOpen, setAccountOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const productsRef = React.useRef(null);
  const accountRef = React.useRef(null);
  const guestRef = React.useRef(null);

  const scrollToProducts = () => {
    setTab('listings');
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleDocumentMouseDown(e) {
      if (accountOpen && accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
      if (guestMenuOpen && guestRef.current && !guestRef.current.contains(e.target)) {
        setGuestMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [accountOpen, guestMenuOpen]);

  // Compute visible tabs based on user role
  const getVisibleTabs = () => {
    const baseTabs = ['listings', 'checkout'];
    
    if (isLoggedIn) {
      baseTabs.push('profile');
      baseTabs.push('orders');
      
      // Only show admin tab for admin role
      if (userRole === 'admin') {
        baseTabs.push('admin');
      }
    } else {
      // Do NOT add a separate 'login' tab. We use the top-right button
      // to open the dedicated full-screen login view to avoid duplicates.
    }
    
    return baseTabs;
  };

  const visibleTabs = getVisibleTabs();

  useEffect(() => {
    // Sync tab with URL on load and browser navigation
    function syncFromUrl() {
      const p = (window.location.pathname || '').split('/').filter(Boolean);
      if (p[0] === 'product' && p[1]) setTab('product');
      else if (p[0] === 'cart') setTab('cart');
    }
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);

    // If no local JWT but Supabase session exists, exchange it for app JWT
    (async () => {

      try {
        if (!localStorage.getItem('jwt')) {
          const { data } = await supabase.auth.getSession();
          const accessToken = data?.session?.access_token;
          if (accessToken) {
            const res = await fetch('/auth/supabase/exchange', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_token: accessToken })
            });
            if (res.ok) {
              const j = await res.json();
              if (j.token) {
                localStorage.setItem('jwt', j.token);
                if (j.role) localStorage.setItem('userRole', j.role);
                setIsLoggedIn(true);
                setUserRole(j.role || 'buyer');
              }
            }
          }
        }
      } catch {}
    })();

    fetch('/listings')
      .then(r => r.json())
      .then(data => setListings(Array.isArray(data) ? data : []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));

    return () => window.removeEventListener('popstate', syncFromUrl);


    // Load personalized recommendations
    const token = localStorage.getItem('jwt');
    if (token) {
      setLoadingRecs(true);
      fetch('/recommendations/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => setRecommendations(Array.isArray(data) ? data.slice(0, 6) : []))
        .catch(() => setRecommendations([]))
        .finally(() => setLoadingRecs(false));
    }
  }, []);

  const renderTab = () => {
    if (tab === 'listings') {
      let filtered = listings.length > 0 ? listings : mockProducts;
      
      // Apply category filter
      if (selectedCategory !== 'All Deals') {
        filtered = filtered.filter(l => l.category === selectedCategory);
      }
      
      // Apply search filter
      if (searchQuery.trim()) {
        filtered = filtered.filter(l =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      const filteredListings = filtered;
      
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : selectedCategory === 'All Deals' ? 'Popular picks' : `${selectedCategory}`}
            </div>
            <div className="text-xs text-gray-600">Commission auto-deducted · PayFast secure</div>
          </div>
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 bg-white border rounded-lg text-center text-gray-500">
              {searchQuery ? `No products match "${searchQuery}"` : `No items in ${selectedCategory}`}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredListings.map((l) => (
                 <ProductCard
                   key={l.id}
                   item={l}
                   onAddToCart={(item) => {
                     setCart([...cart, { ...item, cartId: Date.now() }]);
                   }}
                   onOpen={(id) => { setTab('product'); window.history.pushState({}, '', `/product/${id}`); }}
                 />
               ))}
            </div>
          )}
        </div>
      );
    }
    if (tab === 'onboarding') return <Onboarding />;
    if (tab === 'checkout') return <Checkout cart={cart} setCart={setCart} />;
    if (tab === 'orders') return <Orders />;
    if (tab === 'profile') return <Profile />;
    if (tab === 'admin') return <Admin />;
    if (tab === 'product') return <ProductDetail />;
    return null;
  };

  // If on login tab, show ONLY the login component (no marketplace UI)
  if (tab === 'login') {
    return (
      <Login onLoginSuccess={() => {
        setIsLoggedIn(true);
        const token = localStorage.getItem('jwt');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserRole(payload.role || 'buyer');
          } catch (e) {
            console.error('Failed to decode JWT:', e);
          }
        }
        setTab('listings');
      }} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          {/* Promo banner */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 py-2 px-3 text-center text-xs font-semibold text-red-700">
            🎉 Alot for Less - Fast shipping, secure payments, trusted sellers!
          </div>
          
          {/* Main header */}
          <div className="py-4 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-primary cursor-pointer hover:text-blue-700 transition-colors" onClick={() => setTab('listings')}>MzansiMart</div>
              <div className="flex-1">
                <div className="flex items-center bg-gray-50 rounded-full px-4 py-2.5 border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                  <span className="text-gray-400 mr-2">🔍</span>
                <input
                  className="bg-transparent flex-1 outline-none text-sm"
                  placeholder="Search for deals, brands, or sellers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setTab('listings')}
                />
                <button
                  onClick={() => setTab('listings')}
                  className="text-sm text-white bg-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-700 font-semibold transition-colors duration-200"
                >
                  Search
                </button>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-4 text-sm relative">
                <span className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">Help</span>
                <span className="text-gray-700 cursor-pointer hover:text-blue-600 transition-colors">Track</span>
                {isLoggedIn ? (
                  <div className="relative" ref={accountRef}>
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
                    >
                      👤 Account <span className="text-gray-400">▾</span>
                    </button>
                    {accountOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setTab('orders'); setAccountOpen(false); }}>📦 Orders</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setTab('profile'); setAccountOpen(false); }}>👤 Profile</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { sessionStorage.setItem('profileActiveTab','seller'); setTab('profile'); setAccountOpen(false); }}>🏪 Seller Center</button>
                        {userRole === 'admin' && (
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setTab('admin'); setAccountOpen(false); }}>🛠️ Admin</button>
                        )}
                        <div className="border-t my-1"></div>
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            localStorage.removeItem('jwt');
                            localStorage.removeItem('userRole');
                            setIsLoggedIn(false);
                            setUserRole('buyer');
                            setAccountOpen(false);
                            setTab('listings');
                          }}
                        >
                          🚪 Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative" ref={guestRef}>
                    <button
                      onClick={() => setGuestMenuOpen(!guestMenuOpen)}
                      className="text-blue-600 hover:text-blue-700 font-semibold transition-colors flex items-center gap-1"
                    >
                      Login / Sign Up <span className="text-gray-400">▾</span>
                    </button>
                    {guestMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-50">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { sessionStorage.setItem('loginMode','login'); setTab('login'); setGuestMenuOpen(false); }}>🔐 Sign in</button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { sessionStorage.setItem('loginMode','register'); setTab('login'); setGuestMenuOpen(false); }}>✨ Create account</button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setTab('checkout')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 font-semibold transition-colors duration-200 flex items-center gap-2"
                >
                  <span>🛒</span> Cart ({cart.length})
                </button>
              </div>
            </div>
            
            {/* Header tagline (tabs removed for cleaner UX) */}
            <div className="flex items-center justify-end">
              <div className="text-xs text-gray-500 hidden sm:block">Secure payments • Fast dispatch • Trusted sellers</div>
            </div>
            
            {/* Quick links */}
            <div className="flex gap-3 text-xs overflow-x-auto no-scrollbar pb-1">
              <span onClick={scrollToProducts} className="whitespace-nowrap bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">🎁 New Arrivals</span>
              <span onClick={scrollToProducts} className="whitespace-nowrap bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200">⭐ Top Deals</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-4 gap-6">
        {tab !== 'product' && (
        <aside className="bg-white border border-neutral-200 rounded-lg p-4 hidden lg:block h-fit">
          <div className="font-semibold text-neutral-800 mb-4 text-base">Shop by category</div>
          <div className="space-y-1 text-sm">
            {categories.map((c) => (
              <div
                key={c}
                onClick={() => { setSelectedCategory(c); setTab('listings'); }}
                className={`flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-md transition-all duration-200 ${
                  selectedCategory === c
                    ? 'bg-brand-100 text-brand-700 font-semibold'
                    : 'text-neutral-700 hover:text-brand-600 hover:bg-neutral-100'
                }`}
              >
                <span>{c}</span>
                <span className={selectedCategory === c ? 'text-brand-400' : 'text-neutral-300'}>›</span>
              </div>
            ))}
          </div>
        </aside>
        )}

        <section className="lg:col-span-3 space-y-8">
          {/* Hero banner */}
{tab === 'listings' && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 flex flex-col gap-4 text-white shadow-lg">
            <div className="text-xs font-semibold uppercase tracking-wide">🚀 South Africa's Multi-Vendor Marketplace</div>
            <div className="text-4xl font-bold leading-tight">Alot for Less, Trusted Sellers</div>
            <div className="text-base opacity-90 max-w-2xl">Discover great deals from verified sellers. Secure checkout, fast delivery, and hassle-free returns.</div>
            <div className="flex gap-3 flex-wrap pt-2">
              <button onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-blue-700 text-white border border-white px-6 py-3 rounded-lg hover:bg-blue-800 font-semibold active:scale-95 transition-all duration-200 flex items-center justify-center">Shop Now</button>
            </div>
          </div>
          )}


          {/* Just for you - Personalized recommendations */}
          {recommendations.length > 0 && tab === 'listings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900">✨ Just for you</div>
                <div className="text-xs text-gray-500">Based on your browsing</div>
              </div>
              {loadingRecs ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
{recommendations.map((rec) => (
                     <ProductCard
                       key={rec.id}
                       item={rec}
                       onAddToCart={(item) => {
                         setCart([...cart, { ...item, cartId: Date.now() }]);
                       }}
                       onOpen={(id) => { setTab('product'); window.history.pushState({}, '', `/product/${id}`); }}
                     />
                   ))}
                </div>
              )}
            </div>
          )}

          {/* Feature cards - Takealot style */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl">✅</div>
              <div><div className="font-semibold text-sm text-gray-900 mb-1">Secure Payments</div><div className="text-xs text-gray-600">Protected checkout process</div></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl">🛡️</div>
              <div><div className="font-semibold text-sm text-gray-900 mb-1">Verified Sellers</div><div className="text-xs text-gray-600">Quality assured listings</div></div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:shadow-md transition-shadow duration-200">
              <div className="text-2xl">⚡</div>
              <div><div className="font-semibold text-sm text-gray-900 mb-1">Fast Dispatch</div><div className="text-xs text-gray-600">Track orders real-time</div></div>
            </div>
          </div>

          {/* Trending section header */}
          <div className="flex items-center justify-between border-b border-gray-300 pb-3 mt-2">
            <div className="text-xl font-bold text-gray-900">📈 Trending in {selectedCategory}</div>
            <button
              onClick={() => productsRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
            >
              View More →
            </button>
          </div>

          <div ref={productsRef}>
            {renderTab()}
          </div>
          
          {/* More deals section - Similar to Takealot's featured brands */}
          <div className="border-t border-gray-300 pt-8 mt-8">
            <div className="text-xl font-bold text-gray-900 mb-6">🌟 Featured Sellers</div>
            <div className="grid sm:grid-cols-4 gap-4">
              {['TechHub SA', 'Home Essentials', 'Fashion Forward', 'Sports Zone'].map((seller, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className="text-4xl mb-3">🏪</div>
                  <div className="font-semibold text-sm text-gray-900 mb-1">{seller}</div>
                  <div className="flex items-center justify-center gap-1 text-xs text-yellow-600 mb-1">
                    <span>⭐</span> 4.9
                  </div>
                  <div className="text-xs text-gray-500">1.2k products</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid sm:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="font-bold mb-3">Shop</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="cursor-pointer hover:text-primary">New Arrivals</div>
                <div className="cursor-pointer hover:text-primary">Deals & Promotions</div>
                <div className="cursor-pointer hover:text-primary">Clearance</div>
                <div className="cursor-pointer hover:text-primary">Top Sellers</div>
              </div>
            </div>
            <div>
              <div className="font-bold mb-3">Sell</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="cursor-pointer hover:text-primary">Seller Dashboard</div>
                <div className="cursor-pointer hover:text-primary">Seller Policies</div>
                <div className="cursor-pointer hover:text-primary">Account Support</div>
              </div>
            </div>
            <div>
              <div className="font-bold mb-3">Help</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="cursor-pointer hover:text-primary">Help Centre</div>
                <div className="cursor-pointer hover:text-primary">Track Order</div>
                <div className="cursor-pointer hover:text-primary">Returns & Disputes</div>
                <div className="cursor-pointer hover:text-primary">Contact Us</div>
              </div>
            </div>
            <div>
              <div className="font-bold mb-3">About</div>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="cursor-pointer hover:text-primary">About MzansiMart</div>
                <div className="cursor-pointer hover:text-primary">Careers</div>
                <div className="cursor-pointer hover:text-primary">Privacy Policy</div>
                <div className="cursor-pointer hover:text-primary">Terms & Conditions</div>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="border-t pt-6 mb-6">
            <div className="text-xs font-bold text-gray-600 mb-3">SECURE PAYMENT METHODS</div>
            <div className="flex flex-wrap gap-3 items-center text-xs">
              <span className="bg-blue-50 px-2 py-1 rounded">💳 Visa</span>
              <span className="bg-orange-50 px-2 py-1 rounded">💳 Mastercard</span>
              <span className="bg-green-50 px-2 py-1 rounded">✓ PayFast</span>
              <span className="bg-purple-50 px-2 py-1 rounded">🏦 eBucks</span>
              <span className="bg-blue-50 px-2 py-1 rounded">💰 PayFlex</span>
            </div>
          </div>

          {/* Social & legal */}
          <div className="border-t pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-600">
            <div className="flex gap-4 mb-4 sm:mb-0">
              <span className="cursor-pointer hover:text-primary">📘 Facebook</span>
              <span className="cursor-pointer hover:text-primary">𝕏 Twitter</span>
              <span className="cursor-pointer hover:text-primary">📷 Instagram</span>
              <span className="cursor-pointer hover:text-primary">▶️ YouTube</span>
            </div>
            <div>© {new Date().getFullYear()} MzansiMart • Secure Payments • Trusted Sellers</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
