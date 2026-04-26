import { verifyIpn } from '../payments/payfast.js';
import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmation, sendSellerNotification } from '../services/email.js';

export default async function webhookRoutes(app) {
  app.post('/payfast', async (req, reply) => {
    const form = req.body || {};
    if (!verifyIpn(form)) return reply.code(400).send({ error: 'Invalid signature' });
    // Replay protection
    const sig = form.signature || 'nosig';
    const seen = await redis.get(`ipn:${sig}`);
    if (seen) return reply.code(400).send({ error: 'Duplicate IPN' });
    await redis.set(`ipn:${sig}`, '1', { EX: 60 * 60 });

    const orderId = form.item_name?.split(' ').pop();
    const total = Number(form.amount);
    const platformFee = Number(form.split_primary_receiver);
    const sellerAmount = Number(form.split_secondary_receiver);
    if (orderId) {
      await pool.query('UPDATE orders SET status=$1 WHERE id=$2', ['paid', orderId]);
      const id = uuidv4();
      // Determine seller payout delay
      const { rows: ordRows } = await pool.query('SELECT * FROM orders WHERE id=$1', [orderId]);
      const order = ordRows[0];
      // Send emails to buyer and seller if available
      try {
        if (order && order.customer_email) {
          await sendOrderConfirmation(order, order.customer_email);
        }
        // try to find seller email via order items -> listings -> sellers -> users
        const { rows: sellerRows } = await pool.query(`
          SELECT u.email as seller_email FROM order_items oi
          JOIN listings l ON l.id = oi.listing_id
          JOIN sellers s ON s.id = l.seller_id
          JOIN users u ON u.id = s.user_id
          WHERE oi.order_id = $1 LIMIT 1
        `, [orderId]);
        if (sellerRows.length) {
          const sellerEmail = sellerRows[0].seller_email;
          if (sellerEmail) await sendSellerNotification(order, sellerEmail);
        }
      } catch (emailErr) {
        app.log.error({ emailErr }, 'Failed to send order/seller emails');
      }

      // Attempt to find seller via ledger or items table -- simplified: use custom_str1 in form
      const sellerId = form.custom_str1 || null;
      let payoutDelayDays = 7;
      if (sellerId) {
        const { rows: srows } = await pool.query('SELECT payout_delay_days FROM sellers WHERE id=$1', [sellerId]);
        if (srows.length) payoutDelayDays = srows[0].payout_delay_days || payoutDelayDays;
      }
      const scheduledAt = new Date(Date.now() + payoutDelayDays * 24 * 60 * 60 * 1000);
      await pool.query('INSERT INTO ledger(id,order_id,platform_fee,seller_amount,seller_payout_scheduled_at) VALUES($1,$2,$3,$4,$5)', [id, orderId, platformFee, sellerAmount, scheduledAt]);
    }
    return { ok: true };
  });
}
