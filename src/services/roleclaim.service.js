import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Role Claim API Service
 * Handles all Role Claim-related API calls
 */
class RoleClaimApiService extends ApiService {

    async getListRoleClaim(roleId) {
        return this.get(API_ENDPOINTS.ROLE_CLAIM.GET_BY_ROLE(roleId));
    }
}

// Export singleton instance
export const roleClaimApi = new RoleClaimApiService();

// Export class for custom instances if needed
export { RoleClaimApiService };
