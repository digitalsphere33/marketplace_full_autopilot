import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config.js';
import { pool, ensureSchema } from './db.js';
import { connectRedis } from './redis.js';
import authRoutes from './routes/auth.js';
import sellerRoutes from './routes/sellers.js';
import listingRoutes from './routes/listings.js';
import checkoutRoutes from './routes/checkout.js';
import adminRoutes from './routes/admin.js';
import disputeRoutes from './routes/disputes.js';
import webhookRoutes from './routes/webhook.js';
import ordersRoutes from './routes/orders.js';
import recommendationsRoutes from './routes/recommendations.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(jwt, { secret: config.jwtSecret });

// HTTPS enforcement (dev may allow HTTP)
app.addHook('onRequest', async (req, reply) => {
  const proto = req.headers['x-forwarded-proto'];
  if (!config.allowHttpDev && proto && proto !== 'https') {
    reply.code(400).send({ error: 'HTTPS required' });
  }
});

app.decorate('verifyJwt', async (request, reply) => {
  try { await request.jwtVerify(); }
  catch (err) { reply.code(401).send({ error: 'Unauthorized' }); }
});

app.get('/health', async () => ({ ok: true, ai: config.ai }));

await ensureSchema();
await connectRedis();

await app.register(authRoutes, { prefix: '/auth' });
await app.register(sellerRoutes, { prefix: '/sellers' });
await app.register(listingRoutes, { prefix: '/listings' });
await app.register(checkoutRoutes, { prefix: '/checkout' });
await app.register(adminRoutes, { prefix: '/admin' });
await app.register(disputeRoutes, { prefix: '/disputes' });
await app.register(webhookRoutes, { prefix: '/webhooks' });
await app.register(ordersRoutes, { prefix: '/orders' });
await app.register(recommendationsRoutes, { prefix: '/recommendations' });

app.addHook('onReady', async () => {
  app.log.info({ AI_PROVIDER: config.ai.provider, AI_MODEL: config.ai.model }, 'AI globally enabled');
});

app.listen({ host: '127.0.0.1', port: config.port });
