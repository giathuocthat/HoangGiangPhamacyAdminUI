import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * User Management API Service
 * Handles all User-related API calls
 */
class RoleApiService extends ApiService {

    async getListRole() {
        return this.get(API_ENDPOINTS.ROLE.GET_ALL);
    }
}

// Export singleton instance
export const roleApi = new RoleApiService();

// Export class for custom instances if needed
export { RoleApiService };
