import { verifyIpn } from '../payments/payfast.js';
import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function webhookRoutes(app) {
  app.post('/payfast', async (req, reply) => {
    const form = req.body || {};
    if (!verifyIpn(form)) return reply.code(400).send({ error: 'Invalid signature' });
    const orderId = form.item_name?.split(' ').pop();
    const total = Number(form.amount);
    const platformFee = Number(form.split_primary_receiver);
    const sellerAmount = Number(form.split_secondary_receiver);
    if (orderId) {
      await pool.query('UPDATE orders SET status=$1 WHERE id=$2', ['paid', orderId]);
      const id = uuidv4();
      await pool.query('INSERT INTO ledger(id,order_id,platform_fee,seller_amount) VALUES($1,$2,$3,$4)', [id, orderId, platformFee, sellerAmount]);
    }
    return { ok: true };
  });
}
