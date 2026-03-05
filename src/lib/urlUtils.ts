/**
 * Utility to dynamically determine the store's base URL based on the current dashboard hostname.
 * This allows the dashboard to point to the correct store domain in both production and development.
 */
export const getStoreBaseUrl = (): string => {
    // If we are in a server-side environment (like during a build), use the environment variable
    if (typeof window === 'undefined') {
        return import.meta.env.VITE_STORE_BASE_URL || 'http://localhost:4321';
    }

    const { hostname, protocol } = window.location;

    // Production dashboard domain mapping
    if (hostname === 'dashboard.pnsara.store') {
        return 'https://pnsara.store';
    }

    // Local development handling
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return import.meta.env.VITE_STORE_BASE_URL || 'http://localhost:4321';
    }

    // Generic subdomain mapping: dashboard.domain.com -> https://domain.com
    if (hostname.startsWith('dashboard.')) {
        const rootDomain = hostname.replace('dashboard.', '');
        // If it's a known production-like domain, ensure HTTPS
        if (rootDomain.includes('pnsara.store')) {
            return `https://${rootDomain}`;
        }
        return `${protocol}//${rootDomain}`;
    }

    // Final fallback to environment variable or current origin
    return import.meta.env.VITE_STORE_BASE_URL || `${protocol}//${hostname.replace('dashboard.', '')}`;
};
