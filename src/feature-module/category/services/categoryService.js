// services/categoryService.js
import { API_CONFIG } from '../../../config/api.config';

/**
 * Safe fetch wrapper với error handling
 */
async function safeFetch(url, opts) {
  try {
    return await fetch(url, opts);
  } catch (err) {
    throw new Error(`Network error: ${err.message}`);
  }
}

/**
 * Build query string từ params object
 */
function buildQueryString(params) {
  const qs = new URLSearchParams();
  
  if (params.page) qs.set('page', String(params.page));
  if (params.rows) qs.set('rows', String(params.rows));
  
  // Filters
  if (params.filters) {
    if (params.filters.status) qs.set('status', params.filters.status);
    if (params.filters.search) qs.set('search', params.filters.search);
  }
  
  // Sort
  if (params.sort) {
    if (params.sort.field) qs.set('sortField', params.sort.field);
    if (params.sort.order) qs.set('sortOrder', params.sort.order);
  }
  
  return qs.toString();
}

/**
 * Fetch categories từ API
 * API sẽ extract unique values từ cột "Danh mục" trong Products.csv
 * @param {Object} params - { page, rows, filters, sort }
 * @returns {Promise<Object>} - { data: [], total: number, page: number, rows: number }
 */
export async function fetchCategories({ page = 1, rows = 10, filters = {}, sort = {} } = {}) {
  const queryString = buildQueryString({ page, rows, filters, sort });
  const relativeUrl = `/api/categories?${queryString}`;
  const directUrl = `${API_CONFIG}/api/categories?${queryString}`;
  
  let res;
  
  // Strategy 1: Try proxied relative URL first
  try {
    res = await safeFetch(relativeUrl);
    
    // If proxy returns error, try direct backend
    if (!res.ok && res.status >= 400) {
      console.warn(`Proxied request failed with ${res.status}, trying direct backend...`);
      try {
        const directRes = await safeFetch(directUrl);
        if (directRes.ok) {
          res = directRes;
        }
      } catch (directErr) {
        console.warn('Direct backend also failed:', directErr);
      }
    }
  } catch (err) {
    // Network error on relative fetch, try direct backend
    console.warn('Relative fetch failed, trying direct backend:', err);
    res = await safeFetch(directUrl);
  }
  
  // Final check
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(
      `Fetch categories failed: ${res.status} ${res.statusText}${text ? '\n' + text.slice(0, 500) : ''}`
    );
    error.status = res.status;
    error.response = res;
    throw error;
  }
  
  const payload = await res.json();
  return payload;
}

/**
 * Fetch single category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object|null>}
 */
export async function fetchCategoryBySlug(slug) {
  if (!slug) {
    throw new Error('Category slug is required');
  }
  
  const encodedSlug = encodeURIComponent(slug);
  const relativeUrl = `/api/categories/${encodedSlug}`;
  const directUrl = `${API_CONFIG}/api/categories/${encodedSlug}`;
  
  let res;
  
  try {
    res = await safeFetch(relativeUrl);
  } catch (err) {
    console.warn('Relative fetch failed, trying backend:', err);
    res = await safeFetch(directUrl);
  }
  
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    
    const text = await res.text().catch(() => '');
    const error = new Error(
      `Fetch category by slug failed: ${res.status} ${res.statusText}${text ? '\n' + text : ''}`
    );
    error.status = res.status;
    error.response = res;
    throw error;
  }
  
  const payload = await res.json();
  return payload.data || payload;
}

/**
 * Create new category
 * @param {Object} categoryData - { category, categoryslug, status }
 * @returns {Promise<Object>}
 */
export async function createCategory(categoryData) {
  const relativeUrl = '/api/categories';
  const directUrl = `${API_CONFIG}/api/categories`;
  
  let res;
  
  try {
    res = await safeFetch(relativeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
  } catch (err) {
    console.warn('Relative fetch failed, trying backend:', err);
    res = await safeFetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
  }
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(
      `Create category failed: ${res.status} ${res.statusText}${text ? '\n' + text : ''}`
    );
    error.status = res.status;
    error.response = res;
    throw error;
  }
  
  const payload = await res.json();
  return payload;
}

/**
 * Update category
 * @param {string} slug - Category slug
 * @param {Object} categoryData - Updated data
 * @returns {Promise<Object>}
 */
export async function updateCategory(slug, categoryData) {
  const encodedSlug = encodeURIComponent(slug);
  const relativeUrl = `/api/categories/${encodedSlug}`;
  const directUrl = `${API_CONFIG}/api/categories/${encodedSlug}`;
  
  let res;
  
  try {
    res = await safeFetch(relativeUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
  } catch (err) {
    console.warn('Relative fetch failed, trying backend:', err);
    res = await safeFetch(directUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData)
    });
  }
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(
      `Update category failed: ${res.status} ${res.statusText}${text ? '\n' + text : ''}`
    );
    error.status = res.status;
    error.response = res;
    throw error;
  }
  
  const payload = await res.json();
  return payload;
}

/**
 * Delete category
 * @param {string} slug - Category slug
 * @returns {Promise<Object>}
 */
export async function deleteCategory(slug) {
  const encodedSlug = encodeURIComponent(slug);
  const relativeUrl = `/api/categories/${encodedSlug}`;
  const directUrl = `${API_CONFIG}/api/categories/${encodedSlug}`;
  
  let res;
  
  try {
    res = await safeFetch(relativeUrl, { method: 'DELETE' });
  } catch (err) {
    console.warn('Relative fetch failed, trying backend:', err);
    res = await safeFetch(directUrl, { method: 'DELETE' });
  }
  
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const error = new Error(
      `Delete category failed: ${res.status} ${res.statusText}${text ? '\n' + text : ''}`
    );
    error.status = res.status;
    error.response = res;
    throw error;
  }
  
  const payload = await res.json();
  return payload;
}

/**
 * Map raw category data to UI format
 * @param {Array} rawData - Raw data từ API
 * @returns {Array} - Mapped data
 */
export function mapCategoryData(rawData) {
  if (!Array.isArray(rawData)) {
    return [];
  }
  
  return rawData.map((item) => ({
    category: item.category || item.name || '',
    categoryslug: item.categoryslug || item.slug || item.category?.toLowerCase().replace(/\s+/g, '-') || '',
    createdon: item.createdon || item.createdAt || new Date().toLocaleDateString('en-GB'),
    status: item.status || 'Active',
    productCount: item.productCount || 0 // Số lượng sản phẩm trong category
  }));
}

/**
 * Generate slug từ category name
 * @param {string} categoryName 
 * @returns {string}
 */
export function generateSlug(categoryName) {
  return categoryName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with -
    .replace(/-+/g, '-');      // Replace multiple - with single -
}

// Export default object
export default {
  fetchCategories,
  fetchCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  mapCategoryData,
  generateSlug
};