import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * User Management API Service
 * Handles all User-related API calls
 */
class UserApiService extends ApiService {
    /**
     * Create a new user
     * @param {Object} userData - User data
     * @param {string} userData.userName - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.passWord - Password
     * @param {string} userData.fullName - Full name
     * @param {string} userData.phone - Phone number
     * @returns {Promise} Created user
     */
    async createUser(userData) {
        try {
            const response = await this.post(API_ENDPOINTS.USER.CREATE, userData);
            console.log('User created successfully:', response);
            return response;
        } catch (error) {
            console.error('Create user error:', error);
            throw error;
        }
    }

    /**
     * Get user by ID
     * @param {number} id - User ID
     * @returns {Promise} User details
     */
    async getUserById(id) {
        return this.get(API_ENDPOINTS.USER.GET_BY_ID(id));
    }

    /**
     * Update user
     * @param {number} id - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} Update confirmation
     */
    async updateUser(id, userData) {
        return this.put(API_ENDPOINTS.USER.UPDATE(id), userData);
    }

    async getListUser() {
        return this.get(API_ENDPOINTS.USER.GET_ALL);
    }

    async deleteUser(id) {
        return this.delete(API_ENDPOINTS.USER.DELETE(id));
    }
}

// Export singleton instance
export const userApi = new UserApiService();

// Export class for custom instances if needed
export { UserApiService };
