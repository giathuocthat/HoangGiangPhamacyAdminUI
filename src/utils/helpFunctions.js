// =============== Hàm 1: Định nghĩa Slug ===============
/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành dạng slug (url-friendly) không dấu.
 * Xử lý chính xác các trường hợp đặc biệt của tiếng Việt như 'đ', 'ỹ', 'ư'.
 * @param {string} str - Chuỗi đầu vào (ví dụ: "Mỹ Phẩm Cao Cấp Đa Năng").
 * @returns {string} Chuỗi đã chuyển thành slug (ví dụ: "my-pham-cao-cap-da-nang").
 */
export const toSlug = (str) => {
  if (!str) return "";

  // 1. Chuyển hết sang chữ thường
  str = String(str).toLowerCase();

  // 2. Xóa dấu bằng cách thay thế trực tiếp các ký tự phức tạp (giải pháp triệt để cho tiếng Việt)
  str = str.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a");
  str = str.replace(/[èéẹẻẽêềếệểễ]/g, "e");
  str = str.replace(/[ìíịỉĩ]/g, "i");
  str = str.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o");
  str = str.replace(/[ùúụủũưừứựửữ]/g, "u");
  str = str.replace(/[ỳýỵỷỹ]/g, "y");
  str = str.replace(/đ/g, "d");

  // 3. Vẫn giữ lại normalize để xử lý các ký tự unicode tổ hợp khác (nếu có)
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 4. Xóa ký tự đặc biệt, giữ lại chữ cái, số, khoảng trắng và dấu gạch ngang
  str = str.replace(/[^a-z0-9\s-]/g, "");

  // 5. Thay khoảng trắng và dấu gạch ngang thừa bằng 1 dấu gạch ngang duy nhất
  str = str.replace(/[\s-]+/g, "-");

  // 6. Xóa gạch ngang ở đầu và cuối chuỗi
  return str.replace(/^-+|-+$/g, "");
};

// =============== Hàm 2: Định dạng ngày tháng ===============
/**
 * Định dạng chuỗi ngày tháng ra định dạng tiếng Việt chi tiết (dd/MM/yyyy - Thứ N - HH:mm:ss).
 * Đã điều chỉnh việc cộng thêm 7 giờ cho đúng múi giờ Việt Nam (UTC+7) một cách chính xác.
 * @param {string} dateString - Chuỗi ngày tháng ISO từ API (ví dụ: "2025-12-05T04:56:00Z").
 * @returns {string} Chuỗi ngày tháng đã định dạng.
 */
export const formatCreatedDate = (dateString) => {
  if (!dateString) return 'N/A';

  // 1. Tạo đối tượng Date. Việc này thường tự động xử lý múi giờ.
  // Nếu chuỗi có đuôi Z (UTC), Date object sẽ tự động chuyển sang giờ local (máy client).
  const date = new Date(dateString);

  // Kiểm tra tính hợp lệ
  if (isNaN(date.getTime())) return 'Invalid Date';

  // 2. Định dạng ngày giờ theo múi giờ local của trình duyệt (thường là UTC+7 ở VN)
  // Sử dụng Intl.DateTimeFormat để đảm bảo định dạng chính xác và locale-aware

  // Định dạng ngày: dd/MM/yyyy
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Định dạng thời gian: HH:mm:ss
  const hours = String(date.getHours() + 7).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // 3. Lấy tên thứ trong tuần (Tiếng Việt)
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = dayNames[date.getDay()];

  // 4. Trả về định dạng mong muốn
  return `${day}/${month}/${year} - ${dayOfWeek} - ${hours}:${minutes}:${seconds}`;
};

// Bonus: Hàm format tiền tệ (nếu cần)
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount || 0);
};