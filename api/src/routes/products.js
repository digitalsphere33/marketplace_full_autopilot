import { pool } from '../db.js';

export default async function productsRoutes(app) {
  // Admin-only protection
  app.addHook('preValidation', async (req, reply) => {
    if (req.routerPath?.startsWith('/products')) {
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
}

