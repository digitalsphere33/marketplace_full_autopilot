import axios from 'axios';
import child from 'child_process';
import util from 'util';
const exec = util.promisify(child.exec);

async function run() {
  console.log('Starting integration smoke...');
  // Start server with in-memory DB only if health is not ready
  const base = 'http://127.0.0.1:3000';
  let server = null;
  try {
    await axios.get(`${base}/health`, { timeout: 1000 });
    console.log('Existing server detected, will use it for integration test');
  } catch (e) {
    console.log('No server detected, starting local server (USE_PGMEM=true)');
    server = child.spawn('node', ['src/index.js'], { env: { ...process.env, USE_PGMEM: 'true', JWT_SECRET: 'test_secret', NODE_ENV: 'development' }, stdio: 'inherit' });
    // wait for server
    await new Promise((r)=>setTimeout(r,1500));
  }

  try {
    // Register
    const email = `test+${Date.now()}@example.com`;
    const reg = await axios.post(`${base}/auth/register`, { email, password: 'password123' });
    console.log('Registered:', reg.data);
    const token = reg.data.token;
    // Create seller
    const seller = await axios.post(`${base}/sellers`, {}, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Seller created:', seller.data);
    const sellerId = seller.data.id;
    // Create listing
    const list = await axios.post(`${base}/listings`, { title: 'Test Item', price: 10.0, imageUrl: 'https://example.com/image.jpg' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Listing:', list.data);
    // Checkout
    const co = await axios.post(`${base}/checkout`, { items: [{ seller_id: sellerId }], total: 10.0, returnUrl: 'https://example.com/ok', cancelUrl: 'https://example.com/cancel' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Checkout:', co.data);
    const orderId = co.data.orderId;
    // Simulate IPN by invoking simulate_ipn.js logic
    const sim = await import('./simulate_ipn.js');
    process.env.ORDER_ID = orderId;
    await sim.run?.() || (await sim.default?.());
    console.log('IPN simulated');
  } finally {
    if (server) server.kill();
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
