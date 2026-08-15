import React from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext';
import { StoreBuilderProvider } from './Context/StoreBuilderContext';
import LoginPage from './components/auth/LoginPage';
import VerifyOTPPage from './components/auth/VerifyOTPPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardPage from './components/dashboard/DashboardPage';
import ProfilePage from './components/dashboard/ProfilePage';
import StoreBuilderRouter from './components/store-builder/StoreBuilderRouter';
import PublishDomainSelection from './components/publish-flow/PublishDomainSelection';
import PublishHostingChoice from './components/publish-flow/PublishHostingChoice';
import PublishHostingSuccess from './components/publish-flow/PublishHostingSuccess';
import PublishOwnHostingConfig from './components/publish-flow/PublishOwnHostingConfig';
import PublishDnsRequired from './components/publish-flow/PublishDnsRequired';
import PublishDnsSuccess from './components/publish-flow/PublishDnsSuccess';
import PublishPayment from './components/publish-flow/PublishPayment';
import PublishCongratulations from './components/publish-flow/PublishCongratulations';
import PublishAlreadyLive from './components/publish-flow/PublishAlreadyLive';
import PublishQuickConfirm from './components/publish-flow/PublishQuickConfirm';

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
      <Toaster position="top-center" toastOptions={{ duration: 4000, style: { borderRadius: '10px', fontWeight: '500', fontSize: '14px' }, success: { style: { background: '#006d2f', color: '#fff' } }, error: { style: { background: '#ba1a1a', color: '#fff' } } }} />
      <StoreBuilderProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            
            {/* Tenant Routes (Protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            {/* Publish Flow Routes - outside StoreBuilderRouter to avoid context conflicts */}
            <Route path="/store-builder/publish/domain" element={<ProtectedRoute><PublishDomainSelection /></ProtectedRoute>} />
            <Route path="/store-builder/publish/hosting" element={<ProtectedRoute><PublishHostingChoice /></ProtectedRoute>} />
            <Route path="/store-builder/publish/hosting-success" element={<ProtectedRoute><PublishHostingSuccess /></ProtectedRoute>} />
            <Route path="/store-builder/publish/own-hosting" element={<ProtectedRoute><PublishOwnHostingConfig /></ProtectedRoute>} />
            <Route path="/store-builder/publish/dns" element={<ProtectedRoute><PublishDnsRequired /></ProtectedRoute>} />
            <Route path="/store-builder/publish/dns-success" element={<ProtectedRoute><PublishDnsSuccess /></ProtectedRoute>} />
            <Route path="/store-builder/publish/payment" element={<ProtectedRoute><PublishPayment /></ProtectedRoute>} />
            <Route path="/store-builder/publish/success" element={<ProtectedRoute><PublishCongratulations /></ProtectedRoute>} />
            <Route path="/store-builder/publish/already-live" element={<ProtectedRoute><PublishAlreadyLive /></ProtectedRoute>} />
            <Route path="/store-builder/publish/quick-confirm" element={<ProtectedRoute><PublishQuickConfirm /></ProtectedRoute>} />

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