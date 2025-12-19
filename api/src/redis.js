import { createClient } from 'redis';
import { config } from './config.js';

let redis;
const memory = {
  map: new Map(),
  hset: new Map(),
};

if (config.redisUrl) {
  redis = createClient({ url: config.redisUrl });
  redis.on('error', (err) => console.error('Redis error', err));
} else {
  // In-memory fallback for dev when Redis is unavailable
  redis = {
    async hSet(key, field, value) {
      const obj = memory.hset.get(key) || {};
      obj[field] = value;
      memory.hset.set(key, obj);
    },
    async hGet(key, field) {
      const obj = memory.hset.get(key) || {};
      return obj[field];
    },
    async set(key, value, opts) {
      memory.map.set(key, value);
      if (opts?.EX) {
        setTimeout(() => memory.map.delete(key), opts.EX * 1000).unref?.();
      }
    },
    async get(key) { return memory.map.get(key); },
    isOpen: true,
  };
}

export async function connectRedis() {
  if (redis.connect && !redis.isOpen) await redis.connect();
}

export { redis };
