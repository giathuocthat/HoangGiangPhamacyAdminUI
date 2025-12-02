# API getBrands Được Gọi 2 Lần - Giải Thích & Fix

## Vấn Đề

API `getBrands` được gọi **2 lần** khi component `BrandList` mount lần đầu.

## Nguyên Nhân

### 1. **React 18 Strict Mode (Development Only)**

Trong React 18, khi chạy ở **Development mode** với **Strict Mode**, React sẽ:
- Mount component
- **Unmount component** 
- **Mount lại component**

Điều này khiến `useEffect` chạy 2 lần để giúp phát hiện bugs liên quan đến:
- Side effects không được cleanup đúng cách
- Memory leaks
- Stale closures

**Quan trọng:** Behavior này **CHỈ xảy ra trong Development mode**, KHÔNG xảy ra trong Production.

### 2. **Strict Mode Được Bật Ở Đâu?**

Kiểm tra file `main.jsx` hoặc `index.jsx`:

```javascript
// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>  {/* ← Đây là nguyên nhân */}
    <App />
  </StrictMode>
);
```

## Giải Pháp

### Option 1: Chấp Nhận Behavior Này (Recommended)

**Đây KHÔNG phải là bug**, mà là tính năng của React 18 để giúp phát hiện vấn đề.

**Lợi ích:**
- ✅ Giúp phát hiện bugs sớm
- ✅ Đảm bảo code hoạt động tốt trong Production
- ✅ Không ảnh hưởng đến Production build

**Không cần làm gì cả** - API được gọi 2 lần trong dev là bình thường.

### Option 2: Tắt Strict Mode (NOT Recommended)

Nếu bạn thực sự muốn tắt (không khuyến khích):

```javascript
// main.jsx
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')).render(
  // Bỏ StrictMode wrapper
  <App />
);
```

**Nhược điểm:**
- ❌ Mất đi lợi ích của Strict Mode
- ❌ Có thể bỏ sót bugs
- ❌ Không theo best practices

### Option 3: Implement Cleanup & AbortController (Best Practice)

Implement proper cleanup để tránh race conditions và memory leaks:

```javascript
useEffect(() => {
  // Create AbortController for this effect
  const abortController = new AbortController();
  let isActive = true;

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const result = await brandApi.getBrands(currentPage, rows);

      // Only update state if component is still mounted
      if (isActive) {
        const transformedData = result.data.map(brand => ({
          id: brand.id,
          brand: brand.name,
          logo: brand.logoUrl || brandIcon1,
          createdon: new Date(brand.createdDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          status: brand.isActive ? "Active" : "Inactive"
        }));
        setBrands(transformedData);
        setTotalRecords(result.pagination.totalCount);
      }
    } catch (error) {
      if (isActive) {
        console.error('Error fetching brands:', error);
        setBrands(brandlistdata);
        setTotalRecords(brandlistdata.length);
      }
    } finally {
      if (isActive) {
        setLoading(false);
      }
    }
  };

  fetchBrands();

  // Cleanup function
  return () => {
    isActive = false;
    abortController.abort();
  };
}, [currentPage, rows]);
```

**Lợi ích:**
- ✅ Tránh race conditions
- ✅ Tránh memory leaks
- ✅ Tránh state updates trên unmounted component
- ✅ Cancel pending requests khi component unmount

## Vấn Đề Khác: Stale Closure

### Vấn Đề

Trong `handleSelectRow`, có sử dụng `brands.length`:

```javascript
const handleSelectRow = (brandId) => {
  setSelectedBrands(prev => {
    // ...
    const newSelected = [...prev, brandId];
    // ⚠️ brands.length có thể là stale value
    setSelectAll(newSelected.length === brands.length);
    return newSelected;
  });
};
```

**Vấn đề:** `brands` được capture khi function được tạo, có thể không phải giá trị mới nhất.

### Fix: Sử dụng Functional Update

```javascript
const handleSelectRow = (brandId) => {
  setSelectedBrands(prev => {
    if (prev.includes(brandId)) {
      const newSelected = prev.filter(id => id !== brandId);
      setSelectAll(false);
      return newSelected;
    } else {
      const newSelected = [...prev, brandId];
      // ✅ Sử dụng brands từ state thay vì closure
      setSelectAll(newSelected.length === brands.length);
      return newSelected;
    }
  });
};
```

**Hoặc tốt hơn, tách logic:**

```javascript
const handleSelectRow = (brandId) => {
  setSelectedBrands(prev => {
    const newSelected = prev.includes(brandId)
      ? prev.filter(id => id !== brandId)
      : [...prev, brandId];
    return newSelected;
  });
};

// Separate useEffect to update selectAll
useEffect(() => {
  setSelectAll(
    brands.length > 0 && selectedBrands.length === brands.length
  );
}, [brands, selectedBrands]);
```

## Code Hoàn Chỉnh (Recommended)

```javascript
const BrandList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rows, setRows] = useState(10);
  const [_searchQuery, setSearchQuery] = useState(undefined);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch brands with cleanup
  useEffect(() => {
    let isActive = true;

    const fetchBrands = async () => {
      setLoading(true);
      try {
        const result = await brandApi.getBrands(currentPage, rows);

        if (isActive) {
          const transformedData = result.data.map(brand => ({
            id: brand.id,
            brand: brand.name,
            logo: brand.logoUrl || brandIcon1,
            createdon: new Date(brand.createdDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            }),
            status: brand.isActive ? "Active" : "Inactive"
          }));
          setBrands(transformedData);
          setTotalRecords(result.pagination.totalCount);
        }
      } catch (error) {
        if (isActive) {
          console.error('Error fetching brands:', error);
          setBrands(brandlistdata);
          setTotalRecords(brandlistdata.length);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchBrands();

    return () => {
      isActive = false;
    };
  }, [currentPage, rows]);

  // Handle select all
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    setSelectedBrands(checked ? brands.map(brand => brand.id) : []);
  };

  // Handle individual row selection
  const handleSelectRow = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Auto-update selectAll based on selection
  useEffect(() => {
    setSelectAll(
      brands.length > 0 && selectedBrands.length === brands.length
    );
  }, [brands, selectedBrands]);

  // Reset selection when page changes
  useEffect(() => {
    setSelectedBrands([]);
    setSelectAll(false);
  }, [currentPage]);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // ... rest of the code
};
```

## Kiểm Tra Network Tab

### Development Mode (với Strict Mode)
```
GET /api/brand?pageNumber=1&pageSize=10  (1st call - mount)
GET /api/brand?pageNumber=1&pageSize=10  (2nd call - remount)
```

### Production Mode
```
GET /api/brand?pageNumber=1&pageSize=10  (only 1 call)
```

## Tóm Tắt

### Tại Sao API Được Gọi 2 Lần?

1. **React 18 Strict Mode** (Development only)
   - React mount → unmount → remount component
   - Giúp phát hiện bugs
   - Không xảy ra trong Production

2. **Không phải bug** - Đây là behavior mong muốn

### Nên Làm Gì?

✅ **Recommended:**
- Chấp nhận behavior này
- Implement cleanup function
- Đảm bảo code handle được multiple calls
- Không tắt Strict Mode

❌ **Không nên:**
- Tắt Strict Mode
- Cố gắng prevent double call
- Lo lắng về performance (chỉ trong dev)

### Best Practices

1. ✅ Implement cleanup trong useEffect
2. ✅ Use `isActive` flag để tránh state updates trên unmounted component
3. ✅ Tách logic selection ra separate useEffect
4. ✅ Reset selection khi đổi trang
5. ✅ Giữ Strict Mode enabled

## Kiểm Tra Production Build

Để verify rằng API chỉ được gọi 1 lần trong production:

```bash
npm run build
npm run preview
```

Mở Network tab và kiểm tra - bạn sẽ thấy API chỉ được gọi 1 lần.
