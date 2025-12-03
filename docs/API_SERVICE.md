# API Service Documentation

This document describes the API service layer for the HoangGiangPhamacyAdminUI project, which connects to the ThuocGiaThatAdmin.Server backend.

## Overview

The API service provides a centralized, reusable way to make HTTP requests to the backend API. It includes:

- **Configuration Management**: Centralized API configuration
- **Base Service Class**: Generic HTTP methods (GET, POST, PUT, DELETE)
- **Specialized Services**: Brand and Product API services
- **Error Handling**: Consistent error handling across all API calls
- **Timeout Management**: Automatic request timeout handling

## File Structure

```
src/
├── config/
│   └── api.config.js          # API configuration and endpoints
├── services/
│   └── api.service.js         # API service classes
└── .env                       # Environment variables
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://localhost:7001/api
```

### API Configuration (`src/config/api.config.js`)

The configuration file contains:

- **BASE_URL**: The base URL for all API requests (can be overridden by `VITE_API_BASE_URL`)
- **TIMEOUT**: Request timeout in milliseconds (default: 30000ms)
- **DEFAULT_HEADERS**: Default headers for all requests
- **API_ENDPOINTS**: Centralized endpoint definitions

## Services

### Base API Service

The `ApiService` class provides core HTTP functionality:

```javascript
import { ApiService } from '../services/api.service';

const api = new ApiService();

// GET request
const data = await api.get('/endpoint', { param1: 'value1' });

// POST request
const result = await api.post('/endpoint', { key: 'value' });

// PUT request
const updated = await api.put('/endpoint', { key: 'value' });

// DELETE request
const deleted = await api.delete('/endpoint');
```

### Brand API Service

The `BrandApiService` provides methods for brand-related operations:

```javascript
import { brandApi } from '../services/api.service';

// Get brands with pagination
const result = await brandApi.getBrands(pageNumber, pageSize);
// Returns: { data: [...], pagination: { pageNumber, pageSize, totalCount, totalPages } }

// Get brand by ID
const brand = await brandApi.getBrandById(id);

// Update brand
const updated = await brandApi.updateBrand(id, brandData);

// Delete brand
const deleted = await brandApi.deleteBrand(id);
```

### Product API Service

The `ProductApiService` provides methods for product-related operations:

```javascript
import { productApi } from '../services/api.service';

// Get all products
const products = await productApi.getAllProducts();

// Get product by ID
const product = await productApi.getProductById(id);

// Get products by category
const categoryProducts = await productApi.getProductsByCategory(categoryId);

// Search products by name
const searchResults = await productApi.searchProducts('search term');
```

## Usage Examples

### Example 1: Fetching Brands in a Component

```javascript
import React, { useState, useEffect } from 'react';
import { brandApi } from '../../services/api.service';

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const result = await brandApi.getBrands(currentPage, 10);
        setBrands(result.data);
        setTotalRecords(result.pagination.totalCount);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, [currentPage]);

  return (
    // Your component JSX
  );
};
```

### Example 2: Updating a Brand

```javascript
import { brandApi } from '../../services/api.service';

const handleUpdateBrand = async (brandId, brandData) => {
  try {
    const result = await brandApi.updateBrand(brandId, {
      id: brandId,
      name: brandData.name,
      logoUrl: brandData.logoUrl,
      isActive: brandData.isActive,
      // ... other fields
    });
    console.log('Brand updated successfully:', result);
  } catch (error) {
    console.error('Error updating brand:', error.message);
  }
};
```

### Example 3: Searching Products

```javascript
import { productApi } from '../../services/api.service';

const handleSearch = async (searchTerm) => {
  try {
    const results = await productApi.searchProducts(searchTerm);
    setProducts(results);
  } catch (error) {
    console.error('Error searching products:', error.message);
  }
};
```

## Error Handling

All API methods throw errors that can be caught with try-catch blocks:

```javascript
try {
  const data = await brandApi.getBrands(1, 10);
} catch (error) {
  if (error.message === 'Request timeout') {
    // Handle timeout
  } else if (error.message.includes('HTTP Error')) {
    // Handle HTTP errors
  } else {
    // Handle other errors
  }
}
```

## API Response Format

### Brand API Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Brand Name",
      "slug": "brand-name",
      "countryOfOrigin": "Vietnam",
      "website": "https://example.com",
      "logoUrl": "https://example.com/logo.png",
      "isActive": true,
      "createdDate": "2023-01-01T00:00:00Z",
      "updatedDate": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "pageNumber": 1,
    "pageSize": 10,
    "totalCount": 100,
    "totalPages": 10
  }
}
```

## Extending the Service

To add a new API service:

1. **Add endpoints to `api.config.js`**:

```javascript
export const API_ENDPOINTS = {
  // ... existing endpoints
  CATEGORY: {
    GET_ALL: '/category',
    GET_BY_ID: (id) => `/category/${id}`,
  },
};
```

2. **Create a new service class in `api.service.js`**:

```javascript
class CategoryApiService extends ApiService {
  async getCategories() {
    return this.get(API_ENDPOINTS.CATEGORY.GET_ALL);
  }

  async getCategoryById(id) {
    return this.get(API_ENDPOINTS.CATEGORY.GET_BY_ID(id));
  }
}

export const categoryApi = new CategoryApiService();
```

3. **Use the service in your components**:

```javascript
import { categoryApi } from '../../services/api.service';

const categories = await categoryApi.getCategories();
```

## Best Practices

1. **Always use try-catch blocks** when calling API methods
2. **Show loading states** while fetching data
3. **Handle errors gracefully** with user-friendly messages
4. **Use environment variables** for different environments (dev, staging, production)
5. **Implement fallback data** for better user experience during errors
6. **Cache responses** when appropriate to reduce API calls

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the backend API has proper CORS configuration:

```csharp
// In ThuocGiaThatAdmin.Server Program.cs or Startup.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAdminUI",
        policy => policy
            .WithOrigins("http://localhost:5173") // Vite dev server
            .AllowAnyHeader()
            .AllowAnyMethod());
});
```

### SSL Certificate Issues

For development with HTTPS, you may need to trust the development certificate:

```bash
dotnet dev-certs https --trust
```

### Timeout Issues

If requests are timing out, increase the timeout in `api.config.js`:

```javascript
export const API_CONFIG = {
  TIMEOUT: 60000, // 60 seconds
  // ...
};
```

## Related Files

- Backend Controllers:
  - `ThuocGiaThatAdmin.Server/Controllers/BrandController.cs`
  - `ThuocGiaThatAdmin.Server/Controllers/ProductController.cs`
- Frontend Components:
  - `src/feature-module/inventory/brandlist.jsx`
