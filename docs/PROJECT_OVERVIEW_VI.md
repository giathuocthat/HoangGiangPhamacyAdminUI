**Tổng Quan Dự Án**
- **Mục đích**: Đây là một theme admin UI front-end mẫu (React + Vite) dùng làm khung để xây dựng dashboard quản trị (quản lý sản phẩm, bán hàng, POS, báo cáo,...).
- **Công nghệ chính**: **React 19**, **Vite**, **Redux Toolkit**, **PrimeReact**, **Bootstrap 5**, **Sass**. Các thư viện UI/Chart/Calendar/Editor: `antd`, `primereact`, `apexcharts`, `chart.js`, `fullcalendar`, `quill`, v.v.

**Chạy nhanh**
- Cài dependencies và chạy dev server (PowerShell):
```
pnpm install # hoặc npm install / yarn
pnpm dev
```

**Entry point & Luồng khởi động**
- `index.html`: container root.
- `src/main.jsx`: tạo React root và bọc app bằng `Provider` (Redux) + `PrimeReactProvider` và `LazyWrapper`, sau đó mount `AppRouter`.
- `src/app.router.jsx`: cấu hình `BrowserRouter` với `basename` từ `src/environment.jsx` và render `FeatureModule` làm route chính. Các route logic (auth/unauth/pos) được lấy từ `src/routes/path` và `src/routes/all_routes.jsx` chứa danh sách URL đặt tên.

**Luồng điều hướng (routing)**
- `FeatureModule` (ở `src/feature-module/feature-module.jsx`) quyết định layout hiển thị dựa trên loại route: unauth (trang đăng nhập/forgot...), pos (giao diện POS), auth (dashboard chính).
- `FeatureModule` sử dụng `Outlet` để render component con (Route element). Khi là trang auth, component sẽ bọc `Header`, `Sidebar`, các layout như `TwoColumnSidebar` hoặc `HorizontalSidebar`, và `ThemeSettings`.

**State quản lý (Redux)**
- Store: `src/core/redux/store.jsx` dùng `configureStore` (Redux Toolkit) và kết hợp các slice:
  - `sidebarSlice` (`sidebar`): quản lý trạng thái sidebar (mini, mobile, expand, toggleHeader). Các action: `setMiniSidebar`, `setMobileSidebar`, `setExpandMenu`, `setToggleHeader`.
  - `themeSettingSlice` (`themeSetting`): cài đặt giao diện (layout, width, color, loader, RTL,...). Action ví dụ: `setDataLayout`, `setDataWidth`, `setDataTheme`, `setDataSidebar`, `resetAllMode`, `setRtl`, ... Các action trực tiếp cập nhật `localStorage` và `document` attributes để áp dụng CSS vars / attributes.
  - `MainReducer` (`rootReducer`): reducer thuần (không dùng createSlice) chứa nhiều action kiểu string (ví dụ `Product_list`, `Brand_list`, `Lowstock_data`, ...) và `initial.value.jsx` có dữ liệu mock JSON ban đầu.
  - `commonSlice`: placeholder (hiện không có action nào).
- Lưu trạng thái: `localStorage.jsx` (`saveToLocalStorage` / `getPreloadedState`) serialize toàn bộ state để persist giữa reload (store.subscribe gọi `saveToLocalStorage`).

**Các component chính & vai trò**
- `src/feature-module/feature-module.jsx`: wrapper quyết định layout theo route, quản lý preloader khi chuyển route.
- `src/app.router.jsx`: định nghĩa router, gắn `FeatureModule` làm layout root.
- `src/components/header/index.jsx`: header bar ở trên cùng, có logo, search, store selector, nút Add New, notifications, profile menu, fullscreen. Những điểm cần biết:
  - Dùng hook `useEffect` để xử lý fullscreen change và mouseover để tránh lỗi khi mini-sidebar.
  - Gọi DOM trực tiếp (ví dụ `document.body.classList.toggle('mini-sidebar')`) để thay đổi layout.
  - Sử dụng `all_routes` để link tới các route đã đặt tên.
- `src/components/sidebar/index.jsx`: menu bên trái:
  - Dữ liệu menu lấy từ `src/core/json/siderbar_data.js`.
  - Quản lý state mở submenu bằng state local (`subOpen`, `subsidebar`).
  - Tương tác với `themeSetting.expandMenus` và `themeSetting.dataLayout` để điều khiển class (hover/expand/minisidebar).
- `src/components/layouts/*`: chứa nhiều layout khác nhau (two-column, horizontal, collapsed sidebar, themeSettings). `ThemeSettings` cho phép người dùng thay đổi layout và lưu vào `localStorage` thông qua `themeSettingSlice`.
- `src/components/lazy-loading/index.jsx`: provider wrapper dùng `React.Suspense` hoặc logic lazy để load component chậm.
- Các component dùng chung khác: `data-table`, `date-picker`, `select`, `texteditor`, `loader`, `footer`... (xem `src/components` để biết file cụ thể). Những component này cung cấp UI tái sử dụng cho các pages.

**Tệp cấu hình & assets**
- `vite.config.js`: cấu hình Vite (plugin React).
- `src/environment.jsx`: `base_path` (basename cho router) và `image_path`.
- `src/assets`: chứa CSS, SCSS, fonts, icons, hình ảnh. `customStyle.scss` chứa các chỉnh sửa theme riêng.

**Dữ liệu mẫu (mock JSON)**
- Thư mục `src/core/json/` chứa nhiều file JSON mock (product list, brand, units, ...). `initial.value.jsx` import các file này để khởi tạo state ban đầu cho `MainReducer`.

**Cách dữ thêm route / page cơ bản**
1. Tạo component page trong `src/feature-module/...` hoặc `src/feature-module/<module>/`.
2. Thêm đường dẫn tên vào `src/routes/all_routes.jsx` (ví dụ `myNewPage: '/my-new-page'`).
3. Thêm route vào `src/routes/path` (file `path.jsx`) trong mảng `authRoutes` / `unAuthRoutes` hoặc `posPages` tùy trường hợp, gắn `element: <MyNewPage />`.
4. Nếu cần menu item, thêm vào `src/core/json/siderbar_data.js`.

**Cách thay đổi theme / layout**
- `ThemeSettings` gọi action từ `themeSettingSlice` (ví dụ `setDataTheme`, `setDataLayout`). Các action này:
  - cập nhật Redux state,
  - lưu giá trị vào `localStorage`,
  - cập nhật attribute trên `document.documentElement` hoặc `document.body` để CSS có thể đọc giá trị và áp dụng.

**Một số lưu ý khi tùy chỉnh**
- Nhiều component thao tác trực tiếp lên DOM (thêm class vào `body`, `html` hoặc `document.documentElement`); khi viết code mới, cân nhắc dùng Redux + class utility để tránh bên trong component thao tác DOM tùy tiện.
- `MainReducer` dùng action kiểu string (pattern cổ điển) và chứa rất nhiều data mock. Khi mở rộng, cân nhắc chuyển các nhóm dữ liệu sang các slice tạo bằng `createSlice` để rõ ràng.
- Hệ thống lưu toàn bộ state vào `localStorage` (serialize toàn bộ store). Nếu dữ liệu lớn hoặc chứa thông tin nhạy cảm, cần lọc trước khi lưu.

**Nên bắt đầu từ đâu khi bạn muốn tùy biến**
- Gặp UI: mở `src/components/header` / `src/components/sidebar` / `src/components/layouts/*`.
- Muốn thay đổi route/page: `src/routes/all_routes.jsx` + `src/routes/path.jsx` + thêm component page.
- Thay đổi theme mặc định: `src/core/redux/themeSettingSlice.jsx` và `src/assets/scss`.

**Tiếp theo tôi có thể làm giúp bạn**
- Xuất chi tiết file-by-file (ví dụ: `src/components/*`) — từng file giải thích biến, hàm, props và luồng dữ liệu.
- Viết Docs chi tiết cho folder cụ thể (ví dụ `components/header`, `components/sidebar`, `core/redux`).
- Tạo scripts helper để migrate `MainReducer` action -> slices.

Nếu bạn muốn, tôi có thể mở rộng thành bản ghi chép chi tiết từng file (theo folder) — nói rõ bạn muốn bắt đầu từ folder nào, tôi sẽ tạo tiếp tài liệu và giải thích từng component, biến, hàm và luồng hoạt động cụ thể.
