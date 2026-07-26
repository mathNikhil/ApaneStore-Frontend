import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import API_BASE_URL from '../../config/api';
import DashboardFirstTime from './DashboardFirstTime';
import DashboardReturnUser from './DashboardReturnUser';

const DashboardPage = () => {
    const { user } = useAuth();
    const [hasStores, setHasStores] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkUserStores();
    }, []);

    const checkUserStores = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/stores`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                setHasStores(result.data.length > 0);
            }
        } catch (error) {
            console.error('Error checking stores:', error);
            setHasStores(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-[#3c4a3d]">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Show different dashboard based on whether user has stores
    return hasStores ? <DashboardReturnUser /> : <DashboardFirstTime />;
};

export default DashboardPage;
