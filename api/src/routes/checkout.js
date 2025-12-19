import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { buildPaymentForm } from '../payments/payfast.js';

export default async function checkoutRoutes(app) {
  app.post('/', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    const { items, total, returnUrl, cancelUrl } = req.body;
    const orderId = uuidv4();
    await pool.query('INSERT INTO orders(id,buyer_id,total,status) VALUES($1,$2,$3,$4)', [orderId, req.user.sub, total, 'pending']);

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
