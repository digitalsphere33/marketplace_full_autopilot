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
    const { rows: legacyListings } = await pool.query("SELECT l.*, s.id as seller FROM listings l JOIN sellers s ON s.id=l.seller_id WHERE l.status='active'");

    // Pull products table (admin-created) and map to listing-like shape for frontend
    const { rows: products } = await pool.query(`
      SELECT p.id,
             p.title,
             p.price,
             p.category,
             p.status,
             p.stock,
             p.created_at,
             (
               SELECT url FROM product_images pi
               WHERE pi.product_id = p.id
               ORDER BY pi.position ASC
               LIMIT 1
             ) AS image_url
      FROM products p
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `);

    // Normalize products to match the frontend expectations
    const normalizedProducts = products.map(p => ({
      id: p.id,
      seller: null,
      title: p.title,
      price: Number(p.price || 0),
      status: p.status,
      category: p.category || 'Electronics',
      image_url: p.image_url || null,
      stock: p.stock,
      created_at: p.created_at
    }));

    return [...normalizedProducts, ...legacyListings];
  });
}
