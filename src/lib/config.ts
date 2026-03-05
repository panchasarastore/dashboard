/**
 * Central configuration for the Dashboard application.
 * Centralizes environment variable handling and validation to prevent leaks
 * and ensure proper fallback behavior.
 */

import { getStoreBaseUrl } from './urlUtils';

const getEnvVar = (key: string, fallback?: string): string => {
    const value = import.meta.env[key];
    if (!value && fallback === undefined) {
        throw new Error(`Environment variable ${key} is required but not defined.`);
    }
    return value || fallback || '';
};

export const config = {
    supabase: {
        url: getEnvVar('VITE_SUPABASE_URL'),
        anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    },
    store: {
        baseUrl: getStoreBaseUrl(),
    },
    app: {
        env: import.meta.env.MODE,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
    }
} as const;

export type Config = typeof config;
