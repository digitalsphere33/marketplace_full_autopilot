import React, { useEffect, useState } from 'react';

export default function ProductDetail() {
  const pathParts = (typeof window !== 'undefined' ? window.location.pathname : '').split('/').filter(Boolean);
  const id = pathParts.length ? pathParts[pathParts.length - 1] : null;

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/products/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`/products/${id}/reviews`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/products').then(r => r.ok ? r.json() : []).catch(() => [])
    ])
      .then(([prod, revs, all]) => {
        setProduct(prod);
        setReviews(revs || []);
        if (prod && Array.isArray(all)) {
          const rel = all.filter(p => p.id !== prod.id && p.category === prod.category).slice(0, 6);
          setRelated(rel);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({ cartId: `${id}-${Date.now()}`, listing_id: id, title: product.title, price: product.price, image_url: product.images?.[0] || '', quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart_updated'));
    alert('Added to cart');
  }

  function goHome(e) {
    e && e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  function goCategory(e) {
    e && e.preventDefault();
    const cat = product?.category || '';
    window.history.pushState({}, '', '/');
    // Add a short delay and then set search or scroll; App will show listings on popstate
    window.dispatchEvent(new PopStateEvent('popstate'));
    // Optionally use query params in the future
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.title,
    image: product.images || [],
    description: product.description || '',
    sku: product.sku || product.id,
    brand: product.brand || undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "ZAR",
      availability: product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: typeof window !== 'undefined' ? window.location.href : ''
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Breadcrumbs */}
      <nav className="text-sm mb-4 text-neutral-400">
        <a href="/" onClick={goHome} className="hover:underline text-neutral-500">Home</a>
        <span className="mx-2">/</span>
        <a href="#" onClick={goCategory} className="hover:underline text-neutral-500">{product.category || 'Category'}</a>
        <span className="mx-2">/</span>
        <span className="text-neutral-600">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.title} className="w-full rounded-lg border border-neutral-200" />
          <div className="flex gap-2 mt-4">
            {(product.images || []).slice(0,4).map((img,i)=> (
              <img key={i} src={img} className="w-20 h-20 object-cover rounded cursor-pointer border border-neutral-200" alt="thumb" />
            ))}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-neutral-700">Related products</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {related.map(r => (
                  <a key={r.id} href={`/product/${r.id}`} onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', `/product/${r.id}`); window.dispatchEvent(new PopStateEvent('popstate')); }} className="bg-white border border-neutral-200 rounded p-2 text-sm hover:shadow-md">
                    <img src={r.images?.[0] || '/placeholder.jpg'} className="w-full h-20 object-cover rounded mb-2" alt={r.title} />
                    <div className="font-medium text-neutral-700">{r.title}</div>
                    <div className="text-sm text-neutral-500">R {Number(r.price).toFixed(2)}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-neutral-800">{product.title}</h1>
          <div className="text-neutral-500 mt-2">{product.seller_name || 'Seller'}</div>
          <div className="text-3xl font-bold text-brand-600 mt-4">R {product.price}</div>
          <div className="mt-4 text-neutral-700">{product.description}</div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center border rounded border-neutral-200">
              <button onClick={() => setQuantity(Math.max(1, quantity-1))} className="px-3">−</button>
              <div className="px-4">{quantity}</div>
              <button onClick={() => setQuantity(quantity+1)} className="px-3">+</button>
            </div>
            <button onClick={addToCart} className="bg-brand-600 text-white px-6 py-2 rounded">Add to cart</button>
            <button onClick={() => window.location.href = `/profile/${product.seller_id || ''}`} className="px-4 py-2 border rounded border-neutral-200">Contact Seller</button>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-neutral-800">Customer reviews</h2>
            {reviews.length === 0 && (<div className="text-neutral-500 mt-2">No reviews yet</div>)}
            {reviews.map(r => (
              <div key={r.id} className="mt-3 border-t pt-3 border-neutral-200">
                <div className="text-sm text-neutral-500">{r.user_name}</div>
                <div className="font-semibold text-neutral-700">{r.title}</div>
                <div className="text-neutral-700 mt-1">{r.comment}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky add to cart for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 flex items-center justify-between md:hidden">
        <div>
          <div className="font-medium text-neutral-800">{product.title}</div>
          <div className="text-sm text-neutral-500">R {product.price}</div>
        </div>
        <button onClick={addToCart} className="bg-brand-600 text-white px-4 py-2 rounded">Add to cart</button>
      </div>
    </div>
  );
}
