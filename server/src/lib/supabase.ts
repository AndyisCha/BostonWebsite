import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  hasAnonKey: !!supabaseAnonKey,
  nodeEnv: process.env.NODE_ENV
});

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error(`Missing Supabase environment variables. URL: ${!!supabaseUrl}, Service Key: ${!!supabaseServiceKey}, Anon Key: ${!!supabaseAnonKey}`);
}

// Admin client for server-side operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular client for user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);