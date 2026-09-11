import { Capacitor } from '@capacitor/core';

export function getApiUrl() {
    // 1. Check user-configured override in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
        const customUrl = window.localStorage.getItem('agrosense_api_url');
        if (customUrl && customUrl.trim()) {
            return customUrl.trim().endsWith('/') ? customUrl.trim().slice(0, -1) : customUrl.trim();
        }
    }

    // 2. Check environment definition
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl) {
        return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }

    // 3. Native Capacitor Mobile Target (Android APK)
    if (typeof window !== 'undefined' && Capacitor.isNativePlatform()) {
        return 'http://172.16.1.78:3001';
    }

    // 4. Web Browser Fallback
    if (typeof window !== 'undefined' && window.location) {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) {
            return 'http://localhost:3001';
        }
        // If accessed via port 5173 on network IP, map to API port 3001
        if (window.location.port === '5173') {
            return `${window.location.protocol}//${window.location.hostname}:3001`;
        }
        return window.location.origin;
    }

    return 'http://172.16.1.78:3001';
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
