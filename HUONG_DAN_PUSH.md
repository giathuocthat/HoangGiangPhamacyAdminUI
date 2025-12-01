# 📚 Hướng Dẫn Push Để Minimize Conflicts

## 🎯 Mục tiêu
Khi bạn push lên, các thành viên khác pull về sẽ có **ít conflicts nhất có thể**.

---

## 📊 Tình hình hiện tại

Bạn có **30+ files** thay đổi:
- ✅ Fix product detail navigation (2 files)
- ✅ Backend API enhancement (1 file)
- ✅ Dependencies & config (3 files)
- ✅ Routing updates (1 file)
- ✅ UI/Style updates (11 files)
- ✅ New components (3 folders)
- ✅ Cleanup (7 files)

---

## 🚀 Cách làm (Bước-by-bước)

### **Bước 1: Kiểm tra trạng thái hiện tại**

```bash
git status
```

Bạn sẽ thấy danh sách files đã thay đổi.

---

### **Bước 2: Commit theo nhóm logic (QUAN TRỌNG!)**

**Thay vì** commit tất cả cùng lúc, hãy chia thành các commit nhỏ:

#### **Commit 1: Product Detail Navigation** (Tính năng chính)
```bash
git add src/feature-module/inventory/productlist.jsx
git add src/feature-module/inventory/productdetail.jsx
git commit -m "feat: Add product detail navigation from list

- Update product name link to navigate to /products-details/:id
- Fix import path for ImageLightbox component
- Product list now shows clickable product names"
```

#### **Commit 2: Backend API** (API mới)
```bash
git add server/index.js
git commit -m "feat: Add GET /api/products/:id endpoint

- Fetch single product by ID
- Support filtering by all=1 query param
- Fix price field mapping"
```

#### **Commit 3: Dependencies** (Config)
```bash
git add package.json
git add package-lock.json
git add eslint.config.js
git commit -m "chore: Update ESLint config and dependencies

- Simplify ESLint config (remove TypeScript)
- Add eslint-plugin-react and jsx-a11y
- Reorganize devDependencies"
```

#### **Commit 4: Routing** (Routes)
```bash
git add src/routes/path.jsx
git commit -m "chore: Update route configuration

- Add route for /products-details/:id
- Support both path param and query string for product ID"
```

#### **Commit 5: UI Updates** (Giao diện)
```bash
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
```

#### **Commit 6: New Components** (Tính năng mới)
```bash
git add src/feature-module/inventory/productdetail2.jsx
git add src/feature-module/products/
git add src/layouts/
git commit -m "feat: Add new product detail and layout components

- Add ProductDetail2 component
- Add new product services and components
- Add layout improvements"
```

#### **Commit 7: Cleanup** (Dọn dẹp)
```bash
git add src/feature-module/uiinterface/map/leaflet.jsx
git add src/core/pagination/pagination.jsx
git add src/assets/icons/fontawesome/js/
git add -A
git commit -m "chore: Code cleanup and minor fixes

- Update pagination component
- Fix leaflet map component
- Remove unused ProductsTable component
- Update fontawesome assets"
```

---

### **Bước 3: Kiểm tra commits**

```bash
git log origin/master..HEAD --oneline
```

Bạn sẽ thấy 7 commits mới.

---

### **Bước 4: Pull latest từ remote (QUAN TRỌNG!)**

```bash
git fetch origin
git pull origin master
```

Nếu có conflicts, resolve chúng trước khi push.

---

### **Bước 5: Push lên**

```bash
git push origin master
```

---

## ✅ Lợi ích của cách này

| Lợi ích | Giải thích |
|---------|-----------|
| **Ít conflicts** | Mỗi commit nhỏ, dễ merge |
| **Dễ review** | Team hiểu được từng thay đổi |
| **Dễ rollback** | Nếu có bug, chỉ cần revert 1 commit |
| **Git history sạch** | Dễ trace lại lịch sử thay đổi |
| **Dễ debug** | `git bisect` sẽ nhanh hơn |

---

## 🛡️ Nếu có Conflicts

### Khi pull:
```bash
git pull origin master
# Nếu có conflicts, bạn sẽ thấy:
# CONFLICT (content): Merge conflict in <file>
```

### Cách resolve:
1. Mở file conflict
2. Tìm markers: `<<<<<<`, `======`, `>>>>>>`
3. Chọn phần code bạn muốn giữ
4. Xóa markers
5. Save file

```bash
git add .
git commit -m "chore: Resolve merge conflicts"
git push origin master
```

---

## 📋 Checklist trước Push

- [ ] Tất cả commits đã được tạo
- [ ] Đã pull latest từ remote
- [ ] Không có conflicts
- [ ] Chạy `npm run lint` - không có errors
- [ ] Chạy `npm run build` - build thành công
- [ ] Commit messages rõ ràng

---

## 💬 Thông báo cho Team

Sau khi push, hãy thông báo:

```
🚀 Vừa push lên master:

✅ Commit 1: Product detail navigation
✅ Commit 2: Backend API enhancement  
✅ Commit 3: Dependencies update
✅ Commit 4: Route configuration
✅ Commit 5: UI updates
✅ Commit 6: New components
✅ Commit 7: Code cleanup

Các bạn hãy pull về!
```

---

## 🔍 Xem lại commits

```bash
# Xem tất cả commits
git log --oneline -10

# Xem chi tiết 1 commit
git show <commit-hash>

# Xem diff giữa 2 commits
git diff <commit1> <commit2>
```

---

## ⚠️ Tránh làm những điều này

❌ **Không** commit tất cả cùng lúc
```bash
git add .
git commit -m "Update"  # ❌ Tệ!
```

❌ **Không** push mà không pull trước
```bash
git push origin master  # ❌ Có thể có conflicts!
```

❌ **Không** force push trên shared branch
```bash
git push -f origin master  # ❌ Nguy hiểm!
```

❌ **Không** thay đổi file config mà không thông báo
```bash
# Thay đổi package.json mà không nói với team
# → Mọi người sẽ bị lỗi!
```

---

## 🎓 Tìm hiểu thêm

### Commit message format (Conventional Commits):
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat:` - Tính năng mới
- `fix:` - Sửa bug
- `refactor:` - Cải thiện code
- `chore:` - Công việc khác (config, dependencies)
- `docs:` - Tài liệu
- `test:` - Test

**Ví dụ:**
```
feat: Add product detail navigation

- Update product name link to navigate to /products-details/:id
- Fix import path for ImageLightbox component
```

---

## 📞 Cần giúp?

Nếu có vấn đề:
1. Chạy `git status` để xem tình hình
2. Chạy `git log --oneline` để xem commits
3. Chạy `git diff` để xem thay đổi
4. Hỏi team members nếu không chắc

---

**Chúc bạn push thành công! 🚀**
