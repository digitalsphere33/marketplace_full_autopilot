import React, { useState } from 'react';

export default function Checkout({ cart = [], setCart = () => {} }) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [redirect, setRedirect] = useState('');
  const [loading, setLoading] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + shippingFee;

  async function handleCheckout() {
    if (!email || !phone || !address) {
      alert('Please fill in all delivery details');
      return;
    }
    
    setLoading(true);
    try {
      const body = {
        items: cart.map(item => ({ title: item.title, price: item.price, quantity: item.quantity })),
        total,
        buyer_email: email,
        buyer_phone: phone,
        delivery_address: address,
        returnUrl: window.location.origin,
        cancelUrl: window.location.origin
      };
      
      const res = await fetch('/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(r => r.json());
      
      if (res.redirect) {
        window.location.href = res.redirect;
      }
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto grid lg:grid-cols-3 gap-6">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-2xl font-bold">Shopping Cart</h2>
        
        {cart.length === 0 ? (
          <div className="bg-gray-50 border rounded-lg p-6 text-center text-gray-600">
            Your cart is empty. <a href="#" className="text-primary hover:underline">Browse products</a>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.cartId} className="bg-white border rounded-lg p-3 flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
                <div className="font-bold text-primary">R {(item.price * item.quantity).toFixed(2)}</div>
                <button
                  onClick={() => setCart(cart.filter(c => c.cartId !== item.cartId))}
                  className="ml-3 text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Details */}
        {cart.length > 0 && (
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Delivery Details</h3>
            <input
              type="email"
              className="w-full border rounded-lg p-2"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              type="tel"
              className="w-full border rounded-lg p-2"
              placeholder="Phone number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <textarea
              className="w-full border rounded-lg p-2"
              placeholder="Delivery address"
              rows="3"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
        )}
      </div>
      {/* Order Summary */}
      <div className="bg-white border rounded-lg p-4 h-fit space-y-3">
        <h3 className="font-semibold text-lg">Order Summary</h3>
        <div className="space-y-2 text-sm border-t pt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping {subtotal > 500 ? '(FREE)' : ''}</span>
            <span>R {shippingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span className="text-primary">R {total.toFixed(2)}</span>
          </div>
        </div>
        
        <button
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
        
        {redirect && (
          <a
            href={redirect}
            target="_blank"
            className="block text-center text-primary underline text-sm"
          >
            Open PayFast Payment
          </a>
        )}
      </div>
    </div>
  );
}
