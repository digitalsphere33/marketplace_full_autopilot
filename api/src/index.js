import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import * as Sentry from '@sentry/node';
import { config } from './config.js';
import { pool, ensureSchema } from './db.js';
import { connectRedis, redis } from './redis.js';
import authRoutes from './routes/auth.js';
import sellerRoutes from './routes/sellers.js';
import listingRoutes from './routes/listings.js';
import checkoutRoutes from './routes/checkout.js';
import adminRoutes from './routes/admin.js';
import disputeRoutes from './routes/disputes.js';
import webhookRoutes from './routes/webhook.js';
import ordersRoutes from './routes/orders.js';
import recommendationsRoutes from './routes/recommendations.js';
import productsRoutes from './routes/products.js';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });
await app.register(jwt, { secret: config.jwtSecret });

// Optional Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: config.env });
  app.addHook('onError', async (request, reply, error) => {
    Sentry.captureException(error);
  });
}

// Rate limiting
await app.register(rateLimit, {
  global: true,
  max: Number(process.env.RATE_LIMIT_MAX || 100),
  timeWindow: '1 minute',
});

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

let metrics = { requests: 0, errors: 0 };

app.addHook('onRequest', async (req, reply) => { metrics.requests += 1; });

app.get('/health', async () => ({ ok: true, ai: config.ai }));

app.get('/metrics', async () => {
  return `# HELP mzansimart_requests_total Total requests\n# TYPE mzansimart_requests_total counter\nmzansimart_requests_total ${metrics.requests}\n# HELP mzansimart_errors_total Total errors\n# TYPE mzansimart_errors_total counter\nmzansimart_errors_total ${metrics.errors}\n`;
});

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
async function startupWithRetries() {
  const maxAttempts = Number(process.env.DB_CONN_RETRIES || 12);
  const delayMs = Number(process.env.DB_CONN_DELAY_MS || 2000);
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      app.log.info({ attempt, maxAttempts }, 'Attempting DB schema and Redis connect');
      await ensureSchema();
      await connectRedis();
      app.log.info('DB and Redis connected');
      return;
    } catch (err) {
      app.log.error({ err: String(err), attempt }, 'DB/Redis connect attempt failed');
      if (attempt === maxAttempts) throw err;
      await wait(delayMs);
    }
  }
}

await startupWithRetries();

// Close DB and Redis gracefully
async function shutdown() {
  try { await pool.end(); } catch (err) { app.log.error('Error closing DB', err); }
  try { if (redis && redis.quit) await redis.quit(); } catch (err) { app.log.error('Error closing Redis', err); }
}


await app.register(authRoutes, { prefix: '/auth' });
await app.register(sellerRoutes, { prefix: '/sellers' });
await app.register(listingRoutes, { prefix: '/listings' });
await app.register(checkoutRoutes, { prefix: '/checkout' });
await app.register(adminRoutes, { prefix: '/admin' });
await app.register(disputeRoutes, { prefix: '/disputes' });
await app.register(webhookRoutes, { prefix: '/webhooks' });
await app.register(ordersRoutes, { prefix: '/orders' });
await app.register(recommendationsRoutes, { prefix: '/recommendations' });
await app.register(productsRoutes, { prefix: '/products' });

app.addHook('onReady', async () => {
  app.log.info({ AI_PROVIDER: config.ai.provider, AI_MODEL: config.ai.model }, 'AI globally enabled');
});

const server = app.listen({ host: '0.0.0.0', port: config.port });

// Graceful shutdown
process.on('SIGINT', async () => {
  app.log.info('SIGINT received, closing server');
  try { await app.close(); } catch (err) { app.log.error(err); }
  await shutdown();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  app.log.info('SIGTERM received, closing server');
  try { await app.close(); } catch (err) { app.log.error(err); }
  await shutdown();
  process.exit(0);
});

app.addHook('onError', async (request, reply, error) => {
  metrics.errors += 1;
});

export default server;
