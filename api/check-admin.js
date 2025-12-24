import { pool } from './src/db.js';

async function checkAdmin() {
  try {
    const res = await pool.query('SELECT id, email, role, password_hash FROM users WHERE email=$1', ['admin@mzansimart.co.za']);
    console.log('Admin user in database:');
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkAdmin();
