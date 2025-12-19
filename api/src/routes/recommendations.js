import { pool } from '../db.js';
import { redis } from '../redis.js';

export default async function recommendationsRoutes(app) {
  // MVP heuristic: trending items + user category affinity
  app.get('/me', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const userId = req.user.sub;
      
      // 1. Get user's top categories from order history
      const { rows: orderHistory } = await pool.query(`
        SELECT l.category, COUNT(*) as freq
        FROM orders o
        JOIN listings l ON l.id = ANY(o.items)
        WHERE o.buyer_id = $1
        GROUP BY l.category
        ORDER BY freq DESC
        LIMIT 3
      `, [userId]).catch(() => ({ rows: [] }));
      
      const topCategories = orderHistory.map(r => r.category);
      
      // 2. Get trending items (views + carts from Redis fallback to all active)
      const { rows: allListings } = await pool.query(`
        SELECT * FROM listings WHERE status='active' LIMIT 50
      `);
      
      // Enrich with Redis view/cart counts
      const enriched = await Promise.all(
        allListings.map(async (item) => {
          const views = await redis.get(`view:${item.id}`).catch(() => '0');
          const carts = await redis.get(`cart:${item.id}`).catch(() => '0');
          const score = parseInt(views || '0', 10) * 1 + parseInt(carts || '0', 10) * 3;
          
          // Boost if in user's top categories
          const categoryBoost = topCategories.includes(item.category) ? 10 : 0;
          
          return { ...item, score: score + categoryBoost };
        })
      );
      
      // Sort by score and return top 12
      const recommended = enriched
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);
      
      return recommended;
    } catch (err) {
      app.log.error({ err }, 'Recommendations error');
      // Fallback: return random active listings
      const { rows } = await pool.query(`
        SELECT * FROM listings WHERE status='active' ORDER BY RANDOM() LIMIT 12
      `);
      return rows;
    }
  });
  
  // Track view event (increment Redis counter)
  app.post('/track/view', { preValidation: [app.verifyJwt] }, async (req) => {
    const { listing_id } = req.body;
    if (listing_id) {
      await redis.set(`view:${listing_id}`, 
        parseInt(await redis.get(`view:${listing_id}`).catch(() => '0'), 10) + 1
      ).catch(() => {});
    }
    return { ok: true };
  });
  
  // Track add-to-cart event
  app.post('/track/cart', { preValidation: [app.verifyJwt] }, async (req) => {
    const { listing_id } = req.body;
    if (listing_id) {
      await redis.set(`cart:${listing_id}`, 
        parseInt(await redis.get(`cart:${listing_id}`).catch(() => '0'), 10) + 1
      ).catch(() => {});
    }
    return { ok: true };
  });
}
