import { pool } from '../db.js';

export default async function ordersRoutes(app) {
  // Get user's orders
  app.get('/me', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const { sub } = req.user;
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE buyer_id=$1 ORDER BY created_at DESC',
        [sub]
      );
      return rows || [];
    } catch (err) {
      console.error('Orders fetch error:', err);
      return reply.code(500).send({ error: 'Failed to fetch orders' });
    }
  });

  // Get order details
  app.get('/:id', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const { id } = req.params;
      const { sub } = req.user;
      const { rows } = await pool.query(
        'SELECT * FROM orders WHERE id=$1 AND buyer_id=$2',
        [id, sub]
      );
      return rows[0] || {};
    } catch (err) {
      console.error('Order fetch error:', err);
      return reply.code(500).send({ error: 'Failed to fetch order' });
    }
  });
}
