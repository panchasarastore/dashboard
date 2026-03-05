import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env.local file.');
}

// Match storefront storage key
export const STORAGE_KEY = 'sb-auth-token';

const cookieStorage = {
    getItem: (key: string) => {
        if (typeof document === 'undefined') return null;
        const cookies = document.cookie.split('; ');
        const cookie = cookies.find(c => c.startsWith(`${key}=`));
        return cookie ? decodeURIComponent(cookie.substring(key.length + 1)) : null;
    },
    setItem: (key: string, value: string) => {
        if (typeof document === 'undefined') return;
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const domain = isLocal ? '' : '; domain=.pnsara.store';
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${domain}`;
    },
    removeItem: (key: string) => {
        if (typeof document === 'undefined') return;
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const domain = isLocal ? '' : '; domain=.pnsara.store';
        document.cookie = `${key}=; path=/; max-age=-1; SameSite=Lax${domain}`;
    }
};

export const supabase = createBrowserClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            storage: cookieStorage,
            storageKey: STORAGE_KEY,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);
