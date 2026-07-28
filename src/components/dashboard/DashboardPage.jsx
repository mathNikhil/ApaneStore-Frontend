import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardFirstTime from './DashboardFirstTime';
import DashboardReturnUser from './DashboardReturnUser';

const DashboardPage = () => {
    const [hasStores, setHasStores] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stores, setStores] = useState([]);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

    useEffect(() => {
        checkUserStores();
    }, []);

    const checkUserStores = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                setHasStores(false);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_URL}/api/stores`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data?.success && response.data?.data) {
                setStores(response.data.data);
                setHasStores(response.data.data.length > 0);
            } else {
                setHasStores(false);
            }
        } catch (error) {
            console.error('❌ Error checking stores:', error);
            setError(error.response?.data?.error || error.message);
            setHasStores(false);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Callback to update store status
    const handleStoreUpdate = (storeId, newStatus) => {
        setStores(prevStores => 
            prevStores.map(store => 
                store.id === storeId 
                    ? { ...store, status: newStatus }
                    : store
            )
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                <span className="ml-2 text-gray-500">Loading...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full text-center border border-red-200">
                    <span className="material-symbols-outlined text-4xl text-red-500 block mb-4">error</span>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Error Loading Dashboard</h3>
                    <p className="text-gray-600 text-sm">{error}</p>
                    <button 
                        onClick={checkUserStores}
                        className="mt-4 px-4 py-2 bg-[#25D366] text-[#005523] rounded-lg font-semibold hover:brightness-105"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Pass stores and update callback to DashboardReturnUser
    if (hasStores) {
        return <DashboardReturnUser stores={stores} onStoreUpdate={handleStoreUpdate} />;
    }

    return <DashboardFirstTime />;
};

export default DashboardPage;