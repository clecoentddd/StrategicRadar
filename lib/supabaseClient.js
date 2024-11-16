// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Singleton pattern to create a single instance of the client
let supabase;

if (typeof window !== 'undefined') {
  // Ensure we only create the client once
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
}

export default supabase;