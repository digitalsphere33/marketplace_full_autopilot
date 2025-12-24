#!/usr/bin/env node
import { pool } from '../src/db.js';
import { redis } from '../src/redis.js';

export async function runOnce() {
  console.log('Payout worker: scanning ledger for due payouts');
  const { rows } = await pool.query("SELECT l.*, o.buyer_id FROM ledger l LEFT JOIN orders o ON o.id = l.order_id WHERE l.paid_to_seller = false AND l.seller_payout_scheduled_at <= now() LIMIT 50");
  for (const row of rows) {
    try {
      console.log('Processing payout for ledger:', row.id, 'seller_amount', row.seller_amount);
      // TODO: Integrate with payout provider (e.g., PayFast disbursement or manual transfer via banking API)
      // For now, mark paid
      await pool.query('UPDATE ledger SET paid_to_seller = true WHERE id=$1', [row.id]);
      console.log('Marked as paid:', row.id);
    } catch (err) {
      console.error('Payout error for', row.id, err);
    }
  }
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  runOnce().then(()=>process.exit(0)).catch((e)=>{console.error(e); process.exit(1);});
}
