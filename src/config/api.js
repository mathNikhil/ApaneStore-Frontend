const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URLS = {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    refreshToken: `${API_BASE_URL}/api/auth/refresh-token`,
    sendOTP: `${API_BASE_URL}/api/auth/otp/send`,
    verifyOTP: `${API_BASE_URL}/api/auth/otp/verify`,
    tenants: `${API_BASE_URL}/api/tenants`,
    tenant: (id) => `${API_BASE_URL}/api/tenants/${id}`,
    stores: `${API_BASE_URL}/api/stores`,
    store: (id) => `${API_BASE_URL}/api/stores/${id}`,
    products: `${API_BASE_URL}/api/products`,
    product: (id) => `${API_BASE_URL}/api/products/${id}`,
    health: `${API_BASE_URL}/health`,
    // Admin
    adminLogin: `${API_BASE_URL}/api/admin/login`,
    adminTenants: `${API_BASE_URL}/api/admin/tenants`,
    adminStores: `${API_BASE_URL}/api/admin/stores`,
};

export default API_BASE_URL;
