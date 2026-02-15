import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

export const supabase = createBrowserClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
