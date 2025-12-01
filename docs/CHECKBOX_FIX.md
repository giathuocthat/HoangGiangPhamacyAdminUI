# Checkbox Selection Issue - Fixed

## Vấn Đề

Checkbox "Select All" và các checkbox ở từng dòng không hoạt động được.

## Nguyên Nhân

### 1. **Checkbox là Static HTML**
```javascript
// ❌ SAI - Checkbox không có state
header:
  <label className="checkboxs">
    <input type="checkbox" id="select-all" />
    <span className="checkmarks" />
  </label>,
body: () =>
  <label className="checkboxs">
    <input type="checkbox" />
    <span className="checkmarks" />
  </label>
```

**Vấn đề:**
- Checkbox không có `checked` attribute
- Không có `onChange` handler
- Không có state để track selection
- Mỗi checkbox không biết nó thuộc về row nào

### 2. **Không Có State Management**
Không có state để lưu trữ:
- Danh sách brands đã được chọn
- Trạng thái của "Select All" checkbox

### 3. **Không Có Event Handlers**
Không có functions để xử lý:
- Click vào "Select All" checkbox
- Click vào checkbox của từng row

## Giải Pháp

### 1. **Thêm State**
```javascript
const [selectedBrands, setSelectedBrands] = useState([]);
const [selectAll, setSelectAll] = useState(false);
```

**Giải thích:**
- `selectedBrands`: Array chứa IDs của các brands đã được chọn
- `selectAll`: Boolean để track trạng thái của "Select All" checkbox

### 2. **Thêm Event Handlers**

#### Handle Select All
```javascript
const handleSelectAll = (e) => {
  const checked = e.target.checked;
  setSelectAll(checked);
  if (checked) {
    // Select tất cả brands
    setSelectedBrands(brands.map(brand => brand.id));
  } else {
    // Deselect tất cả
    setSelectedBrands([]);
  }
};
```

#### Handle Individual Row Selection
```javascript
const handleSelectRow = (brandId) => {
  setSelectedBrands(prev => {
    if (prev.includes(brandId)) {
      // Nếu đã checked, uncheck nó
      const newSelected = prev.filter(id => id !== brandId);
      setSelectAll(false); // Uncheck "Select All"
      return newSelected;
    } else {
      // Nếu chưa checked, check nó
      const newSelected = [...prev, brandId];
      // Nếu tất cả items đã được chọn, check "Select All"
      setSelectAll(newSelected.length === brands.length);
      return newSelected;
    }
  });
};
```

### 3. **Update Checkbox JSX**

#### Select All Checkbox
```javascript
{
  header:
    <label className="checkboxs">
      <input 
        type="checkbox" 
        id="select-all" 
        checked={selectAll}           // ✅ Bind to state
        onChange={handleSelectAll}    // ✅ Add handler
      />
      <span className="checkmarks" />
    </label>,
  // ...
}
```

#### Row Checkbox
```javascript
{
  // ...
  body: (rowData) =>
    <label className="checkboxs">
      <input 
        type="checkbox" 
        checked={selectedBrands.includes(rowData.id)}  // ✅ Check if selected
        onChange={() => handleSelectRow(rowData.id)}   // ✅ Add handler
      />
      <span className="checkmarks" />
    </label>,
  // ...
}
```

### 4. **Auto-Update Select All**

Thêm useEffect để tự động update "Select All" khi brands thay đổi:

```javascript
useEffect(() => {
  if (brands.length > 0 && selectedBrands.length === brands.length) {
    setSelectAll(true);
  } else {
    setSelectAll(false);
  }
}, [brands, selectedBrands]);
```

## Cách Hoạt Động

### Flow Khi Click "Select All"

1. User click vào "Select All" checkbox
2. `handleSelectAll` được gọi
3. Nếu checked:
   - Set `selectAll = true`
   - Set `selectedBrands = [tất cả brand IDs]`
4. Nếu unchecked:
   - Set `selectAll = false`
   - Set `selectedBrands = []`
5. React re-render với state mới
6. Tất cả checkboxes được update

### Flow Khi Click Row Checkbox

1. User click vào checkbox của một row
2. `handleSelectRow(brandId)` được gọi
3. Nếu brand đã được chọn:
   - Remove brand ID khỏi `selectedBrands`
   - Set `selectAll = false`
4. Nếu brand chưa được chọn:
   - Add brand ID vào `selectedBrands`
   - Nếu tất cả brands đã được chọn → Set `selectAll = true`
5. React re-render với state mới
6. Checkbox của row đó được update

## Sử Dụng Selected Brands

Bạn có thể sử dụng `selectedBrands` state để:

### 1. Bulk Delete
```javascript
const handleBulkDelete = async () => {
  if (selectedBrands.length === 0) {
    alert('Please select brands to delete');
    return;
  }
  
  try {
    // Delete selected brands
    await Promise.all(
      selectedBrands.map(id => brandApi.deleteBrand(id))
    );
    
    // Refresh data
    fetchBrands();
    setSelectedBrands([]);
  } catch (error) {
    console.error('Error deleting brands:', error);
  }
};
```

### 2. Bulk Update
```javascript
const handleBulkActivate = async () => {
  if (selectedBrands.length === 0) {
    alert('Please select brands to activate');
    return;
  }
  
  try {
    await Promise.all(
      selectedBrands.map(id => 
        brandApi.updateBrand(id, { isActive: true })
      )
    );
    
    fetchBrands();
    setSelectedBrands([]);
  } catch (error) {
    console.error('Error activating brands:', error);
  }
};
```

### 3. Export Selected
```javascript
const handleExportSelected = () => {
  const selectedData = brands.filter(brand => 
    selectedBrands.includes(brand.id)
  );
  
  // Export to CSV, Excel, etc.
  exportToCSV(selectedData);
};
```

### 4. Show Selection Count
```javascript
<div className="selection-info">
  {selectedBrands.length > 0 && (
    <span>
      {selectedBrands.length} brand(s) selected
      <button onClick={() => setSelectedBrands([])}>
        Clear Selection
      </button>
    </span>
  )}
</div>
```

## Best Practices

### 1. Reset Selection Khi Đổi Trang
```javascript
useEffect(() => {
  // Reset selection when page changes
  setSelectedBrands([]);
  setSelectAll(false);
}, [currentPage]);
```

### 2. Persist Selection Across Pages (Optional)
```javascript
// Nếu muốn giữ selection khi đổi trang
const [allSelectedBrands, setAllSelectedBrands] = useState([]);

const handleSelectAll = (e) => {
  const checked = e.target.checked;
  setSelectAll(checked);
  
  if (checked) {
    // Add current page brands to all selected
    const currentPageIds = brands.map(b => b.id);
    setAllSelectedBrands(prev => [...new Set([...prev, ...currentPageIds])]);
  } else {
    // Remove current page brands from all selected
    const currentPageIds = brands.map(b => b.id);
    setAllSelectedBrands(prev => prev.filter(id => !currentPageIds.includes(id)));
  }
};
```

### 3. Disable Actions When No Selection
```javascript
<button 
  onClick={handleBulkDelete}
  disabled={selectedBrands.length === 0}
>
  Delete Selected ({selectedBrands.length})
</button>
```

## Tóm Tắt

**Vấn đề:** Checkbox không hoạt động vì:
- ❌ Không có state
- ❌ Không có event handlers
- ❌ Checkbox không biết trạng thái của nó

**Giải pháp:**
- ✅ Thêm state: `selectedBrands`, `selectAll`
- ✅ Thêm handlers: `handleSelectAll`, `handleSelectRow`
- ✅ Bind state và handlers vào checkbox
- ✅ Auto-update "Select All" với useEffect

**Kết quả:**
- ✅ "Select All" checkbox hoạt động
- ✅ Row checkboxes hoạt động
- ✅ Selection được track chính xác
- ✅ Có thể sử dụng `selectedBrands` cho bulk operations
