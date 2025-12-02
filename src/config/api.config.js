/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// API Base URL - can be overridden by environment variables
export const API_CONFIG = {
    // Base URL for the ThuocGiaThatAdmin.Server API
    BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://192.168.1.150/api',

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

    // BusinessType endpoints
    BUSINESS_TYPE: {
        GET_ALL: '/businesstype',
        CREATE: '/businesstype',
        GET_BY_ID: (id) => `/businesstype/${id}`,
        UPDATE: (id) => `/businesstype/${id}`,
        DELETE: (id) => `/businesstype/${id}`,
    },

    // Category endpoints
    CATEGORY: {
        GET_ALL: `/category`,
        CREATE: `/category`,
        GET_BY_ID: (id) => `/category/${id}`,
        UPDATE: (id) => `/category/${id}`,
        DELETE: (id) => `/category/${id}`,
        GET_ROOT: `/category/root`,
        GET_CHILDREN: (parentId) => `/Category/${parentId}/children`,
        GET_ALL_CHILDREN: `/category/allchildren`,
        GET_HIERARCHY: `/Category/hierarchy`,
        GET_FLAT_LIST: `/category/flat`,
        SEARCH: `/category/search`,
    },

    // File Upload endpoints
    FILE_UPLOAD: {
        UPLOAD: '/fileupload/upload',
        DELETE: (id) => `/fileupload/${id}`,
    },

    // Product endpoints
    PRODUCT: {
        GET_ALL: '/product',
        CREATE: '/product',
        GET_BY_ID: (id) => `/product/${id}`,
        GET_BY_CATEGORY: (categoryId) => `/product/category/${categoryId}`,
        SEARCH: '/product/search',
        GET_PAGED: '/product/getPagedProducts',
        ADD_TO_CART: '/product/cart',
    },

    // File Upload endpoints
    FILE_UPLOAD: {
        UPLOAD: '/fileupload/upload',
        DELETE: (id) => `/fileupload/${id}`,
    },

    // Product Option endpoints
    PRODUCT_OPTION: {
        GET_ALL: '/productoption',
        GET_BY_ID: (id) => `/productoption/${id}`,
        GET_VALUES: (id) => `/productoption/${id}/values`,
        UPDATE: (id) => `/productoption/${id}`,
        DELETE: (id) => `/productoption/${id}`,
    },

    // Province endpoints
    PROVINCE: {
        GET_ALL: '/province',
        GET_BY_ID: (id) => `/province/${id}`,
    },

    // Country endpoints
    COUNTRY: {
        GET_ALL: '/country',
        GET_BY_ID: (id) => `/country/${id}`,
    },

    // Ward endpoints
    WARD: {
        GET_ALL: '/ward',
        GET_BY_ID: (id) => `/ward/${id}`,
    },

    // Warehouse endpoints
    WAREHOUSE: {
        GET_ALL: '/warehouse',
        CREATE: '/warehouse',
        GET_BY_ID: (id) => `/warehouse/${id}`,
        UPDATE: (id) => `/warehouse/${id}`,
        DELETE: (id) => `/warehouse/${id}`,
        GET_ACTIVE: '/warehouse/active',
    },

    // Inventory endpoints
    INVENTORY: {
        PURCHASE: '/inventory/purchase',
        GET_BY_WAREHOUSE: (warehouseId) => `/inventory/warehouse/${warehouseId}`,
        GET_LOW_STOCK: '/inventory/low-stock',
    },

    // Order endpoints
    ORDER: {
        CUSTOMER_PLACE_ORDER: '/order/customer/place-order',
        ADMIN_CREATE_ORDER: '/order/admin/create-order',
        GET_BY_ID: (id) => `/order/${id}`,
        GET_ALL: '/order',
    },

    // StockAlert endpoints
    STOCK_ALERT: {
        GET_UNREAD: '/stockalert/unread',
        GET_UNRESOLVED: '/stockalert/unresolved',
        GET_BY_TYPE: (type) => `/stockalert/type/${type}`,
        GET_BY_PRIORITY: (priority) => `/stockalert/priority/${priority}`,
        MARK_AS_READ: (id) => `/stockalert/${id}/read`,
        RESOLVE: (id) => `/stockalert/${id}/resolve`,
    },

    // Token endpoints
    TOKEN: {
        LOGIN: '/token',
    },

    // User endpoints
    USER: {
        CREATE: '/user',
        UPDATE: (id) => `/user/${id}`,
        GET_BY_ID: (id) => `/user/${id}`,
        GET_PROFILE: '/user/profile/me',
    },

    // FileUpload endpoints
    FILE_UPLOAD: {
        UPLOAD_SINGLE: '/fileupload/upload',
        UPLOAD_MULTIPLE: '/fileupload/upload-multiple',
        DELETE: (id) => `/fileupload/${id}`,
        DELETE_PERMANENT: (id) => `/fileupload/${id}/permanent`,
    },

    // Customer endpoints
    CUSTOMER: {
        GET_ALL: '/customer',
        CREATE: '/customer',
        GET_BY_ID: (id) => `/customer/${id}`,
        UPDATE: (id) => `/customer/${id}`,
    },

    // Customer Auth endpoints
    CUSTOMER_AUTH: {
        REGISTER: '/customer/auth/register',
        LOGIN: '/customer/auth/login',
        LOGOUT: '/customer/auth/logout',
        GET_PROFILE: '/customer/auth/profile',
        UPDATE_PROFILE: '/customer/auth/profile',
    },

    // Customer Business endpoints
    CUSTOMER_BUSINESS: {
        GET_BUSINESS_INFO: '/customer/business-info',
        UPDATE_BUSINESS_INFO: '/customer/business-info',
    },

    // Shopping Cart endpoints
    SHOPPING_CART: {
        GET_CART: '/ShoppingCart',
        MERGE_CART: '/ShoppingCart',
        GET_SUMMARY: '/ShoppingCart/summary',
        ADD_TO_CART: '/ShoppingCart/add',
        UPDATE_ITEM: (id) => `/ShoppingCart/items/${id}`,
        REMOVE_ITEM: (id) => `/ShoppingCart/items/${id}`,
        CLEAR_CART: '/ShoppingCart/clear',
    },
};
