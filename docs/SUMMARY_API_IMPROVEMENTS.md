# Summary - API Double Call & Improvements

## 📋 Vấn Đề

API `getBrands` được gọi **2 lần** khi component mount.

## ✅ Nguyên Nhân & Giải Pháp

### Tại Sao API Được Gọi 2 Lần?

**React 18 Strict Mode** (Development only):
- React mount → unmount → remount component
- Giúp phát hiện bugs (memory leaks, stale closures)
- **KHÔNG xảy ra trong Production**

### Đây KHÔNG Phải Bug!

- ✅ Đây là behavior mong muốn của React 18
- ✅ Chỉ xảy ra trong Development mode
- ✅ Production build chỉ gọi API 1 lần
- ✅ Giúp đảm bảo code robust

## 🔧 Improvements Đã Thực Hiện

### 1. **Added Cleanup Function**

```javascript
useEffect(() => {
  let isActive = true;  // ← Cleanup flag

  const fetchBrands = async () => {
    // ... fetch logic ...
    if (isActive) {  // ← Only update if still mounted
      setBrands(transformedData);
      setTotalRecords(result.pagination.totalCount);
    }
  };

  fetchBrands();

  return () => {
    isActive = false;  // ← Cleanup on unmount
  };
}, [currentPage, rows]);
```

**Lợi ích:**
- ✅ Tránh state updates trên unmounted component
- ✅ Tránh memory leaks
- ✅ Tránh race conditions

### 2. **Simplified Selection Logic**

**Before:**
```javascript
const handleSelectRow = (brandId) => {
  setSelectedBrands(prev => {
    if (prev.includes(brandId)) {
      const newSelected = prev.filter(id => id !== brandId);
      setSelectAll(false);  // ← Stale closure risk
      return newSelected;
    } else {
      const newSelected = [...prev, brandId];
      setSelectAll(newSelected.length === brands.length);  // ← Stale closure
      return newSelected;
    }
  });
};
```

**After:**
```javascript
const handleSelectRow = (brandId) => {
  setSelectedBrands(prev => 
    prev.includes(brandId)
      ? prev.filter(id => id !== brandId)
      : [...prev, brandId]
  );
};

// Separate useEffect handles selectAll
useEffect(() => {
  setSelectAll(
    brands.length > 0 && selectedBrands.length === brands.length
  );
}, [brands, selectedBrands]);
```

**Lợi ích:**
- ✅ Tách concerns
- ✅ Tránh stale closures
- ✅ Code sạch hơn
- ✅ Dễ maintain

### 3. **Reset Selection On Page Change**

```javascript
useEffect(() => {
  setSelectedBrands([]);
  setSelectAll(false);
}, [currentPage]);
```

**Lợi ích:**
- ✅ UX tốt hơn
- ✅ Tránh confusion khi đổi trang
- ✅ Consistent behavior

## 📊 Kiểm Tra

### Development Mode (với Strict Mode)
```
Network Tab:
GET /api/brand?pageNumber=1&pageSize=10  (1st - mount)
GET /api/brand?pageNumber=1&pageSize=10  (2nd - remount)
```

### Production Mode
```
Network Tab:
GET /api/brand?pageNumber=1&pageSize=10  (only 1 call)
```

## 📝 Best Practices Implemented

1. ✅ **Cleanup function** trong useEffect
2. ✅ **isActive flag** để tránh state updates trên unmounted component
3. ✅ **Separated concerns** - tách selection logic
4. ✅ **Reset selection** khi đổi trang
5. ✅ **Giữ Strict Mode enabled** - không tắt

## 🎯 Kết Luận

### Nên Làm Gì?

✅ **Chấp nhận double call trong dev**
- Đây là feature, không phải bug
- Giúp phát hiện vấn đề sớm
- Không ảnh hưởng Production

✅ **Implement cleanup**
- Tránh memory leaks
- Tránh race conditions
- Code robust hơn

❌ **Không nên:**
- Tắt Strict Mode
- Cố gắng prevent double call
- Lo lắng về performance (chỉ trong dev)

## 📚 Documentation

Chi tiết xem file: `docs/API_DOUBLE_CALL.md`

## 🔍 Verify Production

```bash
npm run build
npm run preview
```

Mở Network tab → API chỉ được gọi 1 lần ✅
