import { pool, ensureSchema } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed default admin user for development
 * 
 * DEFAULT ADMIN CREDENTIALS:
 * Email: admin@mzansimart.co.za
 * Password: Admin@123
 */

async function seedAdmin() {
  // Ensure schema exists first
  await ensureSchema();
  const email = 'admin@mzansimart.co.za';
  const password = 'Admin@123';
  
  console.log('🔧 Seeding default admin user...');
  
  try {
    // Check if admin already exists
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    
    if (rows.length > 0) {
      console.log('✅ Admin user already exists');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      
      // Ensure role is admin
      await pool.query('UPDATE users SET role=$1 WHERE email=$2', ['admin', email]);
      console.log('✅ Role updated to admin');
      return;
    }
    
    // Create new admin user
    const id = uuidv4();
    const hash = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users(id, email, role, password_hash) VALUES($1, $2, $3, $4)',
      [id, email, 'admin', hash]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  DEFAULT ADMIN CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');
    console.log('');
    
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    throw err;
  }
}

// Run if called directly
seedAdmin()
  .then(() => {
    console.log('✅ Seed complete');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });

export { seedAdmin };
