import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function disputeRoutes(app) {
  // Basic dispute management (MVP): store in ledger table as negative adjustments or separate table
  await pool.query("CREATE TABLE IF NOT EXISTS disputes (id UUID PRIMARY KEY, order_id UUID, buyer_id UUID, reason TEXT, status TEXT DEFAULT 'open', created_at TIMESTAMP DEFAULT now())");

  app.post('/', { preValidation: [app.verifyJwt] }, async (req) => {
    const id = uuidv4();
    const { order_id, reason } = req.body;
    await pool.query('INSERT INTO disputes(id,order_id,buyer_id,reason) VALUES($1,$2,$3,$4)', [id, order_id, req.user.sub, reason]);
    return { id, status: 'open' };
  });

  app.get('/', { preValidation: [app.verifyJwt] }, async (req) => {
    const { rows } = await pool.query('SELECT * FROM disputes WHERE buyer_id=$1', [req.user.sub]);
    return rows;
  });

  app.post('/:id/resolve', { preValidation: [app.verifyJwt] }, async (req) => {
    await pool.query('UPDATE disputes SET status=$1 WHERE id=$2', ['resolved', req.params.id]);
    return { status: 'resolved' };
  });
}
