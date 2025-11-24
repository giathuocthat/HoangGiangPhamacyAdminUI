/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// API Base URL - can be overridden by environment variables
export const API_CONFIG = {
    // Base URL for the ThuocGiaThatAdmin.Server API
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api',

    // Timeout for API requests (in milliseconds)
    TIMEOUT: 30000,

    // Default headers for all requests
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
};

// API Endpoints
export const API_ENDPOINTS = {
    // Brand endpoints
    BRAND: {
        GET_ALL: '/brand',
        GET_BY_ID: (id) => `/brand/${id}`,
        UPDATE: (id) => `/brand/${id}`,
        DELETE: (id) => `/brand/${id}`,
    },

    // Product endpoints
    PRODUCT: {
        GET_ALL: '/product',
        GET_BY_ID: (id) => `/product/${id}`,
        GET_BY_CATEGORY: (categoryId) => `/product/category/${categoryId}`,
        SEARCH: '/product/search',
    },
};
