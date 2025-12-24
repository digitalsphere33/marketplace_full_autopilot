import { pool } from '../db.js';
import { config } from '../config.js';

export default async function adminRoutes(app) {
  // simple RBAC: require role=admin in JWT
  app.addHook('preValidation', async (req, reply) => {
    if (req.routerPath?.startsWith('/admin')) {
      try { await app.verifyJwt(req, reply); } catch {}
      if (req.user?.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });
    }
  });

  app.get('/stats', async () => {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const sellers = await pool.query('SELECT COUNT(*) FROM sellers');
    const listings = await pool.query('SELECT COUNT(*) FROM listings');
    const orders = await pool.query('SELECT COUNT(*) FROM orders');
    return {
      users: Number(users.rows[0].count),
      sellers: Number(sellers.rows[0].count),
      listings: Number(listings.rows[0].count),
      orders: Number(orders.rows[0].count)
    };
  });

  app.get('/orders', async () => (await pool.query('SELECT * FROM orders ORDER BY created_at DESC')).rows);
  app.get('/ledger', async () => (await pool.query('SELECT * FROM ledger ORDER BY created_at DESC')).rows);
  app.post('/ledger/:id/mark-paid', async (req, reply) => {
    try {
      const { id } = req.params;
      await pool.query('UPDATE ledger SET paid_to_seller = true WHERE id=$1', [id]);
      return { ok: true };
    } catch (err) {
      app.log.error({ err }, 'Mark ledger paid error');
      return reply.code(500).send({ error: 'Failed to mark ledger entry' });
    }
  });
  app.get('/sellers', async () => (await pool.query('SELECT * FROM sellers')).rows);
  app.get('/listings', async () => {
    const { rows } = await pool.query(`
      SELECT l.*, s.id as seller_id, u.email as seller_email 
      FROM listings l 
      LEFT JOIN sellers s ON s.id = l.seller_id
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY l.created_at DESC
    `);
    return rows;
  });
  app.get('/flagged', async () => (await pool.query('SELECT * FROM flagged_items ORDER BY created_at DESC')).rows);
  
  // Delete a listing (moderation)
  app.delete('/listings/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM listings WHERE id=$1', [id]);
      return { ok: true, message: 'Listing deleted' };
    } catch (err) {
      app.log.error({ err }, 'Delete listing error');
      return reply.code(500).send({ error: 'Failed to delete listing' });
    }
  });
  
  // Create listing as admin (for testing/seeding)
  app.post('/listings', async (req, reply) => {
    try {
      const { title, price, category, seller_id } = req.body;
      if (!title || !price) {
        return reply.code(400).send({ error: 'Title and price required' });
      }
      
      const id = require('uuid').v4();
      await pool.query(
        'INSERT INTO listings(id, seller_id, title, price, status, category) VALUES($1, $2, $3, $4, $5, $6)',
        [id, seller_id || null, title, price, 'active', category || 'Electronics']
      );
      
      return { id, title, price };
    } catch (err) {
      app.log.error({ err }, 'Create listing error');
      return reply.code(500).send({ error: 'Failed to create listing' });
    }
  });

  // Dev-only: promote current user to admin for dashboard tests
  app.post('/promote', async (req, reply) => {
    if (config.env !== 'development') return reply.code(403).send({ error: 'Disabled' });
    const { sub } = req.user;
    await pool.query('UPDATE users SET role=$1 WHERE id=$2', ['admin', sub]);
    return { ok: true };
  });
}
