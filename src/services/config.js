import { Capacitor } from '@capacitor/core';

export const DEFAULT_PUBLIC_AI_SERVER = 'https://los-fisher-fighter-interval.trycloudflare.com';

export function getApiUrl() {
    // 1. Check user-configured override in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
        const customUrl = window.localStorage.getItem('agrosense_api_url');
        if (customUrl && customUrl.trim()) {
            const cleanUrl = customUrl.trim().endsWith('/') ? customUrl.trim().slice(0, -1) : customUrl.trim();
            const isHttpsPage = window.location.protocol === 'https:';
            const isLocalTarget = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1') || cleanUrl.startsWith('http://');

            // If we are on an HTTPS web page (e.g. Netlify/Vercel), browsers strictly block plain HTTP to localhost
            if (isHttpsPage && isLocalTarget) {
                console.warn('[API Config] Ignoring insecure HTTP localhost URL on HTTPS site. Falling back to secure AI tunnel.');
                window.localStorage.removeItem('agrosense_api_url');
            } else {
                return cleanUrl;
            }
        }
    }

    // 2. Check environment definition
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }

    // 3. Native Capacitor Mobile Target (Android APK)
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
        return DEFAULT_PUBLIC_AI_SERVER;
    }

    // 4. Web Browser Fallback
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isLocalhost) {
            return 'http://localhost:3001';
        }
        // If accessed via port 5173 on local network IP, map to API port 3001
        if (window.location.port === '5173') {
            return `${window.location.protocol}//${window.location.hostname}:3001`;
        }
        // If accessed from Netlify, Vercel, or external cloud domain, route to the live Cloudflare AI tunnel
        if (hostname.includes('netlify.app') || hostname.includes('vercel.app') || hostname.includes('github.io')) {
            return DEFAULT_PUBLIC_AI_SERVER;
        }
        return window.location.origin;
    }

    return DEFAULT_PUBLIC_AI_SERVER;
}


export function setCustomApiUrl(url) {
    if (typeof window !== 'undefined' && window.localStorage) {
        if (url) {
            window.localStorage.setItem('agrosense_api_url', url);
        } else {
            window.localStorage.removeItem('agrosense_api_url');
        }
    }
}
