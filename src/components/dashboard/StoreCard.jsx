import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';

const StoreCard = ({ store, onNavigate }) => {
    const navigate = useNavigate();
    const [panels, setPanels] = useState({
        admin: true,
        production: false,
        delivery: false
    });

    useEffect(() => {
        // Fetch panel settings for this store
        fetchStorePanels();
    }, [store.id]);

    const fetchStorePanels = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/stores/${store.id}/panels`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.success) {
                const panelMap = {};
                result.data.forEach(p => {
                    panelMap[p.panel_type] = p.is_enabled;
                });
                setPanels({
                    admin: true, // Admin is always enabled
                    production: panelMap.production || false,
                    delivery: panelMap.delivery || false
                });
            }
        } catch (error) {
            // Note: this endpoint is super-admin-gated, so it will 403 for a
            // tenant's own token — harmless for now since Production/Delivery
            // panels aren't built yet (Phase 3), but worth fixing when they are.
            console.error('Error fetching panels:', error);
        }
    };

    const openPreview = () => {
        navigate(`/store-builder/preview?storeId=${store.id}`);
    };

    const openEdit = () => {
        navigate(`/store-builder/step/1?storeId=${store.id}`);
    };

    const openAdminPanel = () => {
        // Store Admin has its own separate login — it doesn't yet accept a
        // storeId, so this just opens it fresh; whoever manages that store
        // logs in there directly.
        window.open(`http://localhost:3006`, '_blank');
    };

    const openProductionPanel = () => {
        window.open(`http://localhost:3007`, '_blank');
    };

    const openDeliveryPanel = () => {
        window.open(`http://localhost:3008`, '_blank');
    };

    return (
        <div style={styles.storeCard}>
            <div style={styles.storeHeader}>
                <div>
                    <h3 style={styles.storeName}>🏪 {store.store_name}</h3>
                    <p style={styles.storeUrl}>🔗 {store.subdomain}.aapnaestore.com</p>
                </div>
                <span style={{
                    ...styles.statusBadge,
                    background: store.status === 'published' ? 'rgba(46,213,115,0.15)' : 'rgba(255,165,0,0.15)',
                    color: store.status === 'published' ? '#2ecc71' : '#f39c12'
                }}>
                    {store.status === 'published' ? '✅ Published' : '📝 Draft'}
                </span>
            </div>

            <div style={styles.storeStats}>
                <div style={styles.statItem}>
                    <span style={styles.statValue}>0</span>
                    <span style={styles.statLabel}>Orders</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statValue}>0</span>
                    <span style={styles.statLabel}>Products</span>
                </div>
                <div style={styles.statItem}>
                    <span style={styles.statValue}>0</span>
                    <span style={styles.statLabel}>Customers</span>
                </div>
            </div>

            <div style={styles.panelButtons}>
                <button style={styles.previewBtn} onClick={openPreview}>
                    👁️ Preview
                </button>
                <button style={styles.editBtn} onClick={openEdit}>
                    ✏️ Edit
                </button>

                {/* Admin Panel - Always Available */}
                <button 
                    style={styles.adminBtn}
                    onClick={openAdminPanel}
                >
                    📊 Store Admin
                </button>
                
                {/* Production Panel - Only if enabled, else Phase 3 placeholder */}
                {panels.production ? (
                    <button 
                        style={styles.productionBtn}
                        onClick={openProductionPanel}
                    >
                        🏭 Production
                    </button>
                ) : (
                    <button style={styles.disabledBtn} disabled title="Coming in Phase 3">
                        🏭 Production (Phase 3)
                    </button>
                )}
                
                {/* Delivery Panel - Only if enabled, else Phase 3 placeholder */}
                {panels.delivery ? (
                    <button 
                        style={styles.deliveryBtn}
                        onClick={openDeliveryPanel}
                    >
                        🚚 Delivery
                    </button>
                ) : (
                    <button style={styles.disabledBtn} disabled title="Coming in Phase 3">
                        🚚 Delivery (Phase 3)
                    </button>
                )}
            </div>
        </div>
    );
};

const styles = {
    storeCard: {
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #bbcbb9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s',
        marginBottom: '16px',
    },
    storeHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    storeName: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: '4px',
    },
    storeUrl: {
        fontSize: '13px',
        color: '#8e9eab',
    },
    statusBadge: {
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block',
    },
    storeStats: {
        display: 'flex',
        gap: '24px',
        padding: '12px 0',
        borderTop: '1px solid #f0f2f5',
        borderBottom: '1px solid #f0f2f5',
        marginBottom: '12px',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    statValue: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a1a2e',
    },
    statLabel: {
        fontSize: '11px',
        color: '#8e9eab',
        fontWeight: '500',
    },
    panelButtons: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    previewBtn: {
        padding: '8px 16px',
        background: '#eceef1',
        color: '#006d2f',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    editBtn: {
        padding: '8px 16px',
        background: '#25D366',
        color: '#005523',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    disabledBtn: {
        padding: '8px 16px',
        background: '#f2f4f7',
        color: '#9aa5a1',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'not-allowed',
    },
    adminBtn: {
        padding: '8px 16px',
        background: '#667eea',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    productionBtn: {
        padding: '8px 16px',
        background: '#f39c12',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
    deliveryBtn: {
        padding: '8px 16px',
        background: '#2ecc71',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.3s',
    },
};

export default StoreCard;
