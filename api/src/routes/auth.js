import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../redis.js';

export default async function authRoutes(app) {
  app.post('/register', async (req, reply) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return reply.code(400).send({ error: 'Email and password required' });
      }
      
      const id = uuidv4();
      const hash = await bcrypt.hash(password, 10);
      const role = 'buyer';
      
      await pool.query('INSERT INTO users(id,email,role) VALUES($1,$2,$3)', [id, email, role]);
      await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, id]);
      const token = app.jwt.sign({ sub: id, role });
      return reply.send({ token, id, email });
    } catch (err) {
      if (err.message.includes('duplicate') || err.code === '23505') {
        return reply.code(400).send({ error: 'Email already registered' });
      }
      console.error('Register error:', err);
      return reply.code(500).send({ error: 'Registration failed' });
    }
  });

  app.post('/login', async (req, reply) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return reply.code(400).send({ error: 'Email and password required' });
      }
      console.log('[AUTH] Login attempt for:', email);
      const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
      console.log('[AUTH] User found:', rows.length > 0);
      
      if (!rows.length) {
        console.log('[AUTH] User not found');
        return reply.code(400).send({ error: 'Invalid credentials' });
      }
      
      const user = rows[0];
      console.log('[AUTH] User role:', user.role, 'Has password_hash:', !!user.password_hash);
      
      const stored = user.password_hash;
      if (!stored) {
        console.log('[AUTH] No password hash stored');
        return reply.code(400).send({ error: 'Invalid credentials' });
      }
      
      const passwordMatch = await bcrypt.compare(password, stored);
      console.log('[AUTH] Password match:', passwordMatch);
      
      if (!passwordMatch) {
        console.log('[AUTH] Password does not match');
        return reply.code(400).send({ error: 'Invalid credentials' });
      }
      
      const token = app.jwt.sign({ sub: user.id, role: user.role });
      console.log('[AUTH] Login successful, token issued');
      return reply.send({ token });
    } catch (err) {
      console.error('[AUTH] Login error:', err);
      return reply.code(500).send({ error: 'Login failed' });
    }
  });

  // Email/phone verification (dev: returns code, prod: would send)
  app.post('/verify/request', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const { sub } = req.user;
      await redis.set(`verify:${sub}`, code);
      return { code, message: 'Use this code to verify (dev only)' };
    } catch (err) {
      console.error('Verify request error:', err);
      return reply.code(500).send({ error: 'Verification request failed' });
    }
  });

  app.post('/verify/confirm', { preValidation: [app.verifyJwt] }, async (req, reply) => {
    try {
      const { code } = req.body;
      const { sub } = req.user;
      const real = await redis.get(`verify:${sub}`);
      if (code !== real) return reply.code(400).send({ error: 'Invalid code' });
      await pool.query('UPDATE sellers SET kyc_status=$1 WHERE user_id=$2', ['verified', sub]);
      return { status: 'verified' };
    } catch (err) {
      console.error('Verify confirm error:', err);
      return reply.code(500).send({ error: 'Verification failed' });
    }
  });
}
