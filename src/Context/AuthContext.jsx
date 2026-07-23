import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, [token]);

    const login = async (identifier, password) => {
        try {
            const result = await authAPI.login({ identifier, password });
            if (result.success) {
                setUser(result.data.tenant);
                setToken(result.data.token);
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.tenant));
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Passwordless login: verifies the OTP, and on success the backend
    // returns a real tenant + token (auto-creating the tenant on first login).
    const loginWithOTP = async (phone, otp, purpose = 'login') => {
        try {
            const result = await authAPI.verifyOTP({ phone, otp, purpose });
            if (result.success && result.data?.token) {
                setUser(result.data.tenant);
                setToken(result.data.token);
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.tenant));
                return { success: true, isNewTenant: result.data.isNewTenant };
            }
            return { success: false, error: result.error || 'OTP verification failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (userData) => {
        try {
            const result = await authAPI.register(userData);
            if (result.success) {
                return { success: true, data: result.data };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('apnaestore_store_id');
            ['brandData', 'productData', 'cartData', 'paymentData', 'addressData', 'orderData', 'profileData']
                .forEach(key => localStorage.removeItem(`apnaestore_builder_${key}`));
        }
    };

    const sendOTP = async (phone, purpose = 'login') => {
        try {
            const result = await authAPI.sendOTP({ phone, purpose });
            return result;
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        loginWithOTP,
        sendOTP,
        register,
        logout,
        isAuthenticated: !!token && !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
