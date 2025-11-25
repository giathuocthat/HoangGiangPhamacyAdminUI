/**
 * Data transformation utilities to map between backend API format and frontend display format.
 * Backend format follows the standardized schema with nested objects (category, brand, variants, etc.)
 * Frontend format is optimized for display and list rendering.
 */

/**
 * Transform backend product detail to frontend display format
 * @param {Object} backendProduct - Product from backend API
 * @returns {Object} Transformed product for display
 */
export const transformProductDetail = (backendProduct) => {
  if (!backendProduct) return null;

  return {
    // Basic info
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    
    // Descriptions
    shortDescription: backendProduct.shortDescription || '',
    fullDescription: backendProduct.fullDescription || '',
    
    // Media
    thumbnailUrl: backendProduct.thumbnailUrl || '',
    images: backendProduct.images || [],
    
    // Product details
    ingredients: backendProduct.ingredients || '',
    usageInstructions: backendProduct.usageInstructions || '',
    contraindications: backendProduct.contraindications || '',
    storageInstructions: backendProduct.storageInstructions || '',
    registrationNumber: backendProduct.registrationNumber || '',
    
    // Status
    isPrescriptionDrug: backendProduct.isPrescriptionDrug || false,
    isActive: backendProduct.isActive !== false,
    isFeatured: backendProduct.isFeatured || false,
    
    // Relations
    category: backendProduct.category ? {
      id: backendProduct.category.id,
      name: backendProduct.category.name,
      slug: backendProduct.category.slug,
      parentId: backendProduct.category.parentId,
    } : null,
    
    brand: backendProduct.brand ? {
      id: backendProduct.brand.id,
      name: backendProduct.brand.name,
      slug: backendProduct.brand.slug,
      countryOfOrigin: backendProduct.brand.countryOfOrigin,
      logoUrl: backendProduct.brand.logoUrl,
    } : null,
    
    // Options and variants
    productOptions: backendProduct.productOptions || [],
    productVariants: (backendProduct.productVariants || []).map(transformProductVariant),
  };
};

/**
 * Transform backend product variant to frontend format
 * @param {Object} variant - Variant from backend
 * @returns {Object} Transformed variant
 */
export const transformProductVariant = (variant) => {
  if (!variant) return null;

  return {
    id: variant.id,
    sku: variant.sku,
    barcode: variant.barcode,
    price: variant.price,
    originalPrice: variant.originalPrice,
    stockQuantity: variant.stockQuantity,
    weight: variant.weight,
    dimensions: variant.dimensions,
    imageUrl: variant.imageUrl,
    isActive: variant.isActive !== false,
    
    // Variant option values (flattened for easier display)
    variantOptionValues: (variant.variantOptionValues || []).map(vov => ({
      optionId: vov.productOptionValue?.productOption?.id,
      optionName: vov.productOptionValue?.productOption?.name,
      valueId: vov.productOptionValue?.id,
      value: vov.productOptionValue?.value,
    })),
  };
};

/**
 * Transform backend product list item to frontend list format
 * Extracts first variant for price/stock display in list
 * @param {Object} backendProduct - Product from backend
 * @returns {Object} Transformed product for list display
 */
export const transformProductListItem = (backendProduct) => {
  if (!backendProduct) return null;

  const firstVariant = backendProduct.productVariants?.[0];

  return {
    id: backendProduct.id,
    name: backendProduct.name,
    slug: backendProduct.slug,
    shortDescription: backendProduct.shortDescription || '',
    thumbnailUrl: backendProduct.thumbnailUrl || '',
    
    // Category and brand
    categoryId: backendProduct.category?.id,
    categoryName: backendProduct.category?.name,
    brandId: backendProduct.brand?.id,
    brandName: backendProduct.brand?.name,
    
    // First variant info (for list display)
    sku: firstVariant?.sku || '',
    price: firstVariant?.price || 0,
    originalPrice: firstVariant?.originalPrice || 0,
    stockQuantity: firstVariant?.stockQuantity || 0,
    imageUrl: firstVariant?.imageUrl || backendProduct.thumbnailUrl || '',
    
    // Status
    isActive: backendProduct.isActive !== false,
    isFeatured: backendProduct.isFeatured || false,
    isPrescriptionDrug: backendProduct.isPrescriptionDrug || false,
    
    // Variant count for reference
    variantCount: backendProduct.productVariants?.length || 0,
  };
};

/**
 * Transform array of backend products to list format
 * @param {Array} products - Array of products from backend
 * @returns {Array} Transformed products for list display
 */
export const transformProductList = (products) => {
  if (!Array.isArray(products)) return [];
  return products.map(transformProductListItem);
};

/**
 * Extract display price from product (uses first variant or default)
 * @param {Object} product - Product object
 * @returns {number} Price to display
 */
export const getProductDisplayPrice = (product) => {
  if (!product) return 0;
  
  // If product has variants, use first variant price
  if (product.productVariants?.length > 0) {
    return product.productVariants[0].price || 0;
  }
  
  // Fallback to price field if exists
  return product.price || 0;
};

/**
 * Extract display stock from product (uses first variant or default)
 * @param {Object} product - Product object
 * @returns {number} Stock quantity to display
 */
export const getProductDisplayStock = (product) => {
  if (!product) return 0;
  
  // If product has variants, use first variant stock
  if (product.productVariants?.length > 0) {
    return product.productVariants[0].stockQuantity || 0;
  }
  
  // Fallback to stockQuantity field if exists
  return product.stockQuantity || 0;
};

/**
 * Extract display image from product
 * @param {Object} product - Product object
 * @returns {string} Image URL to display
 */
export const getProductDisplayImage = (product) => {
  if (!product) return '';
  
  // Try first variant image
  if (product.productVariants?.length > 0 && product.productVariants[0].imageUrl) {
    return product.productVariants[0].imageUrl;
  }
  
  // Fallback to thumbnail
  return product.thumbnailUrl || '';
};

/**
 * Get all images from product (from variants and main thumbnail)
 * @param {Object} product - Product object
 * @returns {Array} Array of image URLs
 */
export const getProductAllImages = (product) => {
  if (!product) return [];
  
  const images = [];
  
  // Add thumbnail if exists
  if (product.thumbnailUrl) {
    images.push(product.thumbnailUrl);
  }
  
  // Add variant images
  if (product.productVariants?.length > 0) {
    product.productVariants.forEach(variant => {
      if (variant.imageUrl && !images.includes(variant.imageUrl)) {
        images.push(variant.imageUrl);
      }
    });
  }
  
  // Add from images array if exists
  if (product.images?.length > 0) {
    product.images.forEach(img => {
      const imgUrl = typeof img === 'string' ? img : img.url;
      if (imgUrl && !images.includes(imgUrl)) {
        images.push(imgUrl);
      }
    });
  }
  
  return images;
};

/**
 * Format price for display (Vietnamese Dong)
 * @param {number} price - Price value
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} salePrice - Sale price
 * @returns {number} Discount percentage (0-100)
 */
export const calculateDiscountPercent = (originalPrice, salePrice) => {
  if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

export default {
  transformProductDetail,
  transformProductVariant,
  transformProductListItem,
  transformProductList,
  getProductDisplayPrice,
  getProductDisplayStock,
  getProductDisplayImage,
  getProductAllImages,
  formatPrice,
  calculateDiscountPercent,
};
