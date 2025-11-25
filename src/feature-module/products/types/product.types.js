/**
 * TypeScript-like type definitions for Product domain
 * These serve as documentation and can be used with JSDoc for IDE support
 */

/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {number|null} parentId
 * @property {string} [description]
 * @property {number} [displayOrder]
 * @property {boolean} [isActive]
 */

/**
 * @typedef {Object} Brand
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [countryOfOrigin]
 * @property {string} [website]
 * @property {string} [logoUrl]
 * @property {boolean} [isActive]
 */

/**
 * @typedef {Object} ProductOption
 * @property {number} id
 * @property {number} productId
 * @property {string} name
 * @property {number} displayOrder
 * @property {ProductOptionValue[]} [productOptionValues]
 */

/**
 * @typedef {Object} ProductOptionValue
 * @property {number} id
 * @property {number} productOptionId
 * @property {string} value
 * @property {number} displayOrder
 */

/**
 * @typedef {Object} VariantOptionValue
 * @property {number} id
 * @property {number} productVariantId
 * @property {number} productOptionValueId
 * @property {ProductOptionValue} [productOptionValue]
 */

/**
 * @typedef {Object} ProductVariant
 * @property {number} id
 * @property {number} productId
 * @property {string} sku
 * @property {string} [barcode]
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {number} stockQuantity
 * @property {number} [weight]
 * @property {string} [dimensions]
 * @property {string} [imageUrl]
 * @property {boolean} isActive
 * @property {VariantOptionValue[]} [variantOptionValues]
 * @property {Date} [createdDate]
 * @property {Date} [updatedDate]
 */

/**
 * @typedef {Object} Product
 * @property {number} id
 * @property {number} categoryId
 * @property {number} brandId
 * @property {string} name
 * @property {string} slug
 * @property {string} [shortDescription]
 * @property {string} [fullDescription]
 * @property {string} [thumbnailUrl]
 * @property {string} [ingredients]
 * @property {string} [usageInstructions]
 * @property {string} [contraindications]
 * @property {string} [storageInstructions]
 * @property {string} [registrationNumber]
 * @property {boolean} isPrescriptionDrug
 * @property {boolean} isActive
 * @property {boolean} isFeatured
 * @property {Category} [category]
 * @property {Brand} [brand]
 * @property {ProductOption[]} [productOptions]
 * @property {ProductVariant[]} [productVariants]
 * @property {string[]} [images]
 * @property {Date} [createdDate]
 * @property {Date} [updatedDate]
 */

/**
 * @typedef {Object} ProductListItem
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} [shortDescription]
 * @property {string} [thumbnailUrl]
 * @property {number} categoryId
 * @property {string} categoryName
 * @property {number} brandId
 * @property {string} brandName
 * @property {string} sku
 * @property {number} price
 * @property {number} [originalPrice]
 * @property {number} stockQuantity
 * @property {string} [imageUrl]
 * @property {boolean} isActive
 * @property {boolean} isFeatured
 * @property {boolean} isPrescriptionDrug
 * @property {number} variantCount
 */

/**
 * @typedef {Object} ProductFilters
 * @property {number} [categoryId]
 * @property {number} [brandId]
 * @property {string} [searchQuery]
 * @property {boolean} [isActive]
 * @property {boolean} [isFeatured]
 * @property {boolean} [isPrescriptionDrug]
 */

/**
 * @typedef {Object} ProductSort
 * @property {string} field - Field to sort by (name, price, createdDate, etc.)
 * @property {'asc'|'desc'} order - Sort order
 */

/**
 * @typedef {Object} ProductPagination
 * @property {number} page - Current page (1-based)
 * @property {number} pageSize - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 */

/**
 * @typedef {Object} ProductListResponse
 * @property {ProductListItem[]} data
 * @property {ProductPagination} pagination
 */

/**
 * @typedef {Object} ProductDetailResponse
 * @property {Product} data
 */

export const ProductTypes = {
  // Type definitions are exported as JSDoc comments above
  // This file serves as documentation for the product domain
};

export default ProductTypes;
