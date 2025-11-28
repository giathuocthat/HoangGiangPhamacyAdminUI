// src/services/api/BaseAPI.js
import axiosClient from './axiosClient';

/**
 * Lớp BaseAPI cung cấp các phương thức HTTP cơ bản.
 * Các service API cụ thể sẽ kế thừa từ lớp này.
 */
class baseAPI {
  /**
   * Khởi tạo với endpoint cơ sở (ví dụ: '/users', '/products')
   * @param {string} endpoint - Endpoint cơ sở của resource.
   */
  constructor(endpoint) {
    if (!endpoint) {
      throw new Error('Endpoint is required for BaseAPI');
    }
    // Đảm bảo endpoint không có dấu / ở cuối
    this.endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  // --- PHƯƠNG THỨC GET (ĐỌC) ---

  /**
   * Lấy tất cả các resource (danh sách).
   * @param {object} params - Tham số truy vấn (ví dụ: { page: 1, limit: 10 }).
   * @returns {Promise<any>}
   */
  getAll(params = {}) {
    return axiosClient.get(this.endpoint, { params });
  }

  /**
   * Lấy một resource cụ thể bằng ID.
   * @param {string|number} id - ID của resource.
   * @returns {Promise<any>}
   */
  getById(id) {
    const url = `${this.endpoint}/${id}`;
    return axiosClient.get(url);
  }

  // --- PHƯƠNG THỨC POST (TẠO) ---

  /**
   * Tạo một resource mới.
   * @param {object} data - Dữ liệu cần gửi đi.
   * @returns {Promise<any>}
   */
  create(data) {
    return axiosClient.post(this.endpoint, data);
  }

  // --- PHƯƠNG THỨC PUT (CẬP NHẬT TOÀN BỘ) ---

  /**
   * Cập nhật toàn bộ resource bằng ID.
   * @param {string|number} id - ID của resource.
   * @param {object} data - Dữ liệu cập nhật.
   * @returns {Promise<any>}
   */
  update(id, data) {
    const url = `${this.endpoint}/${id}`;
    return axiosClient.put(url, data);
  }

  // --- PHƯƠNG THỨC DELETE (XÓA) ---

  /**
   * Xóa một resource bằng ID.
   * @param {string|number} id - ID của resource.
   * @returns {Promise<any>}
   */
  delete(id) {
    const url = `${this.endpoint}/${id}`;
    return axiosClient.delete(url);
  }
}

export default baseAPI;