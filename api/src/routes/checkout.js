import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { buildPaymentForm } from '../payments/payfast.js';

export default async function checkoutRoutes(app) {
  app.post('/', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    const { items, total, returnUrl, cancelUrl } = req.body;
    if (!items || !Array.isArray(items) || !items.length) return reply.code(400).send({ error: 'Items required' });
    if (!total || isNaN(Number(total))) return reply.code(400).send({ error: 'Total required' });
    if (!items[0].product_id || !items[0].seller_id) return reply.code(400).send({ error: 'product_id and seller_id required on item' });
    const orderId = uuidv4();
    await pool.query('INSERT INTO orders(id,buyer_id,total,status) VALUES($1,$2,$3,$4)', [orderId, req.user.sub, total, 'pending']);

    // Insert order items
    for (const item of items) {
      const itemId = uuidv4();
      await pool.query('INSERT INTO order_items(id,order_id,product_id,quantity,price) VALUES($1,$2,$3,$4,$5)', [itemId, orderId, item.product_id, item.quantity || 1, item.price]);
    }

    // Simplify: assume one seller per order for MVP
    const [{ seller_id }] = items;
    const notifyUrl = `http://localhost:3000/webhooks/payfast`;
    const payment = buildPaymentForm({
      amount: total,
      buyerEmail: req.user.email || 'buyer@example.com',
      itemName: `Order ${orderId}`,
      returnUrl,
      cancelUrl,
      notifyUrl,
      sellerId: seller_id
    });
    return { orderId, redirect: payment.redirect, params: payment.params };
  });
}
