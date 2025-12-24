import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
  config.supabase.url || '',
  config.supabase.serviceRoleKey || ''
);
