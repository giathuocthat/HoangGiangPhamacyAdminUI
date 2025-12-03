# Create Order Module

Trang tạo đơn hàng mới với tính năng tìm kiếm khách hàng và tạo khách hàng nhanh.

## 📂 Cấu trúc Files

```
src/feature-module/sales/create-order/
├── CreateOrder.jsx              # Main page component
├── CustomerSearchBox.jsx        # Component tìm kiếm khách hàng
├── CustomerInfoDisplay.jsx      # Hiển thị thông tin khách hàng
├── CreateCustomerModal.jsx      # Modal tạo khách hàng mới
└── README.md                    # File này
```

## 🚀 Truy cập

**URL:** `/create-order`

**Sidebar Menu:** Sales → Create Order

## ✨ Tính năng

### 1. Tìm kiếm khách hàng
- Nhập số điện thoại (tối thiểu 3 số)
- Auto search sau 500ms debounce
- Hiển thị dropdown kết quả với:
  - Tên khách hàng
  - Số điện thoại
  - Địa chỉ
  - Loại hình kinh doanh

### 2. Tạo khách hàng mới
- Click nút "+" bên cạnh ô tìm kiếm
- Modal popup với form đầy đủ:
  - **Thông tin cơ bản:** Họ tên, SĐT, Email, Loại hình KD
  - **Địa chỉ:** Địa chỉ, Tỉnh/TP, Phường/Xã (cascading)
  - **Người nhận hàng:** Tên và SĐT (optional)
- Validation frontend
- Auto populate thông tin sau khi tạo thành công

### 3. Hiển thị thông tin khách hàng
- Layout 2 cột responsive
- Hiển thị đầy đủ thông tin
- Nút "Thay đổi" để chọn lại khách hàng

## 🔧 API Endpoints

### Backend (C# .NET)

1. **Search Customer**
   ```
   GET /api/customer/search?phoneNumber={phone}
   ```
   - Partial match
   - Trả về tối đa 10 kết quả
   - Include: BusinessType, Addresses, Province, Ward

2. **Create Customer**
   ```
   POST /api/customer
   Content-Type: application/json

   {
     "fullName": "string",
     "phoneNumber": "string",
     "email": "string",
     "businessTypeId": number,
     "addressLine": "string",
     "provinceId": number,
     "wardId": number,
     "recipientName": "string",
     "addressPhoneNumber": "string"
   }
   ```

3. **Master Data APIs** (đã có sẵn)
   ```
   GET /api/businesstype
   GET /api/province
   GET /api/ward/byprovince/{provinceId}
   ```

## 📋 Validation Rules

### Bắt buộc (*)
- Họ tên (max 100 chars)
- Số điện thoại (10-11 số)
- Loại hình kinh doanh
- Địa chỉ (max 500 chars)
- Tỉnh/Thành phố
- Phường/Xã

### Optional
- Email (phải đúng format)
- Tên người nhận hàng
- SĐT người nhận (10-11 số nếu có)

## 🎨 UI Components

### CustomerSearchBox
**Props:**
- `onCustomerSelect`: (customer) => void
- `onCreateNew`: () => void

**Features:**
- Debounce search
- Loading state
- Dropdown results
- Empty state message

### CustomerInfoDisplay
**Props:**
- `customer`: Object
- `onClear`: () => void

**Layout:**
- 2 cột responsive (Bootstrap grid)
- Icons cho từng field
- Badge cho business type

### CreateCustomerModal
**Props:**
- `onSuccess`: (newCustomer) => void

**Features:**
- Bootstrap modal
- Form validation
- Dynamic ward loading (based on province)
- Loading state khi submit

## 🔄 Flow Hoạt động

```
1. User vào /create-order
   ↓
2. Tìm kiếm khách hàng
   ├─→ Tìm thấy → Click chọn → Populate info
   └─→ Không tìm thấy → Click "+" → Modal
       ↓
3. Điền form trong modal
   ↓
4. Submit → POST /api/customer
   ↓
5. Success → Auto populate → Đóng modal
   ↓
6. Hiển thị thông tin khách hàng
   ↓
7. [TODO] Chọn sản phẩm & tạo order
```

## 📝 TODO - Phase tiếp theo

- [ ] Order details form (chọn sản phẩm)
- [ ] Product search và quantity input
- [ ] Tính toán giá, discount, tax
- [ ] Payment method selection
- [ ] Submit order API integration
- [ ] Print order/invoice
- [ ] Toast notifications (thay alert)

## 🐛 Troubleshooting

### Lỗi "Cannot find module"
- Check import paths trong CreateOrder.jsx
- Verify routing trong path.jsx

### API không hoạt động
- Check CORS settings
- Verify API base URL trong api.config.js
- Check backend server đang chạy

### Modal không hiện
- Check Bootstrap JS đã load chưa
- Check modal ID: `create-customer-modal`

### Dropdown không hiện kết quả
- Check API response format
- Check `response.data` structure
- Open DevTools console để xem errors

## 📚 Dependencies

### Frontend
- React
- React Router DOM
- Bootstrap 5
- CommonSelect component (đã có sẵn)

### Backend
- ASP.NET Core
- Entity Framework Core
- CustomerService, CustomerRepository

## 🔗 Related Files

### Backend
- `CustomerController.cs` - Controller với search endpoint
- `CustomerService.cs` - Business logic
- `CustomerRepository.cs` - Data access
- `CreateCustomerDto.cs` - DTO cho API

### Frontend Config
- `src/config/api.config.js` - API endpoints
- `src/services/api.service.js` - API service class
- `src/routes/all_routes.jsx` - Route definition
- `src/routes/path.jsx` - Route mapping
- `src/core/json/sidebar_dataone.js` - Sidebar menu

## 📞 Support

Nếu có vấn đề, check:
1. Console logs (F12)
2. Network tab để xem API calls
3. Backend logs

---

**Created:** 2025-12-02
**Last Updated:** 2025-12-02
