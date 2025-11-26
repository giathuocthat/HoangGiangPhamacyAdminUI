// src/services/api/axiosClient.js
import axios from 'axios';

// Lấy base URL từ biến môi trường
const BASE_URL = 'http://192.168.1.150:5000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Thời gian chờ 10 giây
});

/*
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data trực tiếp
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Unauthorized, redirecting to login...');
      // Bạn có thể thêm logic clear token và chuyển hướng ở đây
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
*/

export default axiosClient;