import { pool } from './src/db.js';
import bcrypt from 'bcryptjs';

async function testLogin() {
  try {
    const email = 'admin@mzansimart.co.za';
    const password = 'Admin@123';
    
    console.log('Testing login for:', email);
    
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    
    if (!rows.length) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    const user = rows[0];
    console.log('✅ User found:', user.email, 'Role:', user.role);
    console.log('Password hash exists:', !!user.password_hash);
    
    if (!user.password_hash) {
      console.log('❌ No password hash stored');
      process.exit(1);
    }
    
    const match = await bcrypt.compare(password, user.password_hash);
    console.log('Password match:', match ? '✅ YES' : '❌ NO');
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testLogin();
