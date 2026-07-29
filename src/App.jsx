import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { StoreBuilderProvider } from './Context/StoreBuilderContext';
import LoginPage from './components/auth/LoginPage';
import VerifyOTPPage from './components/auth/VerifyOTPPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './components/dashboard/DashboardPage';
import ProfilePage from './components/dashboard/ProfilePage';
import StoreBuilderRouter from './components/store-builder/StoreBuilderRouter';

// Super Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTenants from './pages/admin/AdminTenants';
import AdminStores from './pages/admin/AdminStores';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';

import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <StoreBuilderProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            
            {/* Tenant Routes (Protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* ✅ FIX: Add /* to match any nested routes */}
            <Route path="/store-builder/*" element={<ProtectedRoute><StoreBuilderRouter /></ProtectedRoute>} />
            
            {/* Super Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/admin/tenants" element={<AdminProtectedRoute><AdminTenants /></AdminProtectedRoute>} />
            <Route path="/admin/stores" element={<AdminProtectedRoute><AdminStores /></AdminProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </StoreBuilderProvider>
    </AuthProvider>
  );
}

export default App;