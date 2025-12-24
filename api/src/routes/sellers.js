import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function sellerRoutes(app) {
  app.post('/', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      console.log('[SELLERS] POST request received');
      console.log('[SELLERS] User object:', req.user);
      const { sub } = req.user;
      if (!sub) {
        console.log('[SELLERS] No sub in JWT');
        return reply.code(400).send({ error: 'Invalid JWT: no user ID' });
      }
      // Check if seller already exists
      const { rows } = await pool.query('SELECT * FROM sellers WHERE user_id=$1', [sub]);
      if (rows.length > 0) {
        console.log('[SELLERS] Seller already exists:', rows[0].id);
        return { id: rows[0].id, kyc_status: rows[0].kyc_status, message: 'Seller profile already exists' };
      }
      
      const id = uuidv4();
      console.log('[SELLERS] Creating new seller:', { id, user_id: sub });
      await pool.query('INSERT INTO sellers(id,user_id) VALUES($1,$2)', [id, sub]);
      console.log('[SELLERS] Seller created successfully');
      return { id, kyc_status: 'pending' };
    } catch (err) {
      console.error('[SELLERS] Creation error:', err);
      return reply.code(500).send({ error: 'Failed to create seller profile', details: err.message });
    }
  });

  app.get('/me', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const { sub } = req.user;
      const { rows } = await pool.query('SELECT * FROM sellers WHERE user_id=$1', [sub]);
      return rows[0] || {};
    } catch (err) {
      console.error('Seller fetch error:', err);
      return reply.code(500).send({ error: 'Failed to fetch seller profile' });
    }
  });
}
