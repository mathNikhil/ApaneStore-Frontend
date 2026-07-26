import API_BASE_URL from '../config/api';

const getToken = () => localStorage.getItem('token');

const apiRequest = async (endpoint, method = 'GET', data = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Something went wrong');
        }
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const authAPI = {
    register: (data) => apiRequest('/api/auth/register', 'POST', data),
    login: (data) => apiRequest('/api/auth/login', 'POST', data),
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return apiRequest('/api/auth/logout', 'POST');
    },
    sendOTP: (data) => apiRequest('/api/auth/otp/send', 'POST', data),
    verifyOTP: (data) => apiRequest('/api/auth/otp/verify', 'POST', data),
};

export const tenantAPI = {
    getMe: () => apiRequest('/api/tenants/me'),
    updateMe: (data) => apiRequest('/api/tenants/me', 'PUT', data),
};

export const storeAPI = {
    getAll: () => apiRequest('/api/stores'),
    getById: (id) => apiRequest(`/api/stores/${id}`),
    create: (data) => apiRequest('/api/stores', 'POST', data),
    update: (id, data) => apiRequest(`/api/stores/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/api/stores/${id}`, 'DELETE'),
};

export const productAPI = {
    getAll: (storeId) => {
        const query = storeId ? `?storeId=${storeId}` : '';
        return apiRequest(`/api/products${query}`);
    },
    getById: (id) => apiRequest(`/api/products/${id}`),
    create: (data) => apiRequest('/api/products', 'POST', data),
    update: (id, data) => apiRequest(`/api/products/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/api/products/${id}`, 'DELETE'),
};

export const healthAPI = {
    check: () => apiRequest('/health'),
};

// Store-scoped customer auth — completely separate from the tenant's own
// session. Uses its own fetch (not apiRequest) so it never attaches or
// overwrites the tenant's 'token' in localStorage.
export const customerAuthAPI = {
    sendOTP: async (storeId, phone) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/auth/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        return response.json();
    },
    verifyOTP: async (storeId, phone, otp) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, otp }),
        });
        return response.json();
    },
};
