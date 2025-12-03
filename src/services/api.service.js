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
            // Merge headers - options.headers should override defaultHeaders
            const mergedHeaders = {
                ...this.defaultHeaders,
                ...options.headers,
            };

            // Remove any headers that are explicitly set to undefined/null
            Object.keys(mergedHeaders).forEach(key => {
                if (mergedHeaders[key] === undefined || mergedHeaders[key] === null) {
                    delete mergedHeaders[key];
                }
            });

            const response = await fetch(url, {
                ...options,
                headers: mergedHeaders,
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
     * Get all products
     * @returns {Promise} List of all products
     */
    async getAllProducts() {
        return this.get(API_ENDPOINTS.PRODUCT.GET_ALL);
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

    /**
     * Create a new product
     * @param {Object} productData - Product data to create
     * @returns {Promise} Created product
     */
    async createProduct(productData) {
        return this.post(API_ENDPOINTS.PRODUCT.GET_ALL, productData); // Assuming POST /product creates a product
    }

    /**
     * Update an existing product
     * @param {number} id - Product ID
     * @param {Object} productData - Product data to update
     * @returns {Promise} Updated product
     */
    async updateProduct(id, productData) {
        return this.put(API_ENDPOINTS.PRODUCT.GET_BY_ID(id), productData);
    }
}

/**
 * Category API Service
 */
class CategoryApiService extends ApiService {
    async getAllCategories() {
        return this.get(API_ENDPOINTS.CATEGORY.GET_ALL);
    }
}

/**
 * File Upload API Service
 */
class FileUploadApiService extends ApiService {
    async uploadFile(file, uploadSource = 0, relatedEntityId = null, vendorId = null, description = null) {
        console.log('FileUploadApiService.uploadFile called with:', {
            file: file ? { name: file.name, size: file.size, type: file.type } : null,
            uploadSource,
            relatedEntityId,
            vendorId,
            description
        });

        const formData = new FormData();
        // Try uppercase 'File' - ASP.NET Core usually expects PascalCase
        formData.append('File', file);
        if (uploadSource !== null) formData.append('UploadSource', uploadSource);
        if (relatedEntityId !== null) formData.append('RelatedEntityId', relatedEntityId);
        if (vendorId !== null) formData.append('VendorId', vendorId);
        if (description !== null) formData.append('Description', description);

        // Log FormData contents
        console.log('FormData entries:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        const url = `${this.baseURL}${API_ENDPOINTS.FILE_UPLOAD.UPLOAD}`;
        console.log('Upload URL:', url);

        // For FormData, we must NOT set Content-Type - let browser set it with boundary
        // Set to undefined so it gets removed in the request method
        const headers = {
            'Content-Type': undefined,  // This will be removed by the request method
            'Accept': 'application/json'
        };

        return this.request(url, {
            method: 'POST',
            body: formData,
            headers: headers
        });
    }

    async deleteFile(id) {
        return this.delete(API_ENDPOINTS.FILE_UPLOAD.DELETE(id));
    }
}

/**
 * Product Option API Service
 * Handles all Product Option-related API calls
 */
class ProductOptionApiService extends ApiService {
    /**
     * Get all product options with their values
     * @returns {Promise} List of product options
     */
    async getAllOptions() {
        return this.get(API_ENDPOINTS.PRODUCT_OPTION.GET_ALL);
    }

    /**
     * Get product option by ID
     * @param {number} id - Product Option ID
     * @returns {Promise} Product option details
     */
    async getOptionById(id) {
        return this.get(API_ENDPOINTS.PRODUCT_OPTION.GET_BY_ID(id));
    }

    /**
     * Get option values by option ID
     * @param {number} optionId - Product Option ID
     * @returns {Promise} List of option values
     */
    async getOptionValues(optionId) {
        return this.get(API_ENDPOINTS.PRODUCT_OPTION.GET_VALUES(optionId));
    }
}

/**
 * Customer API Service
 * Handles all Customer-related API calls
 */
class CustomerApiService extends ApiService {
    /**
     * Search customers by phone number
     * @param {string} phoneNumber - Phone number to search
     * @returns {Promise} List of matching customers
     */
    async searchByPhone(phoneNumber) {
        return this.get(API_ENDPOINTS.CUSTOMER.SEARCH, { phoneNumber });
    }

    /**
     * Create a new customer
     * @param {Object} customerData - Customer data
     * @returns {Promise} Created customer
     */
    async createCustomer(customerData) {
        return this.post(API_ENDPOINTS.CUSTOMER.CREATE, customerData);
    }

    /**
     * Get customer by ID
     * @param {number} id - Customer ID
     * @returns {Promise} Customer details
     */
    async getCustomerById(id) {
        return this.get(API_ENDPOINTS.CUSTOMER.GET_BY_ID(id));
    }

    /**
     * Get all customers with pagination
     * @param {number} pageNumber - Page number
     * @param {number} pageSize - Page size
     * @returns {Promise} Paginated customer data
     */
    async getCustomers(pageNumber = 1, pageSize = 10) {
        return this.get(API_ENDPOINTS.CUSTOMER.GET_ALL, { pageNumber, pageSize });
    }
}

/**
 * Business Type API Service
 */
class BusinessTypeApiService extends ApiService {
    /**
     * Get all business types
     * @param {number} pageNumber - Page number
     * @param {number} pageSize - Page size
     * @returns {Promise} Business types
     */
    async getAll(pageNumber = 1, pageSize = 100) {
        return this.get(API_ENDPOINTS.BUSINESS_TYPE.GET_ALL, { pageNumber, pageSize });
    }
}

/**
 * Province API Service
 */
class ProvinceApiService extends ApiService {
    /**
     * Get all provinces
     * @param {number} pageNumber - Page number
     * @param {number} pageSize - Page size
     * @returns {Promise} Provinces
     */
    async getAll(pageNumber = 1, pageSize = 100) {
        return this.get(API_ENDPOINTS.PROVINCE.GET_ALL, { pageNumber, pageSize });
    }
}

/**
 * Ward API Service
 */
class WardApiService extends ApiService {
    /**
     * Get wards by province ID
     * @param {number} provinceId - Province ID
     * @returns {Promise} Wards
     */
    async getByProvince(provinceId) {
        return this.get(API_ENDPOINTS.WARD.GET_BY_PROVINCE(provinceId));
    }
}

/**
 * Order API Service
 */
class OrderApiService extends ApiService {
    /**
     * Get orders with pagination and search
     * @param {number} pageNumber - Page number
     * @param {number} pageSize - Page size
     * @param {string} searchText - Search text (phone, email, order number)
     * @returns {Promise} Paginated orders
     */
    async getOrders(pageNumber = 1, pageSize = 10, searchText = null) {
        const params = { pageNumber, pageSize };
        if (searchText) {
            params.searchText = searchText;
        }
        return this.get(API_ENDPOINTS.ORDER.GET_LIST, params);
    }

    /**
     * Get order by ID
     * @param {number} id - Order ID
     * @returns {Promise} Order details
     */
    async getOrderById(id) {
        return this.get(API_ENDPOINTS.ORDER.GET_BY_ID(id));
    }

    /**
     * Create order from customer (ecommerce)
     * @param {Object} orderData - Order data
     * @returns {Promise} Created order
     */
    async createCustomerOrder(orderData) {
        return this.post(API_ENDPOINTS.ORDER.CREATE_CUSTOMER_ORDER, orderData);
    }

    /**
     * Create order from admin
     * @param {Object} orderData - Order data
     * @returns {Promise} Created order
     */
    async createAdminOrder(orderData) {
        return this.post(API_ENDPOINTS.ORDER.CREATE_ADMIN_ORDER, orderData);
    }

    /**
     * Update order status
     * @param {number} id - Order ID
     * @param {string} newStatus - New status
     * @returns {Promise} Updated order
     */
    async updateOrderStatus(id, newStatus) {
        return this.put(API_ENDPOINTS.ORDER.UPDATE_STATUS(id), { newStatus });
    }
}


// Export singleton instances
export const brandApi = new BrandApiService();
export const productApi = new ProductApiService();
export const categoryApi = new CategoryApiService();
export const fileUploadApi = new FileUploadApiService();
export const productOptionApi = new ProductOptionApiService();
export const customerApi = new CustomerApiService();
export const businessTypeApi = new BusinessTypeApiService();
export const provinceApi = new ProvinceApiService();
export const wardApi = new WardApiService();
export const orderApi = new OrderApiService();

// Export classes for custom instances if needed
export {
    BrandApiService,
    ProductApiService,
    CategoryApiService,
    FileUploadApiService,
    ProductOptionApiService,
    CustomerApiService,
    BusinessTypeApiService,
    ProvinceApiService,
    WardApiService,
    OrderApiService,
    ApiService
};

