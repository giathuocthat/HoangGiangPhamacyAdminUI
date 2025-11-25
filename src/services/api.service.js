import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

/**
 * Base API Service
 * Provides common HTTP methods for API calls
 */
class ApiService {
    constructor(baseURL = API_CONFIG.BASE_URL) {
        this.baseURL = baseURL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    }

    /**
     * Build full URL with query parameters
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {string} Full URL with query string
     */
    buildUrl(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }

    /**
     * Generic HTTP request method
     * @param {string} url - Request URL
     * @param {Object} options - Fetch options
     * @returns {Promise} Response data
     */
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.defaultHeaders,
                    ...options.headers,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle non-OK responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP Error: ${response.status} ${response.statusText}`);
            }

            // Parse JSON response
            const data = await response.json();
            return data;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }

            throw error;
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise} Response data
     */
    async get(endpoint, params = {}) {
        const url = this.buildUrl(endpoint, params);
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise} Response data
     */
    async post(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise} Response data
     */
    async put(endpoint, data = {}) {
        const url = `${this.baseURL}${endpoint}`;
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise} Response data
     */
    async delete(endpoint) {
        const url = `${this.baseURL}${endpoint}`;
        return this.request(url, { method: 'DELETE' });
    }
}

/**
 * Brand API Service
 * Handles all Brand-related API calls
 */
class BrandApiService extends ApiService {
    /**
     * Get brands with pagination
     * @param {number} pageNumber - Page number (default: 1)
     * @param {number} pageSize - Page size (default: 10)
     * @returns {Promise} Paginated brand data
     */
    async getBrands(pageNumber = 1, pageSize = 10) {
        return this.get(API_ENDPOINTS.BRAND.GET_ALL, { pageNumber, pageSize });
    }

    /**
     * Get brand by ID
     * @param {number} id - Brand ID
     * @returns {Promise} Brand details
     */
    async getBrandById(id) {
        return this.get(API_ENDPOINTS.BRAND.GET_BY_ID(id));
    }

    /**
     * Update brand
     * @param {number} id - Brand ID
     * @param {Object} brandData - Brand data to update
     * @returns {Promise} Update confirmation
     */
    async updateBrand(id, brandData) {
        return this.put(API_ENDPOINTS.BRAND.UPDATE(id), brandData);
    }

    /**
     * Delete brand
     * @param {number} id - Brand ID
     * @returns {Promise} Delete confirmation
     */
    async deleteBrand(id) {
        return this.delete(API_ENDPOINTS.BRAND.DELETE(id));
    }
}

/**
 * Product API Service
 * Handles all Product-related API calls
 */
class ProductApiService extends ApiService {
    /**
     * Get products with pagination, filtering, and sorting
     * @param {Object} options - Query options
     * @param {number} options.page - Page number
     * @param {number} options.rows - Rows per page
     * @param {string} options.category - Filter by category
     * @param {string} options.brand - Filter by brand
     * @param {string} options.product - Filter by product name
     * @param {string} options.createdby - Filter by creator
     * @param {string} options.sortField - Field to sort by
     * @param {string} options.sortOrder - Sort order (asc/desc)
     * @returns {Promise} Paginated product data
     */
    async getProducts(options = {}) {
        const params = {};
        
        // Pagination
        if (options.page) params.page = options.page;
        if (options.rows) params.rows = options.rows;
        
        // Filters
        if (options.category) params.category = options.category;
        if (options.brand) params.brand = options.brand;
        if (options.product) params.product = options.product;
        if (options.createdby) params.createdby = options.createdby;
        
        // Sorting
        if (options.sortField) params.sortField = options.sortField;
        if (options.sortOrder) params.sortOrder = options.sortOrder;
        
        return this.get(API_ENDPOINTS.PRODUCT.GET_ALL, params);
    }

    /**
     * Get product metadata for dropdowns
     * @returns {Promise} Metadata including categories, brands, etc.
     */
    async getProductMeta() {
        return this.get(API_ENDPOINTS.PRODUCT.GET_META);
    }

    /**
     * Get product by ID
     * @param {number} id - Product ID
     * @returns {Promise} Product details
     */
    async getProductById(id) {
        return this.get(API_ENDPOINTS.PRODUCT.GET_BY_ID(id));
    }

    /**
     * Get products by category
     * @param {number} categoryId - Category ID
     * @returns {Promise} List of products in category
     */
    async getProductsByCategory(categoryId) {
        return this.get(API_ENDPOINTS.PRODUCT.GET_BY_CATEGORY(categoryId));
    }

    /**
     * Search products by name
     * @param {string} name - Product name to search
     * @returns {Promise} List of matching products
     */
    async searchProducts(name) {
        return this.get(API_ENDPOINTS.PRODUCT.SEARCH, { name });
    }
}

// Export singleton instances
export const brandApi = new BrandApiService();
export const productApi = new ProductApiService();

// Export classes for custom instances if needed
export { BrandApiService, ProductApiService, ApiService };