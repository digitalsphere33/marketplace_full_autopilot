import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { config } from '../config.js';

export default async function listingRoutes(app) {
  // Create listing with NSFW moderation via ML service
  app.post('/', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    const { title, price, imageUrl } = req.body;
    const { rows: sellerRows } = await pool.query('SELECT id FROM sellers WHERE user_id=$1', [req.user.sub]);
    if (!sellerRows.length) return reply.code(400).send({ error: 'Seller not onboarded' });
    // call ML service
    try {
      const res = await axios.post('http://ml:8000/moderate', { image_url: imageUrl });
      if (res.data.flagged) {
        const fid = uuidv4();
        await pool.query('INSERT INTO flagged_items(id,seller_id,listing_title,reason) VALUES($1,$2,$3,$4)', [fid, sellerRows[0].id, title, res.data.reason || 'nsfw']);
        return reply.code(400).send({ error: 'NSFW content blocked' });
      }
    } catch (e) {
      app.log.warn({ err: e.message }, 'ML service unavailable, allowing image for dev');
    }
    const id = uuidv4();
    await pool.query('INSERT INTO listings(id,seller_id,title,price,status) VALUES($1,$2,$3,$4,$5)', [id, sellerRows[0].id, title, price, 'active']);
    return { id };
  });

  app.get('/', async () => {
    const { rows } = await pool.query("SELECT l.*, s.id as seller FROM listings l JOIN sellers s ON s.id=l.seller_id WHERE l.status='active'");
    return rows;
  });
}
