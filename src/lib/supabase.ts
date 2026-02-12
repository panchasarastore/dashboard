import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

// Custom storage to share session across ports (localhost:4321 and localhost:8080)
const cookieStorage = {
    getItem: (key: string) => {
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find(c => c.startsWith(`${key}=`));
        return cookie ? decodeURIComponent(cookie.substring(key.length + 1)) : null;
    },
    setItem: (key: string, value: string) => {
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
    },
    removeItem: (key: string) => {
        document.cookie = `${key}=; path=/; max-age=-1; SameSite=Lax`;
    }
};

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: cookieStorage,
            storageKey: 'sb-auth-token',
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);
