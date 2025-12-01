// service helpers for products API (used by components in this feature)
import axios from 'axios';
import {API_CONFIG} from '../../../config/api.config';

async function safeFetch(url, opts) {
  try {
    return await fetch(url, opts);
  } catch (err) {
    // network error
    throw err;
  }
}

export async function getProductList(params) {
  return axios.get(`${this.baseURL}/products`).then ( (response) => {
    return response.data;
  })
}

export async function fetchProducts({ page = 1, rows = 10, filters = {}, sort = {} } = {}) {
  const qs = new URLSearchParams();
  if (page && page !== 1) qs.set('page', String(page));
  if (rows && rows !== 10) qs.set('rows', String(rows));
  if (filters.category) qs.set('category', filters.category);
  if (filters.brand) qs.set('brand', filters.brand);
  if (filters.product) qs.set('product', filters.product);
  if (filters.createdby) qs.set('createdby', filters.createdby);
  if (sort.field) qs.set('sortField', sort.field);
  if (sort.order) qs.set('sortOrder', sort.order);
  
  const relative = `/api/products?${qs.toString()}`;

  // try proxied relative URL first, then fall back to direct backend
  let res;
  try {
    res = await safeFetch(relative);
  } catch (err) {
    // try backend
    res = await safeFetch(`${API_CONFIG}/api/products?${qs.toString()}`);
  }

  if (!res.ok) {
    // try direct backend if proxied returned error
    if (res.status >= 400) {
      const direct = await safeFetch(`${API_CONFIG}/api/products?${qs.toString()}`);
      if (direct.ok) res = direct;
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`Fetch products failed: ${res.status} ${res.statusText} ${text}`);
    err.response = res;
    throw err;
  }

  const payload = await res.json();
  return payload;
}

export async function fetchMeta() {
  const relative = '/api/products/meta';
  try {
    const res = await safeFetch(relative);
    if (res.ok) return await res.json();
  } catch (err) {
    // try backend
    try {
      const res2 = await safeFetch(`${API_CONFIG}/api/products/meta`);
      if (res2.ok) return await res2.json();
    } catch (e) {
      // ignore
    }
  }
  // fallback empty meta
  return { categories: [], brands: [], products: [], createdBy: [] };
}

export async function fetchProductById(id) {
  if (!id) return null;
  const relative = `/api/products/${encodeURIComponent(id)}`;

  let res;
  try {
    res = await safeFetch(relative);
  } catch (err) {
    res = await safeFetch(`${API_CONFIG}/api/products/${encodeURIComponent(id)}`);
  }

  if (!res.ok) {
    if (res.status === 404) return null;
    const text = await res.text().catch(() => '');
    const err = new Error(`Fetch product by id failed: ${res.status} ${res.statusText} ${text}`);
    err.response = res;
    throw err;
  }

  const payload = await res.json();
  return payload && (payload.data || payload) ? (payload.data || payload) : null;
}

export default {
  fetchProducts,
  fetchMeta,
  fetchProductById,
  getProductList
};
