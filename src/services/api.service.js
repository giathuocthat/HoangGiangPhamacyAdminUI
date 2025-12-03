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
    // async request(url, options = {}) {
    //     const controller = new AbortController();
    //     const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    //     try {
    //         const response = await fetch(url, {
    //             ...options,
    //             headers: {
    //                 ...this.defaultHeaders,
    //                 ...options.headers,
    //             },
    //             signal: controller.signal,
    //         });

    //         clearTimeout(timeoutId);

    //         // Handle non-OK responses
    //         if (!response.ok) {
    //             const errorData = await response.json().catch(() => ({}));
    //             throw new Error(errorData.message || `HTTP Error: ${response.status} ${response.statusText}`);
    //         }

    //         // Parse JSON response
    //         const data = await response.json();
    //         return data;
    //     } catch (error) {
    //         clearTimeout(timeoutId);

    //         if (error.name === 'AbortError') {
    //             throw new Error('Request timeout');
    //         }

    //         throw error;
    //     }
    // }

    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        // 1. CHUẨN BỊ HEADERS BAN ĐẦU
        const finalHeaders = {
            ...this.defaultHeaders,
            ...options.headers,
        };

        // 2. QUAN TRỌNG: NẾU BODY LÀ FORM DATA, PHẢI XÓA CONTENT-TYPE MẶC ĐỊNH.
        // Trình duyệt sẽ tự thêm Content-Type: multipart/form-data kèm boundary.
        if (options.body instanceof FormData) {
            delete finalHeaders['Content-Type'];
            delete finalHeaders['content-type']; 
        }

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
                headers: finalHeaders, // SỬ DỤNG HEADERS ĐÃ XỬ LÝ
                headers: mergedHeaders,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle non-OK responses
            if (!response.ok) {
                // Thử đọc response.json() để lấy thông báo lỗi chi tiết từ server
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `HTTP Error: ${response.status} ${response.statusText}`;
                
                const error = new Error(errorMessage);
                error.response = response;
                error.data = errorData;
                throw error;
            }

            // Parse JSON response (hoặc response rỗng nếu 204 No Content)
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                return data;
            }
            return response.text().then(text => text || {});
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
     * @param {number} page - Current page number (pageNumber)
     * @param {number} rows - Rows per page (pageSize)
     * @param {string} searchQuery - Search query string
     * @param {string} sortField - Field to sort by
     * @param {string} sortOrder - Sort order ('asc' or 'desc')
     * @returns {Promise} List of brands and total count
     */
    async getBrands(page, rows, searchQuery, sortField, sortOrder) {
        const params = {};
        
        // Pagination parameters
        if (page) params.pageNumber = page; 
        if (rows) params.pageSize = rows;   
        
        // Search and filter parameters
        if (searchQuery) params.searchQuery = searchQuery;
        
        // Sorting parameters (Check if sortField is provided and valid)
        if (sortField) {
            params.sortField = sortField;
            params.sortOrder = sortOrder || 'asc'; // Default sort order
        }
        
        return this.get(API_ENDPOINTS.BRAND.GET_ALL, params);
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
 * BusinessType API Service
 * Handles all BusinessType-related API calls
 */
class BusinessTypeApiService extends ApiService {
    /**
     * Get all business types
     * @returns {Promise} List of business types
     */
    async getBusinessTypes(params = {}) {
        return this.get(API_ENDPOINTS.BUSINESS_TYPE.GET_ALL, params);
    }

    /**
     * Create business type
     * @param {Object} businessTypeData - Business type data to create
     * @returns {Promise} Created business type
     */
    async createBusinessType(businessTypeData) {
        return this.post(API_ENDPOINTS.BUSINESS_TYPE.CREATE, businessTypeData);
    }

    /**
     * Get business type by ID
     * @param {number} id - Business type ID
     * @returns {Promise} Business type details
     */
    async getBusinessTypeById(id) {
        return this.get(API_ENDPOINTS.BUSINESS_TYPE.GET_BY_ID(id));
    }

    /**
     * Update business type
     * @param {number} id - Business type ID
     * @param {Object} businessTypeData - Business type data to update
     * @returns {Promise} Update confirmation
     */
    async updateBusinessType(id, businessTypeData) {
        return this.put(API_ENDPOINTS.BUSINESS_TYPE.UPDATE(id), businessTypeData);
    }

    /**
     * Delete business type
     * @param {number} id - Business type ID
     * @returns {Promise} Delete confirmation
     */
    async deleteBusinessType(id) {
        return this.delete(API_ENDPOINTS.BUSINESS_TYPE.DELETE(id));
    }
}

/**
 * Category API Service
 * Handles all Category-related API calls
 */
class CategoryApiService extends ApiService {
    /**
     * Get all categories
     * @returns {Promise} List of categories
     */
    async getAllCategories() {
        return this.get(API_ENDPOINTS.CATEGORY.GET_ALL);
    }

    /**
     * Create category
     * @param {Object} categoryData - Category data to create
     * @returns {Promise} Created category
     */
    async createCategory(categoryData) {
        return this.post(API_ENDPOINTS.CATEGORY.CREATE, categoryData);
    }

    /**
     * Get category by ID
     * @param {number} id - Category ID
     * @returns {Promise} Category details
     */
    async getCategoryById(id) {
        return this.get(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));
    }

    /**
     * Update category
     * @param {number} id - Category ID
     * @param {Object} categoryData - Category data to update
     * @returns {Promise} Update confirmation
     */
    async updateCategory(id, categoryData) {
        return this.put(API_ENDPOINTS.CATEGORY.UPDATE(id), categoryData);
    }

    /**
     * Delete category
     * @param {number} id - Category ID
     * @returns {Promise} Delete confirmation
     */
    async deleteCategory(id) {
        return this.delete(API_ENDPOINTS.CATEGORY.DELETE(id));
    }

    /**
     * Get root categories
     * @returns {Promise} List of root categories
     */
    async getRootCategories() {
        return this.get(API_ENDPOINTS.CATEGORY.GET_ROOT);
    }

    /**
     * Get children categories of a parent
     * @param {number} parentId - Parent category ID
     * @returns {Promise} List of child categories
     */
    async getChildrenCategories(parentId) {
        return this.get(API_ENDPOINTS.CATEGORY.GET_CHILDREN(parentId));
    }

    /**
     * Get all children categories (all categories with their children)
     * @returns {Promise} All categories with children structure
     */
    async getAllChildrenCategories() {
        return this.get(API_ENDPOINTS.CATEGORY.GET_ALL_CHILDREN);
    }

    /**
     * Get category hierarchy
     * 
     * @returns {Promise} Hierarchical category tree
     */
    async getCategoryHierarchy() {
        return this.get(API_ENDPOINTS.CATEGORY.GET_HIERARCHY);
    }

    /**
     * Get flat list of categories
     * @returns {Promise} Flat list of all categories
     */
    async getFlatCategoryList() {
        return this.get(API_ENDPOINTS.CATEGORY.GET_FLAT_LIST);
    }

    /**
     * Search categories by name
     * @param {string} name - Category name to search
     * @returns {Promise} List of matching categories
     */
    async searchCategories(name) {
        return this.get(API_ENDPOINTS.CATEGORY.SEARCH, { name });
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
     * Create product
     * @param {Object} productData - Product data to create
     * @returns {Promise} Created product
     */
    async createProduct(productData) {
        return this.post(API_ENDPOINTS.PRODUCT.CREATE, productData);
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

    async getPagedProducts(options = {}) {
        return this.get(API_ENDPOINTS.PRODUCT.GET_PAGED, options);
    }

    async addToCart(cartData) {
        return this.post(API_ENDPOINTS.PRODUCT.ADD_TO_CART, cartData);
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

    /**
     * Update product option
     * @param {number} id - Product option ID
     * @param {Object} data - Product option data to update
     * @returns {Promise} Update confirmation
     */
    async updateProductOption(id, data) {
        return this.put(API_ENDPOINTS.PRODUCT_OPTION.UPDATE(id), data);
    }

    /**
     * Delete product option
     * @param {number} id - Product option ID
     * @returns {Promise} Delete confirmation
     */
    async deleteProductOption(id) {
        return this.delete(API_ENDPOINTS.PRODUCT_OPTION.DELETE(id));
    }
}

/**
 * Province API Service
 * Handles all Province-related API calls
 */
class ProvinceApiService extends ApiService {
    /**
     * Get all provinces
     * @returns {Promise} List of provinces
     */
    async getProvinces(params = {}) {
        return this.get(API_ENDPOINTS.PROVINCE.GET_ALL, params);
    }

    /**
     * Get province by ID
     * @param {number} id - Province ID
     * @returns {Promise} Province details
     */
    async getProvinceById(id) {
        return this.get(API_ENDPOINTS.PROVINCE.GET_BY_ID(id));
    }
}

/**
 * Country API Service
 * Handles all Country-related API calls
 */
class CountryApiService extends ApiService {
    /**
     * Get all countries
     * @returns {Promise} List of countries
     */
    async getCountries() {
        return this.get(API_ENDPOINTS.COUNTRY.GET_ALL);
    }

    /**
     * Get country by ID
     * @param {number} id - Country ID
     * @returns {Promise} Country details
     */
    async getCountryById(id) {
        return this.get(API_ENDPOINTS.COUNTRY.GET_BY_ID(id));
    }
}

/**
 * Ward API Service
 * Handles all Ward-related API calls
 */
class WardApiService extends ApiService {
    /**
     * Get all wards
     * @returns {Promise} List of wards
     */
    async getWards(params = {}) {
        return this.get(API_ENDPOINTS.WARD.GET_ALL, params);
    }

    /**
     * Get ward by ID
     * @param {number} id - Ward ID
     * @returns {Promise} Ward details
     */
    async getWardById(id) {
        return this.get(API_ENDPOINTS.WARD.GET_BY_ID(id));
    }

    /**
     * Get Ward By Province Id
     * @param {*} provinceId - province Id tương ứng với Ward
     * @returns 
     */
    async getWardsByProvinceId(provinceId) {
    return this.get(API_ENDPOINTS.WARD.GET_BY_PROVINCE(provinceId));
}
}

/**
 * Warehouse API Service
 * Handles all Warehouse-related API calls
 */
class WarehouseApiService extends ApiService {
    /**
     * Get all warehouses
     * @returns {Promise} List of warehouses
     */
    async getWarehouses() {
        return this.get(API_ENDPOINTS.WAREHOUSE.GET_ALL);
    }

    /**
     * Create warehouse
     * @param {Object} warehouseData - Warehouse data to create
     * @returns {Promise} Created warehouse
     */
    async createWarehouse(warehouseData) {
        return this.post(API_ENDPOINTS.WAREHOUSE.CREATE, warehouseData);
    }

    /**
     * Get warehouse by ID
     * @param {number} id - Warehouse ID
     * @returns {Promise} Warehouse details
     */
    async getWarehouseById(id) {
        return this.get(API_ENDPOINTS.WAREHOUSE.GET_BY_ID(id));
    }

    /**
     * Update warehouse
     * @param {number} id - Warehouse ID
     * @param {Object} warehouseData - Warehouse data to update
     * @returns {Promise} Update confirmation
     */
    async updateWarehouse(id, warehouseData) {
        return this.put(API_ENDPOINTS.WAREHOUSE.UPDATE(id), warehouseData);
    }

    /**
     * Delete warehouse
     * @param {number} id - Warehouse ID
     * @returns {Promise} Delete confirmation
     */
    async deleteWarehouse(id) {
        return this.delete(API_ENDPOINTS.WAREHOUSE.DELETE(id));
    }

    /**
     * Get active warehouses
     * @returns {Promise} List of active warehouses
     */
    async getActiveWarehouses() {
        return this.get(API_ENDPOINTS.WAREHOUSE.GET_ACTIVE);
    }
}

/**
 * Inventory API Service
 * Handles all Inventory-related API calls
 */
class InventoryApiService extends ApiService {
    /**
     * Purchase inventory
     * @param {Object} purchaseData - Purchase data
     * @returns {Promise} Purchase confirmation
     */
    async purchaseInventory(purchaseData) {
        return this.post(API_ENDPOINTS.INVENTORY.PURCHASE, purchaseData);
    }

    /**
     * Get inventory by warehouse
     * @param {number} warehouseId - Warehouse ID
     * @returns {Promise} Inventory list
     */
    async getInventoryByWarehouse(warehouseId) {
        return this.get(API_ENDPOINTS.INVENTORY.GET_BY_WAREHOUSE(warehouseId));
    }

    /**
     * Get low stock items
     * @returns {Promise} List of low stock items
     */
    async getLowStock() {
        return this.get(API_ENDPOINTS.INVENTORY.GET_LOW_STOCK);
    }
}

/**
 * Order API Service
 * Handles all Order-related API calls
 */
class OrderApiService extends ApiService {
    /**
     * Customer place order
     * @param {Object} orderData - Order data
     * @returns {Promise} Created order
     */
    async customerPlaceOrder(orderData) {
        return this.post(API_ENDPOINTS.ORDER.CUSTOMER_PLACE_ORDER, orderData);
    }

    /**
     * Admin create order
     * @param {Object} orderData - Order data
     * @returns {Promise} Created order
     */
    async adminCreateOrder(orderData) {
        return this.post(API_ENDPOINTS.ORDER.ADMIN_CREATE_ORDER, orderData);
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
     * Get all orders
     * @param {Object} params - Query parameters
     * @returns {Promise} List of orders
     */
    async getOrders(params = {}) {
        return this.get(API_ENDPOINTS.ORDER.GET_ALL, params);
    }
}

/**
 * StockAlert API Service
 * Handles all StockAlert-related API calls
 */
class StockAlertApiService extends ApiService {
    /**
     * Get unread alerts
     * @returns {Promise} List of unread alerts
     */
    async getUnreadAlerts() {
        return this.get(API_ENDPOINTS.STOCK_ALERT.GET_UNREAD);
    }

    /**
     * Get unresolved alerts
     * @returns {Promise} List of unresolved alerts
     */
    async getUnresolvedAlerts() {
        return this.get(API_ENDPOINTS.STOCK_ALERT.GET_UNRESOLVED);
    }

    /**
     * Get alerts by type
     * @param {number} type - Alert type
     * @returns {Promise} List of alerts
     */
    async getAlertsByType(type) {
        return this.get(API_ENDPOINTS.STOCK_ALERT.GET_BY_TYPE(type));
    }

    /**
     * Get alerts by priority
     * @param {number} priority - Alert priority
     * @returns {Promise} List of alerts
     */
    async getAlertsByPriority(priority) {
        return this.get(API_ENDPOINTS.STOCK_ALERT.GET_BY_PRIORITY(priority));
    }

    /**
     * Mark alert as read
     * @param {number} id - Alert ID
     * @returns {Promise} Update confirmation
     */
    async markAsRead(id) {
        return this.put(API_ENDPOINTS.STOCK_ALERT.MARK_AS_READ(id), {});
    }

    /**
     * Resolve alert
     * @param {number} id - Alert ID
     * @param {Object} resolutionData - Resolution data
     * @returns {Promise} Update confirmation
     */
    async resolveAlert(id, resolutionData) {
        return this.put(API_ENDPOINTS.STOCK_ALERT.RESOLVE(id), resolutionData);
    }
}

/**
 * Token API Service
 * Handles authentication-related API calls
 */
class TokenApiService extends ApiService {
    /**
     * Login user
     * @param {Object} credentials - Login credentials
     * @param {string} credentials.username - Username
     * @param {string} credentials.password - Password
     * @returns {Promise} Authentication token
     */
    async login(credentials) {
        return this.post(API_ENDPOINTS.TOKEN.LOGIN, credentials);
    }
}

/**
 * User API Service
 * Handles all User-related API calls
 */
class UserApiService extends ApiService {
    /**
     * Create user
     * @param {Object} userData - User data to create
     * @returns {Promise} Created user
     */
    async createUser(userData) {
        return this.post(API_ENDPOINTS.USER.CREATE, userData);
    }

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} Update confirmation
     */
    async updateUser(id, userData) {
        return this.put(API_ENDPOINTS.USER.UPDATE(id), userData);
    }

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise} User details
     */
    async getUserById(id) {
        return this.get(API_ENDPOINTS.USER.GET_BY_ID(id));
    }

    /**
     * Get current user profile
     * @returns {Promise} User profile
     */
    async getProfile() {
        return this.get(API_ENDPOINTS.USER.GET_PROFILE);
    }
}

/**
 * FileUpload API Service
 * Handles all FileUpload-related API calls
 */
class FileUploadApiService extends ApiService {
    /**
     * Upload single file
     */
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

    /**
     * Upload multiple files
     * @param {FormData} formData - Form data containing files
     * @returns {Promise} Upload response
     */
    async uploadMultiple(formData) {
        const url = `${this.baseURL}${API_ENDPOINTS.FILE_UPLOAD.UPLOAD_MULTIPLE}`;
        return this.request(url, {
            method: 'POST',
            body: formData,
            headers: {
                // Don't set Content-Type for FormData
            }
        });
    }

    /**
     * Delete file
     * @param {number} id - File ID
     * @returns {Promise} Delete confirmation
     */
    async deleteFile(id) {
        return this.delete(API_ENDPOINTS.FILE_UPLOAD.DELETE(id));
    }

    /**
     * Delete file permanently
     * @param {number} id - File ID
     * @returns {Promise} Delete confirmation
     */
    async deleteFilePermanent(id) {
        return this.delete(API_ENDPOINTS.FILE_UPLOAD.DELETE_PERMANENT(id));
    }
}

/**
 * Customer API Service
 * Handles all Customer-related API calls (Admin)
 */
class CustomerApiService extends ApiService {
    /**
     * Get all customers with pagination
     * @param {number} pageNumber - Page number (default: 1)
     * @param {number} pageSize - Page size (default: 10, max: 100)
     * @returns {Promise} List of customers with pagination info
     */
    async getCustomers(pageNumber = 1, pageSize = 10, searchQuery = "") {
        const params = {pageNumber, pageSize, searchQuery: searchQuery || undefined // Chỉ gửi nếu có giá trị
        };
        // Dựa trên CustomerController.cs, API trả về object chứa Data và Pagination
        return this.get(API_ENDPOINTS.CUSTOMER.GET_ALL, params); 
    }

    /**
     * Create customer (admin only)
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
     * Update customer (admin only)
     * @param {number} id - Customer ID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise} Update confirmation
     */
    async updateCustomer(id, customerData) {
        return this.put(API_ENDPOINTS.CUSTOMER.UPDATE(id), customerData);
    }
}

/**
 * Customer Auth API Service
 * Handles customer authentication and profile management
 */
class CustomerAuthApiService extends ApiService {
    /**
     * Register new customer
     * @param {Object} registerData - Registration data (email, password, fullName, etc.)
     * @returns {Promise} Registration response with access token
     */
    async register(registerData) {
        return this.post(API_ENDPOINTS.CUSTOMER_AUTH.REGISTER, registerData);
    }

    /**
     * Customer login
     * @param {Object} loginData - Login credentials (email, password)
     * @returns {Promise} Login response with access token and customer info
     */
    async login(loginData) {
        return this.post(API_ENDPOINTS.CUSTOMER_AUTH.LOGIN, loginData);
    }

    /**
     * Customer logout
     * @returns {Promise} Logout confirmation
     */
    async logout() {
        return this.post(API_ENDPOINTS.CUSTOMER_AUTH.LOGOUT, {});
    }

    /**
     * Get current customer profile (requires authentication)
     * @returns {Promise} Customer profile
     */
    async getProfile() {
        return this.get(API_ENDPOINTS.CUSTOMER_AUTH.GET_PROFILE);
    }

    /**
     * Update customer profile (requires authentication)
     * @param {Object} profileData - Profile data to update
     * @returns {Promise} Update confirmation
     */
    async updateProfile(profileData) {
        return this.put(API_ENDPOINTS.CUSTOMER_AUTH.UPDATE_PROFILE, profileData);
    }
}

/**
 * Customer Business API Service
 * Handles customer business information management
 */
class CustomerBusinessApiService extends ApiService {
    /**
     * Get customer business information (requires authentication)
     * @returns {Promise} Business information
     */
    async getBusinessInfo() {
        return this.get(API_ENDPOINTS.CUSTOMER_BUSINESS.GET_BUSINESS_INFO);
    }

    /**
     * Update customer business information (requires authentication)
     * @param {Object} businessData - Business data to update
     * @returns {Promise} Update confirmation
     */
    async updateBusinessInfo(businessData) {
        return this.put(API_ENDPOINTS.CUSTOMER_BUSINESS.UPDATE_BUSINESS_INFO, businessData);
    }
}

/**
 * Shopping Cart API Service
 * Handles all shopping cart operations
 */
class ShoppingCartApiService extends ApiService {
    /**
     * Get cart (for authenticated or guest users)
     * @param {string} sessionId - Optional session ID for guest users
     * @returns {Promise} Cart data with items
     */
    async getCart(sessionId = null) {
        const params = sessionId ? { sessionId } : {};
        return this.get(API_ENDPOINTS.SHOPPING_CART.GET_CART, params);
    }

    /**
     * Merge local cart with server cart (usually after login)
     * @param {string} sessionId - Optional session ID
     * @param {Object} localCart - Local cart data to merge
     * @returns {Promise} Merged cart data
     */
    async mergeCart(sessionId = null, localCart = null) {
        const params = sessionId ? { sessionId } : {};
        const url = this.buildUrl(API_ENDPOINTS.SHOPPING_CART.MERGE_CART, params);
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(localCart || {}),
        });
    }

    /**
     * Get cart summary (item count, total price)
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} Cart summary
     */
    async getCartSummary(sessionId = null) {
        const params = sessionId ? { sessionId } : {};
        return this.get(API_ENDPOINTS.SHOPPING_CART.GET_SUMMARY, params);
    }

    /**
     * Add item to cart
     * @param {Object} itemData - Item data (productVariantId, quantity, etc.)
     * @returns {Promise} Updated cart
     */
    async addToCart(itemData) {
        return this.post(API_ENDPOINTS.SHOPPING_CART.ADD_TO_CART, itemData);
    }

    /**
     * Update cart item quantity
     * @param {number} id - Cart item ID
     * @param {Object} itemData - Updated item data (cartItemId, quantity)
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} Updated cart
     */
    async updateCartItem(id, itemData, sessionId = null) {
        const params = sessionId ? { sessionId } : {};
        const url = this.buildUrl(API_ENDPOINTS.SHOPPING_CART.UPDATE_ITEM(id), params);
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(itemData),
        });
    }

    /**
     * Remove item from cart
     * @param {number} id - Cart item ID
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} Updated cart
     */
    async removeCartItem(id, sessionId = null) {
        const params = sessionId ? { sessionId } : {};
        const url = this.buildUrl(API_ENDPOINTS.SHOPPING_CART.REMOVE_ITEM(id), params);
        return this.request(url, { method: 'DELETE' });
    }

    /**
     * Clear entire cart
     * @param {string} sessionId - Optional session ID
     * @returns {Promise} Confirmation message
     */
    async clearCart(sessionId = null) {
        const params = sessionId ? { sessionId } : {};
        const url = this.buildUrl(API_ENDPOINTS.SHOPPING_CART.CLEAR_CART, params);
        return this.request(url, { method: 'DELETE' });
    }
}

/**
 * Custom API Services Exports
 * Export singleton instances and classes for custom instances
 *
 * Each service class extends the base ApiService and
 * Handles all FileUpload-related API calls
 */


// Export singleton instances
export const brandApi = new BrandApiService();
export const businessTypeApi = new BusinessTypeApiService();
export const categoryApi = new CategoryApiService();
export const productApi = new ProductApiService();
export const productOptionApi = new ProductOptionApiService();
export const provinceApi = new ProvinceApiService();
export const countryApi = new CountryApiService();
export const wardApi = new WardApiService();
export const warehouseApi = new WarehouseApiService();
export const inventoryApi = new InventoryApiService();
export const orderApi = new OrderApiService();
export const stockAlertApi = new StockAlertApiService();
export const tokenApi = new TokenApiService();
export const userApi = new UserApiService();
export const fileUploadApi = new FileUploadApiService();
export const customerApi = new CustomerApiService();
export const customerAuthApi = new CustomerAuthApiService();
export const customerBusinessApi = new CustomerBusinessApiService();
export const shoppingCartApi = new ShoppingCartApiService();

// Export classes for custom instances if needed
export { 
    BrandApiService, 
    BusinessTypeApiService, 
    CategoryApiService, 
    ProductApiService,
    ProductOptionApiService,
    ProvinceApiService,
    CountryApiService,
    WardApiService,
    WarehouseApiService,
    InventoryApiService,
    OrderApiService,
    StockAlertApiService,
    TokenApiService,
    UserApiService,
    FileUploadApiService,
    ApiService,
    CustomerApiService,
    CustomerAuthApiService,
    CustomerBusinessApiService,
    ShoppingCartApiService
};