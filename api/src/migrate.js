import { ensureSchema } from './db.js';
import { pool } from './db.js';

await ensureSchema();
await pool.end();
console.log('Schema ensured');
