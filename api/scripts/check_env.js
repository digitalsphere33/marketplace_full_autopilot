import { fileURLToPath } from 'url';

const required = [
  'JWT_SECRET',
  'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE',
  // optional but recommended
  'REDIS_URL',
  'PAYFAST_MERCHANT_ID', 'PAYFAST_MERCHANT_KEY', 'PAYFAST_PASSPHRASE',
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'SENTRY_DSN'
];

function check() {
  const missing = [];
  required.forEach(k => {
    if (!process.env[k]) missing.push(k);
  });
  console.log('Environment check:');
  if (!missing.length) {
    console.log('  All required environment variables are set (or optional ones are present).');
  } else {
    console.log('  Missing variables:');
    missing.forEach(m => console.log('   -', m));
  }
  console.log('\nTo complete setup, obtain the following credentials and set them in your environment or in api/.env:');
  console.log('- PayFast merchant id/key/passphrase: https://www.payfast.co.za/ (Documentation: https://www.payfast.co.za/documentation/)');
  console.log('- Supabase project URL and service role key: https://app.supabase.com/ -> Project -> Settings -> API');
  console.log('- Sentry DSN (optional): https://sentry.io/');
  console.log('- Redis / Postgres connection: use hosted provider or local services');
}

// Run if executed directly
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) check();

export default check;
