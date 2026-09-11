import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Generate a stable device fingerprint from browser characteristics
const getDeviceFingerprint = () => {
    const raw = [
        navigator.userAgent,
        screen.width + 'x' + screen.height,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.language,
    ].join('|');
    // Simple hash
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) - hash) + raw.charCodeAt(i);
        hash |= 0;
    }
    return String(Math.abs(hash));
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check token expiry — 12 hours on same device, 7 days max
    const getValidToken = () => {
        const token = localStorage.getItem('token');
        let loginTime = localStorage.getItem('loginTime');
        const savedFingerprint = localStorage.getItem('deviceFingerprint');
        if (!token) return null;
        // If loginTime missing (old session before fix) — set it now so session continues
        if (!loginTime) {
            loginTime = Date.now().toString();
            localStorage.setItem('loginTime', loginTime);
        }
        // If fingerprint missing (old session) — set it now
        if (!savedFingerprint) {
            localStorage.setItem('deviceFingerprint', getDeviceFingerprint());
        }

        // Check 7-day hard expiry
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - parseInt(loginTime) > sevenDays) {
            localStorage.removeItem('token');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('user');
            localStorage.removeItem('deviceFingerprint');
            return null;
        }

        // Check 12-hour session on same device
        const twelveHours = 12 * 60 * 60 * 1000;
        const currentFingerprint = getDeviceFingerprint();
        if (savedFingerprint && savedFingerprint !== currentFingerprint) {
            // Different device — clear session, force new OTP
            localStorage.removeItem('token');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('user');
            localStorage.removeItem('deviceFingerprint');
            console.log('🔐 Device changed — session cleared');
            return null;
        }
        if (Date.now() - parseInt(loginTime) > twelveHours) {
            // Same device but 12 hours passed — clear session
            localStorage.removeItem('token');
            localStorage.removeItem('loginTime');
            localStorage.removeItem('user');
            localStorage.removeItem('deviceFingerprint');
            console.log('🔐 12-hour session expired');
            return null;
        }

        return token;
    };
    const [token, setToken] = useState(getValidToken());
    const [loading, setLoading] = useState(true);
    // sessionVerified: true only after tenant enters mobile in current session
    // Uses sessionStorage so it clears when browser/tab closes
    const [sessionVerified, setSessionVerified] = useState(
        !!sessionStorage.getItem('sessionVerified')
    );

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
        
        console.log('🔐 AuthProvider initialized, token:', !!token);
        console.log('🔐 User:', user);
    }, [token]);

    const login = async (identifier, password) => {
        try {
            const result = await authAPI.login({ identifier, password });
            if (result.success) {
                setUser(result.data.tenant);
                setToken(result.data.token);
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.tenant));
                localStorage.setItem('loginTime', Date.now().toString());
                return { success: true };
            }
            return { success: false, error: result.error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    // Save referral code from URL if present
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) localStorage.setItem('referralCode', ref);
    }, []);

    const loginWithOTP = async (phone, otp, purpose = 'login') => {
        try {
            console.log('🔐 loginWithOTP called:', { phone, otp, purpose });
            
            const referralCode = localStorage.getItem('referralCode');
            const result = await authAPI.verifyOTP({ phone, otp, purpose, referralCode });
            
            console.log('🔐 OTP Response:', result);
            
            if (result.success && result.data?.token) {
                console.log('✅ Token received, saving...');
                
                // Save to localStorage
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.tenant));
                
                // Verify it was saved
                console.log('✅ Token saved to localStorage:', !!localStorage.getItem('token'));
                console.log('✅ User saved to localStorage:', !!localStorage.getItem('user'));
                
                setUser(result.data.tenant);
                setToken(result.data.token);
                
                return { success: true, isNewTenant: result.data.isNewTenant, data: result.data };
            }
            
            console.log('❌ No token in response:', result);
            return { success: false, error: result.error || 'OTP verification failed' };
        } catch (error) {
            console.error('❌ OTP verification error:', error);
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
            localStorage.removeItem('loginTime');
            localStorage.removeItem('deviceFingerprint');
            localStorage.removeItem('aapnaestore_store_id');
            ['brandData', 'productData', 'cartData', 'paymentData', 'addressData', 'orderData', 'profileData']
                .forEach(key => localStorage.removeItem(`aapnaestore_builder_${key}`));
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
        setUser,
        token,
        loading,
        login,
        loginWithOTP,
        sendOTP,
        register,
        logout,
        isAuthenticated: !!token && (!!user || !!localStorage.getItem('user')),
        sessionVerified,
        markSessionVerified: () => {
            sessionStorage.setItem('sessionVerified', '1');
            setSessionVerified(true);
        },
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