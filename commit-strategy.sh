#!/bin/bash

# Script để commit theo nhóm logic - Minimize Conflicts
# Sử dụng: bash commit-strategy.sh

echo "🚀 Starting atomic commits strategy..."
echo ""

# Commit 1: Product Detail Navigation
echo "📝 Commit 1: Product detail navigation feature..."
git add src/feature-module/inventory/productlist.jsx
git add src/feature-module/inventory/productdetail.jsx
git commit -m "feat: Add product detail navigation from list

- Update product name link to navigate to /product-details/:id
- Fix import path for ImageLightbox component
- Product list now shows clickable product names"

# Commit 2: Backend API
echo "📝 Commit 2: Backend API enhancement..."
git add server/index.js
git commit -m "feat: Add GET /api/products/:id endpoint

- Fetch single product by ID
- Support filtering by all=1 query param
- Fix price field mapping"

# Commit 3: Dependencies & Config
echo "📝 Commit 3: Dependencies and ESLint config..."
git add package.json
git add package-lock.json
git add eslint.config.js
git commit -m "chore: Update ESLint config and dependencies

- Simplify ESLint config (remove TypeScript)
- Add eslint-plugin-react and jsx-a11y
- Reorganize devDependencies"

# Commit 4: Routing
echo "📝 Commit 4: Route configuration..."
git add src/routes/path.jsx
git commit -m "chore: Update route configuration

- Add route for /product-details/:id
- Support both path param and query string for product ID"

# Commit 5: UI/Styles
echo "📝 Commit 5: UI and style updates..."
git add src/assets/scss/pages/_product.scss
git add src/feature-module/inventory/brandlist.jsx
git add src/feature-module/inventory/categorylist.jsx
git add src/feature-module/inventory/editproduct.jsx
git add src/feature-module/inventory/editsubcategories.jsx
git add src/feature-module/inventory/expiredproduct.jsx
git add src/feature-module/inventory/lowstock.jsx
git add src/feature-module/inventory/printbarcode.jsx
git add src/feature-module/inventory/subcategories.jsx
git add src/feature-module/inventory/variantattributes.jsx
git add src/feature-module/inventory/warranty.jsx
git commit -m "refactor: Update inventory module components

- Minor UI/style improvements
- Update component structure"

# Commit 6: New Features
echo "📝 Commit 6: New product components..."
git add src/feature-module/inventory/productdetail2.jsx
git add src/feature-module/products/
git add src/layouts/
git commit -m "feat: Add new product detail and layout components

- Add ProductDetail2 component
- Add new product services and components
- Add layout improvements"

# Commit 7: Cleanup
echo "📝 Commit 7: Code cleanup..."
git add src/feature-module/uiinterface/map/leaflet.jsx
git add src/core/pagination/pagination.jsx
git add src/assets/icons/fontawesome/js/
git add -A
git commit -m "chore: Code cleanup and minor fixes

- Update pagination component
- Fix leaflet map component
- Remove unused ProductsTable component
- Update fontawesome assets"

echo ""
echo "✅ All commits created!"
echo ""
echo "📊 Commits summary:"
git log origin/master..HEAD --oneline
echo ""
echo "🚀 Ready to push? Run: git push origin master"
