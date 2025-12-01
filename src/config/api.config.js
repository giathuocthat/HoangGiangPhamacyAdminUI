// /**
//  * API Configuration
//  * Centralized configuration for API endpoints
//  */

// // API Base URL - can be overridden by environment variables
// export const API_CONFIG = {
//     // Base URL for the ThuocGiaThatAdmin.Server API
//     BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api',

//     // Timeout for API requests (in milliseconds)
//     TIMEOUT: 30000,

//     // Default headers for all requests
//     DEFAULT_HEADERS: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
// };

// // API Endpoints
// export const API_ENDPOINTS = {
//     // Brand endpoints
//     BRAND: {
//         GET_ALL: '/brand',
//         GET_BY_ID: (id) => `/brand/${id}`,
//         UPDATE: (id) => `/brand/${id}`,
//         DELETE: (id) => `/brand/${id}`,
//     },

//     // Product endpoints
//     PRODUCT: {
//         GET_ALL: '/products',  // Changed to match your backend
//         GET_BY_ID: (id) => `/products/${id}`,
//         GET_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
//         SEARCH: '/products/search',
//         GET_META: '/products/meta',  // Added for dropdown metadata
//     },
// };

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
        GET_ALL: '/Brand',
        GET_BY_ID: (id) => `/Brand/${id}`,
        UPDATE: (id) => `/Brand/${id}`,
        DELETE: (id) => `/Brand/${id}`,
    },

    // Product endpoints - FIXED: Match backend controller name (Product with capital P)
    PRODUCT: {
        GET_ALL: '/products',              // Changed from /products to /products
        GET_BY_ID: (id) => `/products/${id}`,
        GET_BY_CATEGORY: (categoryId) => `/products/category/${categoryId}`,
        SEARCH: '/products/search',        // Changed from /products/search
        GET_META: '/products/meta',        // Changed from /products/meta
    },

    // ProductOption endpoints
    PRODUCT_OPTION: {
        GET_ALL: '/ProductOption',
        GET_BY_ID: (id) => `/ProductOption/${id}`,
    },

    // Country endpoints
    COUNTRY: {
        GET_ALL: '/Country',
        GET_BY_ID: (id) => `/Country/${id}`,
    },

    // Province endpoints
    PROVINCE: {
        GET_ALL: '/Province',
        GET_BY_ID: (id) => `/Province/${id}`,
    },

    // User endpoints
    USER: {
        GET_ALL: '/User',
        GET_BY_ID: (id) => `/User/${id}`,
    },

    // Ward endpoints
    WARD: {
        GET_ALL: '/Ward',
        GET_BY_ID: (id) => `/Ward/${id}`,
    },

    // FileUpload endpoints
    FILE_UPLOAD: {
        UPLOAD: '/FileUpload/upload',
    },

    // Token endpoints
    TOKEN: {
        REFRESH: '/Token/refresh',
    },
};