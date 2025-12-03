import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/auth.service';
import { all_routes } from '../routes/all_routes';

/**
 * Protected Route Component
 * Kiểm tra xem user đã đăng nhập chưa (có token trong localStorage)
 * Nếu chưa đăng nhập, redirect về trang login
 */
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const routes = all_routes;

    // Kiểm tra xem user đã có token chưa
    const isAuthenticated = authApi.isAuthenticated();

    if (!isAuthenticated) {
        // Lưu lại URL mà user đang cố truy cập để redirect sau khi login
        return <Navigate to={routes.signin} state={{ from: location }} replace />;
    }

    // Nếu đã có token, cho phép truy cập
    return children;
};

export default ProtectedRoute;
