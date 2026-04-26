import { pool } from '../db.js';

export default async function productsRoutes(app) {
  // Admin-only protection except for reviews
  app.addHook('preValidation', async (req, reply) => {
    // Allow public GETs; restrict non-GET product routes to admin users
    const isAdminRoute = req.routerPath?.startsWith('/products') && req.method !== 'GET';
    if (isAdminRoute) {
      try { await app.verifyJwt(req, reply); } catch {}
      if (req.user?.role !== 'admin') return reply.code(403).send({ error: 'Forbidden' });
    }
  });

  // Create a product with up to 5 image URLs
  app.post('/', async (req, reply) => {
    try {
      const { title, description, price, stock, sku, category, images } = req.body || {};
      if (!title || typeof price !== 'number') return reply.code(400).send({ error: 'Title and price are required' });
      if (images && images.length > 5) return reply.code(400).send({ error: 'Max 5 images' });

      const { v4: uuidv4 } = await import('uuid');
      const id = uuidv4();
      await pool.query(
        'INSERT INTO products (id,title,description,price,stock,sku,category,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
        [id, title, description || null, price, stock ?? 0, sku || null, category || 'Electronics', 'active']
      );

      if (images && images.length) {
        let pos = 0;
        for (const url of images) {
          const imgId = uuidv4();
          await pool.query('INSERT INTO product_images (id,product_id,url,position) VALUES ($1,$2,$3,$4)', [imgId, id, url, pos++]);
        }
      }

      return { id };
    } catch (err) {
      app.log.error({ err }, 'Create product error');
      return reply.code(500).send({ error: 'Failed to create product' });
    }
  });

  // List products (admin view)
  app.get('/', async (_req, _reply) => {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return rows;
  });

  // Upload image from URL to storage (admin)
  app.post('/:id/upload-image', async (req, reply) => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body || {};
      if (!imageUrl) return reply.code(400).send({ error: 'imageUrl required' });
      const { uploadImageFromUrl } = await import('../storage.js');
      const publicUrl = await uploadImageFromUrl(id, imageUrl);
      const imgId = require('uuid').v4();
      await pool.query('INSERT INTO product_images (id,product_id,url,position) VALUES ($1,$2,$3,$4)', [imgId, id, publicUrl, 0]);
      return { url: publicUrl };
    } catch (err) {
      req.log.error({ err }, 'Upload image error');
      return reply.code(500).send({ error: 'Upload failed' });
    }
  });

  // Submit review (buyer only, after purchase)
  app.post('/:id/reviews', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const { id: productId } = req.params;
      const { rating, comment } = req.body || {};
      const { sub: buyerId } = req.user;
      if (!rating || rating < 1 || rating > 5) return reply.code(400).send({ error: 'Rating 1-5 required' });

      // Check if buyer purchased this product (via orders and items)
      const { rows: orderRows } = await pool.query(`
        SELECT o.id FROM orders o
        WHERE o.buyer_id = $1 AND o.status = 'paid'
        AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = $2)
      `, [buyerId, productId]);
      if (!orderRows.length) return reply.code(403).send({ error: 'Must purchase product to review' });

      const reviewId = require('uuid').v4();
      await pool.query('INSERT INTO reviews (id, product_id, buyer_id, rating, comment) VALUES ($1, $2, $3, $4, $5)', [reviewId, productId, buyerId, rating, comment || null]);
      return { id: reviewId };
    } catch (err) {
      if (err.code === '23505') return reply.code(400).send({ error: 'Already reviewed this product' });
      req.log.error({ err }, 'Review submit error');
      return reply.code(500).send({ error: 'Review failed' });
    }
  });

  // Get reviews for product (public)
  app.get('/:id/reviews', async (req, reply) => {
    try {
      const { id: productId } = req.params;
      const { rows } = await pool.query(`
        SELECT r.rating, r.comment, r.created_at, u.email as buyer_email
        FROM reviews r
        JOIN users u ON u.id = r.buyer_id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
      `, [productId]);
      return rows;
    } catch (err) {
      req.log.error({ err }, 'Get reviews error');
      return reply.code(500).send({ error: 'Failed to fetch reviews' });
    }
  });
}

