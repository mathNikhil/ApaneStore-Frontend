const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const getToken = () => {
    return localStorage.getItem('token');
};

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
        const url = `${API_BASE_URL}${endpoint}`;
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Something went wrong');
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
    getAdminPassword: (id) => apiRequest(`/api/stores/${id}/admin-password`),
    generateAdminPassword: (id) => apiRequest(`/api/stores/${id}/admin-password/generate`, 'POST'),
    getPublishFlowState: (id) => apiRequest(`/api/stores/${id}/publish-flow`),
    saveDomainConfig: (id, data) => apiRequest(`/api/stores/${id}/domain-config`, 'PUT', data),
    verifyDns: (id) => apiRequest(`/api/stores/${id}/domain-config/verify-dns`, 'POST'),
    completePayment: (id, paymentMethod, billingCycle, termsAccepted) => apiRequest(`/api/stores/${id}/payment`, 'POST', { paymentMethod, billingCycle, termsAccepted }),
};

export const pricingAPI = {
    getAll: () => apiRequest('/api/pricing-plans'),
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

export const termsAPI = {
    getCurrent: () => apiRequest('/api/terms'),
};

export const publicStoreAPI = {
    getBySubdomain: async (subdomain) => {
        const response = await fetch(`${API_BASE_URL}/api/public/store/${subdomain}`);
        return response.json();
    },
};

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

export const customerReturnAPI = {
    create: async (storeId, token, orderId, reason) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/orders/${orderId}/return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reason }),
        });
        return response.json();
    },
    getForOrder: async (storeId, token, orderId) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/orders/${orderId}/return`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.json();
    },
    uploadPhoto: async (storeId, token, orderId, file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/orders/${orderId}/return/photos`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
        });
        return response.json();
    },
    submitCustomerShipping: async (storeId, token, orderId, courierName, trackingNumber) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/orders/${orderId}/return/customer-shipping`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ courierName, trackingNumber }),
        });
        return response.json();
    },
};

export const customerProfileAPI = {
    getMe: async (storeId, token) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/customers/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.json();
    },
    updateMe: async (storeId, token, data) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/customers/me`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data),
        });
        return response.json();
    },
    addAddress: async (storeId, token, address) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/customers/me/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(address),
        });
        return response.json();
    },
    updateAddress: async (storeId, token, addressId, address) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/customers/me/addresses/${addressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(address),
        });
        return response.json();
    },
    deleteAddress: async (storeId, token, addressId) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/customers/me/addresses/${addressId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.json();
    },
    setDefaultAddress: async (storeId, token, addressId) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/customers/me/addresses/${addressId}/default`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.json();
    },
};

export const customerOrderAPI = {
    create: async (storeId, token, orderData) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });
        return response.json();
    },
    getMine: async (storeId, token) => {
        const response = await fetch(`${API_BASE_URL}/api/store/${storeId}/orders/mine`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return response.json();
    },
};
