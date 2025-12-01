# Chiến lược Push để Minimize Conflicts

## 📊 Tình hình hiện tại
- **Thay đổi chưa commit**: 30+ files
- **Loại thay đổi**: Hỗn hợp (features, fixes, dependencies)
- **Mục tiêu**: Minimize conflicts khi team members pull

---

## ✅ Chiến lược Tối Ưu (Recommended)

### Bước 1: Commit theo nhóm logic (Atomic Commits)

Thay vì commit tất cả cùng lúc, chia thành các commit nhỏ, logic:

```bash
# 1️⃣ Commit: Fix product detail navigation
git add src/feature-module/inventory/productlist.jsx
git add src/feature-module/inventory/productdetail.jsx
git commit -m "feat: Add product detail navigation from list

- Update product name link to navigate to /products-details/:id
- Fix import path for ImageLightbox component
- Product list now shows clickable product names"

# 2️⃣ Commit: Backend API enhancement
git add server/index.js
git commit -m "feat: Add GET /api/products/:id endpoint

- Fetch single product by ID
- Support filtering by all=1 query param
- Fix price field mapping"

# 3️⃣ Commit: Dependencies & Config
git add package.json
git add package-lock.json
git add eslint.config.js
git commit -m "chore: Update ESLint config and dependencies

- Simplify ESLint config (remove TypeScript)
- Add eslint-plugin-react and jsx-a11y
- Reorganize devDependencies"

# 4️⃣ Commit: Routing updates
git add src/routes/path.jsx
git commit -m "chore: Update route configuration

- Add route for /products-details/:id
- Support both path param and query string for product ID"

# 5️⃣ Commit: UI/Style updates
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

# 6️⃣ Commit: New features/components
git add src/feature-module/inventory/productdetail2.jsx
git add src/feature-module/products/
git add src/layouts/
git commit -m "feat: Add new product detail and layout components

- Add ProductDetail2 component
- Add new product services and components
- Add layout improvements"

# 7️⃣ Commit: Cleanup
git add src/feature-module/uiinterface/map/leaflet.jsx
git add src/core/pagination/pagination.jsx
git add -A  # Stage remaining changes
git commit -m "chore: Code cleanup and minor fixes

- Update pagination component
- Fix leaflet map component
- Remove unused ProductsTable component"
```

---

## 🚀 Push Strategy

### Opsi 1: Push tất cả cùng lúc (Nếu không có ai khác đang làm việc)
```bash
git push origin master
```

### Opsi 2: Push từng commit (Nếu có team members đang làm việc)
```bash
# Xem commits chưa push
git log origin/master..HEAD --oneline

# Push từng commit một để dễ review
git push origin master
```

### Opsi 3: Rebase trước khi push (Nếu có conflicts)
```bash
# Fetch latest changes từ remote
git fetch origin

# Rebase local commits lên top của remote
git rebase origin/master

# Nếu có conflicts, resolve rồi:
git add .
git rebase --continue

# Push
git push origin master
```

---

## 🛡️ Cách giảm thiểu Conflicts

### ✅ Làm ngay:
1. **Commit nhỏ, thường xuyên** - Dễ merge hơn
2. **Mô tả rõ ràng** - Team hiểu được thay đổi
3. **Tránh thay đổi cùng file** - Phối hợp với team
4. **Pull trước khi push** - Luôn cập nhật latest

### ✅ Tránh:
- ❌ Commit lớn với nhiều thay đổi không liên quan
- ❌ Thay đổi file config mà không thông báo
- ❌ Push mà không pull trước
- ❌ Rewrite history (force push) trên shared branches

---

## 📋 Checklist trước khi Push

- [ ] Tất cả thay đổi đã được test
- [ ] Không có console.log hoặc debug code
- [ ] Commit messages rõ ràng và descriptive
- [ ] Đã pull latest từ remote
- [ ] Không có conflicts
- [ ] ESLint pass (chạy `npm run lint`)
- [ ] Build pass (chạy `npm run build`)

---

## 🔄 Nếu có Conflicts

```bash
# 1. Xem conflicts
git status

# 2. Mở file conflict và resolve manually
# Tìm markers: <<<<<<, ======, >>>>>>

# 3. Sau khi resolve
git add .
git commit -m "chore: Resolve merge conflicts"
git push origin master
```

---

## 📞 Thông báo cho Team

Trước khi push, hãy thông báo:
```
🚀 Pushing changes:
- Product detail navigation feature
- Backend API enhancement
- ESLint config update
- New product components

Estimated merge time: ~5 mins
Please pull after I push!
```

---

## 🎯 Kết quả mong đợi

✅ Commits nhỏ, dễ review
✅ Conflicts tối thiểu
✅ Team dễ hiểu thay đổi
✅ Dễ rollback nếu cần
✅ Git history sạch sẽ
