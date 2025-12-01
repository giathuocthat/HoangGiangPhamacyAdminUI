/**
 * Example: How to use Product API Service
 * 
 * This file demonstrates various ways to use the productApi service
 * in your React components.
 */

import { productApi } from '../services/api.service';

// ============================================
// Example 1: Get All Products
// ============================================
export const fetchAllProducts = async () => {
    try {
        const products = await productApi.getAllProducts();
        console.log('All products:', products);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        throw error;
    }
};

// ============================================
// Example 2: Get Product by ID
// ============================================
export const fetchProductById = async (productId) => {
    try {
        const product = await productApi.getProductById(productId);
        console.log('Product details:', product);
        return product;
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error.message);
        throw error;
    }
};

// ============================================
// Example 3: Get Products by Category
// ============================================
export const fetchProductsByCategory = async (categoryId) => {
    try {
        const products = await productApi.getProductsByCategory(categoryId);
        console.log(`Products in category ${categoryId}:`, products);
        return products;
    } catch (error) {
        console.error(`Error fetching products for category ${categoryId}:`, error.message);
        throw error;
    }
};

// ============================================
// Example 4: Search Products
// ============================================
export const searchProducts = async (searchTerm) => {
    try {
        const results = await productApi.searchProducts(searchTerm);
        console.log(`Search results for "${searchTerm}":`, results);
        return results;
    } catch (error) {
        console.error(`Error searching products with term "${searchTerm}":`, error.message);
        throw error;
    }
};

// ============================================
// Example 5: React Component with Product List
// ============================================
/*
import React, { useState, useEffect } from 'react';
import { productApi } from '../../services/api.service';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productApi.getAllProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
*/

// ============================================
// Example 6: React Component with Search
// ============================================
/*
import React, { useState } from 'react';
import { productApi } from '../../services/api.service';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const data = await productApi.searchProducts(searchTerm);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div>
        {results.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductSearch;
*/

// ============================================
// Example 7: React Component with Category Filter
// ============================================
/*
import React, { useState, useEffect } from 'react';
import { productApi } from '../../services/api.service';

const ProductsByCategory = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      try {
        const data = await productApi.getProductsByCategory(categoryId);
        setProducts(data);
      } catch (error) {
        console.error('Error loading category products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryProducts();
  }, [categoryId]);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <h2>Products in Category</h2>
      {products.length === 0 ? (
        <p>No products found in this category</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductsByCategory;
*/
