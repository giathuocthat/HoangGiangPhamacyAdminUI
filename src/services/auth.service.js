import { ApiService } from './api.service';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
class AuthApiService extends ApiService {
    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Login response with user data and token
     */
    async getToken(email, password) {
        try {
            const response = await this.post(API_ENDPOINTS.AUTH.TOKEN, {
                email,
                password
            });

            // Store token if provided
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }

            // Store user data if provided
            if (response.user) {
                localStorage.setItem('userData', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    
    async login(email, password) {
        try {
            const response = await this.post(API_ENDPOINTS.AUTH.LOGIN, {
                email,
                password
            });

            // Store token if provided
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }

            // Store user data if provided
            if (response.user) {
                localStorage.setItem('userData', JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     * @returns {Promise} Logout confirmation
     */
    async logout() {
        try {
            const response = await this.post(API_ENDPOINTS.AUTH.LOGOUT);

            // Clear stored data
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');

            return response;
        } catch (error) {
            console.error('Logout error:', error);
            // Clear data even if API call fails
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            throw error;
        }
    }

    /**
     * Verify user token
     * @returns {Promise} Verification response
     */
    async verifyToken() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('No token found');
        }

        try {
            return await this.get(API_ENDPOINTS.AUTH.VERIFY);
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }

    /**
     * Get stored auth token
     * @returns {string|null} Auth token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Get stored user data
     * @returns {Object|null} User data
     */
    getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!this.getToken();
    }
}

// Export singleton instance
export const authApi = new AuthApiService();

// Export class for custom instances if needed
export { AuthApiService };
