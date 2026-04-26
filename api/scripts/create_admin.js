import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../src/db.js';

async function run() {
  try {
    const email = 'digitalsphere33@gmail.com';
    const pwd = 'Admin@123';
    const hash = bcrypt.hashSync(pwd, 10);
    const id = uuidv4();
    const res = await pool.query('INSERT INTO users(id,email,role) VALUES($1,$2,$3) ON CONFLICT (email) DO UPDATE SET role=EXCLUDED.role RETURNING id', [id, email, 'admin']);
    const uid = res.rows[0].id;
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, uid]);
    console.log('OK', uid);
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
}

run();
