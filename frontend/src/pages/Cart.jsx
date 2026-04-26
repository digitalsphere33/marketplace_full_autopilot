import React, { useEffect, useState } from 'react';

export default function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    load();
    const onUpdate = () => load();
    window.addEventListener('cart_updated', onUpdate);
    return () => window.removeEventListener('cart_updated', onUpdate);
  }, []);

  function load() {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }

  function changeQty(cartId, qty) {
    const newCart = cart.map(i => i.cartId === cartId ? { ...i, quantity: qty } : i);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart_updated'));
  }

  function removeItem(cartId) {
    const newCart = cart.filter(i => i.cartId !== cartId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart_updated'));
  }

  const subtotal = cart.reduce((s, c) => s + (c.price * (c.quantity || 1)), 0);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      {cart.length === 0 && <div className="text-gray-600">Your cart is empty</div>}
      {cart.map(item => (
        <div key={item.cartId} className="flex items-center gap-4 border p-4 rounded mb-3">
          <img src={item.image_url || '/placeholder.jpg'} className="w-24 h-24 object-cover rounded" alt="" />
          <div className="flex-1">
            <div className="font-semibold">{item.title}</div>
            <div className="text-gray-600">R {item.price}</div>
            <div className="mt-2 flex items-center gap-2">
              <button onClick={() => changeQty(item.cartId, Math.max(1, (item.quantity||1)-1))} className="px-3 py-1 border rounded">−</button>
              <div>{item.quantity || 1}</div>
              <button onClick={() => changeQty(item.cartId, (item.quantity||1)+1)} className="px-3 py-1 border rounded">+</button>
              <button onClick={() => removeItem(item.cartId)} className="ml-4 text-red-600">Remove</button>
            </div>
          </div>
          <div className="font-bold">R {(item.price * (item.quantity||1)).toFixed(2)}</div>
        </div>
      ))}

      {cart.length > 0 && (
        <div className="mt-4 p-4 border rounded">
          <div className="flex justify-between text-lg font-semibold"> <div>Subtotal</div> <div>R {subtotal.toFixed(2)}</div></div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => window.location.href = '/checkout'} className="bg-blue-600 text-white px-4 py-2 rounded">Proceed to checkout</button>
            <button onClick={() => window.location.href = '/'} className="px-4 py-2 border rounded">Continue shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}
