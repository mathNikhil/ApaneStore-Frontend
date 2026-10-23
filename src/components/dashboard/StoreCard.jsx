import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import QRActivationModal from './QRActivationModal';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com';
const STORE_ADMIN_URL = import.meta.env.VITE_STORE_ADMIN_URL || 'http://localhost:3006';

// ─── helpers ────────────────────────────────────────────────
const getStoreConfig = (store) => {
    if (store.config && typeof store.config === 'object') return store.config;
    try { return JSON.parse(store.config || '{}'); } catch { return {}; }
};

const getStoreExpiryInfo = (store) => {
    if (store.status !== 'draft') return null;
    const expiryDate = new Date(store.created_at);
    expiryDate.setDate(expiryDate.getDate() + 120);
    const daysRemaining = Math.ceil((expiryDate - new Date()) / 86400000);
    return { daysRemaining, isExpired: daysRemaining <= 0, isWarning: daysRemaining <= 7 && daysRemaining > 0 };
};

const TEMPLATE_TABS = [
    { key: 'order_confirmed',  label: 'Order Confirmed',   icon: '🎉' },
    { key: 'order_packed',     label: 'Order Packed',      icon: '📦' },
    { key: 'out_for_delivery', label: 'Out for Delivery',  icon: '🚚' },
    { key: 'delivered',        label: 'Delivered',         icon: '✅' },
    { key: 'cancelled',        label: 'Cancelled',         icon: '❌' },
    { key: 'return_requested', label: 'Return Requested',  icon: '↩️' },
];
const DEFAULT_SUBJECTS = {
    order_confirmed:  'Your order has been confirmed! 🎉',
    order_packed:     'Your order is packed and ready 📦',
    out_for_delivery: 'Your order is on its way! 🚚',
    delivered:        'Your order has been delivered ✅',
    cancelled:        'Your order has been cancelled',
    return_requested: 'Return request received ↩️',
};
const DEFAULT_BODIES = {
    order_confirmed:  `Hi {{customer_name}},\n\nThank you for your order! We have received your order #{{order_id}} and it is being processed.\n\nItems: {{item_list}}\nTotal: {{total_amount}}\n\nWe will notify you once your order is packed.\n\nWarm regards,\n{{store_name}}`,
    order_packed:     `Hi {{customer_name}},\n\nGreat news! Your order #{{order_id}} has been packed and is ready for dispatch.\n\nYou will receive another update once it is out for delivery.\n\nWarm regards,\n{{store_name}}`,
    out_for_delivery: `Hi {{customer_name}},\n\nYour order #{{order_id}} is out for delivery! Expect it soon.\n\nTracking: {{tracking_number}}\n\nWarm regards,\n{{store_name}}`,
    delivered:        `Hi {{customer_name}},\n\nYour order #{{order_id}} has been delivered. We hope you love your purchase!\n\nThank you for shopping with {{store_name}}.`,
    cancelled:        `Hi {{customer_name}},\n\nYour order #{{order_id}} has been cancelled as requested.\n\nIf you have any questions, please contact us.\n\nWarm regards,\n{{store_name}}`,
    return_requested: `Hi {{customer_name}},\n\nWe have received your return request for order #{{order_id}}.\n\nOur team will review it and get back to you within 24-48 hours.\n\nWarm regards,\n{{store_name}}`,
};
const TEMPLATE_VARIABLES = ['{{customer_name}}', '{{order_id}}', '{{order_total}}', '{{store_name}}', '{{delivery_date}}'];


// ─── Main Component ──────────────────────────────────────────
const StoreCard = ({ store, subscriptions = {}, onStoreUpdate }) => {
    const navigate = useNavigate();
    const config  = getStoreConfig(store);
    const brand   = config.brand || {};
    const sub     = subscriptions[store.id];
    const expiryInfo = getStoreExpiryInfo(store);
    const isPublished = store.status === 'published' || store.status === 'active';

    // ── local state ──────────────────────────────────────
    const [editDropdown,    setEditDropdown]    = useState(false);
    const [updating,        setUpdating]        = useState(false);
    const [activeTab,       setActiveTab]       = useState('notif');
    const [addonsOpen,      setAddonsOpen]      = useState(false);

    // password
    const [password,        setPassword]        = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    // QR
    const [qrActive,        setQrActive]        = useState(false);
    const [showQRModal,     setShowQRModal]      = useState(false);

    // Gmail / template modal
    const [showNotifModal,  setShowNotifModal]  = useState(false);
    const [showTemplates,   setShowTemplates]   = useState(false);
    const [activeTemplateTab, setActiveTemplateTab] = useState('order_confirmed');
    const [templates,       setTemplates]       = useState({});
    const [templateLoading, setTemplateLoading] = useState(false);
    const [templateSaving,  setTemplateSaving]  = useState(false);

    // Gmail connected state — prefer store.notify_email from API, fall back to localStorage cache
    const gmailConnectedEmail = store.notify_email || (() => {
        try { return localStorage.getItem(`gmail_connected_${store.id}`) || null; } catch { return null; }
    })();

    // delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInput,     setDeleteInput]     = useState('');
    const [deleting,        setDeleting]        = useState(false);

    useEffect(() => {
        if (isPublished) {
            fetch(`${API_URL}/api/qr/status/${store.id}`)
                .then(r => r.json())
                .then(d => setQrActive(d.active === true))
                .catch(() => {});
        }
    }, [store.id]);

    // ── subscription badge ───────────────────────────────
    const getSubBadge = () => {
        if (!sub) return null;
        if (sub.displayStatus === 'grace')
            return { label: `🚨 Grace period: ${sub.graceDaysRemaining} days left to renew`, style: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' } };
        if (sub.displayStatus === 'expiring_soon')
            return { label: `🔴 ${sub.daysRemaining} days remaining — renew now!`, style: { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' } };
        if (sub.displayStatus === 'expiring')
            return { label: `⚠️ ${sub.daysRemaining} days remaining`, style: { background: '#fefce8', color: '#a16207', border: '1px solid #fde047' } };
        return { label: `✅ Active — expires ${sub.validUntilFormatted}`, style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } };
    };
    const subBadge = getSubBadge();
    const isExpiringSoon = subBadge && (subBadge.style.border?.includes('fca5a5') || subBadge.style.border?.includes('fed7aa'));

    // ── trial days for admin panel ───────────────────────
    const daysSinceCreated = Math.floor((Date.now() - new Date(store.created_at)) / 86400000);
    const trialDaysLeft = 7 - daysSinceCreated;

    // ── publish / unpublish ──────────────────────────────
    const handlePublish = () => navigate(`/store-builder/publish/domain?storeId=${store.id}`);

    const handleUnpublish = async () => {
        const warningMsg = sub
            ? `⚠️ Unpublishing takes your store offline immediately.\n\nYou have ${sub.daysRemaining} days remaining (expires ${sub.validUntilFormatted}).\n\nRemaining subscription days are non-refundable.\n\nAre you sure?`
            : 'Unpublish your store? It will go offline immediately.';
        if (!window.confirm(warningMsg)) return;
        setUpdating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/stores/${store.id}/unpublish`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showError('Store unpublished successfully.');
                if (onStoreUpdate) onStoreUpdate(store.id, 'inactive');
            } else {
                alert(data.error || 'Failed to unpublish store');
            }
        } catch { showError('Failed to unpublish. Please try again.'); }
        finally { setUpdating(false); }
    };

    // ── password ─────────────────────────────────────────
    const handleTogglePassword = async () => {
        if (passwordVisible) { setPasswordVisible(false); return; }
        if (password) { setPasswordVisible(true); return; }
        setPasswordLoading(true);
        try {
            const result = await storeAPI.getAdminPassword(store.id);
            if (result.success) { setPassword(result.data.password); setPasswordVisible(true); }
        } catch { console.error('Failed to fetch password'); }
        finally { setPasswordLoading(false); }
    };

    const handleGeneratePassword = async () => {
        if (!window.confirm('Generate a new password? The current one will stop working immediately.')) return;
        setPasswordLoading(true);
        try {
            const result = await storeAPI.generateAdminPassword(store.id);
            if (result.success) { setPassword(result.data.password); setPasswordVisible(true); }
        } catch { showError('Failed to generate password.'); }
        finally { setPasswordLoading(false); }
    };

    // ── templates ────────────────────────────────────────
    const loadTemplates = async () => {
        setTemplateLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/email-templates/${store.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                const map = {};
                data.templates.forEach(t => { map[t.status_key] = t; });
                setTemplates(map);
            }
        } catch { console.error('Failed to load templates'); }
        finally { setTemplateLoading(false); }
    };

    const saveTemplate = async () => {
        setTemplateSaving(true);
        const t = templates[activeTemplateTab] || {};
        try {
            const res = await fetch(`${API_URL}/api/email-templates/${store.id}/${activeTemplateTab}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    subject: t.subject || DEFAULT_SUBJECTS[activeTemplateTab],
                    body: t.body || DEFAULT_BODIES[activeTemplateTab],
                    is_active: t.is_active !== false,
                })
            });
            const data = await res.json();
            if (data.success) showSuccess('Template saved!');
            else showError('Save failed');
        } catch { showError('Save failed'); }
        finally { setTemplateSaving(false); }
    };

    const getCurrentTemplate = (key) => templates[key] || { subject: DEFAULT_SUBJECTS[key] || '', body: DEFAULT_BODIES[key] || '', is_active: true };
    const updateTemplateField = (key, field, value) => setTemplates(prev => ({ ...prev, [key]: { ...(prev[key] || {}), [field]: value } }));
    const insertVariable = (v) => {
        const current = (templates[activeTemplateTab] || {}).body || DEFAULT_BODIES[activeTemplateTab] || '';
        updateTemplateField(activeTemplateTab, 'body', current + v);
    };

    const openTemplates = () => { setShowTemplates(true); setActiveTemplateTab('order_confirmed'); loadTemplates(); };

    // ── delete ───────────────────────────────────────────
    const handleDelete = async () => {
        if (deleteInput !== 'DELETE') return;
        setDeleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/stores/${store.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success || res.ok) {
                setShowDeleteModal(false);
                if (onStoreUpdate) onStoreUpdate(store.id, null);
            } else {
                alert(data.error || 'Failed to delete store.');
            }
        } catch { alert('Something went wrong.'); }
        finally { setDeleting(false); }
    };

    // ── render ───────────────────────────────────────────
    return (
        <>
        <div style={{ ...s.card, borderColor: isExpiringSoon ? '#fb923c' : '#e4e7ec' }}>

            {/* ── Header ── */}
            <div style={s.header}>
                <div style={s.headerLeft}>
                    {brand.logoUrl ? (
                        <img src={brand.logoUrl} alt={store.store_name} style={s.logo} />
                    ) : (
                        <div style={s.logoPlaceholder}>🏪</div>
                    )}
                    <div style={{ minWidth: 0 }}>
                        <h3 style={s.storeName}>{store.store_name}</h3>
                        <p style={s.storeUrl}>{store.subdomain ? `${store.subdomain}.aapnaestore.com` : 'No domain set'}</p>
                        {subBadge && (
                            <div style={{ ...s.subBadge, ...subBadge.style }}>{subBadge.label}</div>
                        )}
                    </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Store type badge */}
                        {store.store_type === 'service' ? (
                            <span style={{ ...s.statusBadge, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>handyman</span>
                                Service
                            </span>
                        ) : (
                            <span style={{ ...s.statusBadge, background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>inventory_2</span>
                                Product
                            </span>
                        )}
                        {/* Publish status badge */}
                        <span style={{
                            ...s.statusBadge,
                            background: isPublished ? '#f0fdf4' : store.status === 'inactive' ? '#f9fafb' : '#fefce8',
                            color: isPublished ? '#16a34a' : store.status === 'inactive' ? '#6b7280' : '#a16207',
                            border: `1px solid ${isPublished ? '#bbf7d0' : store.status === 'inactive' ? '#e4e7ec' : '#fde68a'}`,
                        }}>
                            <span style={s.statusDot} />
                            {isPublished ? 'Published' : store.status === 'inactive' ? 'Unpublished' : 'Draft'}
                        </span>
                    </div>
                    <p style={s.createdAt}>{store.created_at && new Date(store.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            {/* brand tagline */}
            {brand.tagline && <p style={s.tagline}>{brand.tagline}</p>}

            {/* draft expiry warning */}
            {store.status === 'draft' && expiryInfo && !expiryInfo.isExpired && (
                <div style={{ ...s.warningBanner, ...(expiryInfo.isWarning ? s.warningBannerRed : s.warningBannerYellow) }}>
                    {expiryInfo.isWarning ? '⚠️' : '⏳'} Auto-delete in <strong>{expiryInfo.daysRemaining}</strong> days
                </div>
            )}

            {/* ── Action row ── */}
            <div style={s.actionRow}>
                {/* Edit dropdown */}
                <div style={{ position: 'relative' }}>
                    <button style={s.btnGhost} onClick={() => setEditDropdown(v => !v)}>
                        ✏️ Edit Store ▾
                    </button>
                    {editDropdown && (
                        <>
                            <div style={s.dropOverlay} onClick={() => setEditDropdown(false)} />
                            <div style={s.editDropdown}>
                                <div style={s.editDropdownTitle}>Select step to edit</div>
                                <div style={s.editGrid}>
                                    {[
                                        { step: 1, label: 'Brand',    icon: '🎨' },
                                        { step: 2, label: 'Products', icon: '📦' },
                                        { step: 3, label: 'Cart',     icon: '🛒' },
                                        { step: 4, label: 'Payment',  icon: '💳' },
                                        { step: 5, label: 'Delivery', icon: '🚚' },
                                        { step: 6, label: 'Orders',   icon: '🧾' },
                                        { step: 7, label: 'Profile',  icon: '🏪' },
                                        { step: 8, label: 'Returns',  icon: '↩️' },
                                    ].map(({ step, label, icon }) => (
                                        <button key={step} style={s.editStepBtn}
                                            onClick={() => { setEditDropdown(false); navigate(`/store-builder/step/${step}?storeId=${store.id}`); }}>
                                            <div style={s.editStepIcon}>{icon}</div>
                                            <span style={s.editStepLabel}>{label}</span>
                                            <span style={s.editStepNum}>{step}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Preview */}
                <button style={s.btnGhost}
                    onClick={() => isPublished
                        ? window.open(`https://${store.subdomain}.aapnaestore.com`, '_blank')
                        : navigate(`/store-builder/preview?storeId=${store.id}`)}>
                    👁 Preview
                </button>

                {/* Publish / Unpublish */}
                {!isPublished && (
                    <button style={s.btnPublish} onClick={handlePublish} disabled={updating}>Publish</button>
                )}
                {isPublished && (
                    <button style={s.btnUnpublish} onClick={handleUnpublish} disabled={updating}>
                        {updating ? '…' : 'Unpublish'}
                    </button>
                )}
            </div>

            {/* ── Store Admin Panel full-width ── */}
            <div style={{ padding: '0 16px 10px' }}>
                {!isPublished && trialDaysLeft > 0 && (
                    <div style={s.trialWarning}>
                        ⚠️ Store Admin trial expires in <strong>{trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}</strong> — publish your store to keep access
                    </div>
                )}
                {!isPublished && trialDaysLeft <= 0 && (
                    <div style={s.trialExpired}>
                        🔒 Store Admin trial expired — publish your store to restore access
                    </div>
                )}
                <button style={{ ...s.btnAdmin, width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                        if (!store.subdomain) { showError('This store needs a subdomain first.'); return; }
                        window.open(`${STORE_ADMIN_URL}/login?store=${store.subdomain}`, '_blank');
                    }}>
                    ⊞ Store Admin Panel
                </button>
            </div>

            {/* ── Store Admin Access (password) ── */}
            <div style={s.adminAccess}>
                <div style={s.adminAccessLabel}>🔒 Store Admin Access</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {passwordVisible && password ? (
                        <>
                            <code style={s.passwordCode}>{password}</code>
                            <button style={s.btnSm} onClick={() => { navigator.clipboard.writeText(password); showSuccess('Copied!'); }}>Copy</button>
                            <button style={s.btnSm} onClick={() => setPasswordVisible(false)}>Hide</button>
                        </>
                    ) : (
                        <button style={s.btnSm} onClick={handleTogglePassword} disabled={passwordLoading}>
                            {passwordLoading ? 'Loading…' : '👁 Show Password'}
                        </button>
                    )}
                    <button style={s.btnSm} onClick={handleGeneratePassword} disabled={passwordLoading}>
                        ↻ Generate New
                    </button>
                </div>
                <p style={s.adminHint}>Share with staff to manage orders and customers. One login at a time.</p>
            </div>

            {/* ── Add-ons accordion ── */}
            <div style={s.addonsSection}>
                {/* Always-visible header row: label + tab pills + chevron */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: '8px' }}>
                    <span style={s.accordionLabelBtn}>ADD-ONS</span>
                    {/* Tab pills always visible so tenant can see what's inside */}
                    <button
                        style={{ ...s.addonPill, ...(activeTab === 'notif' ? s.addonPillActive : {}) }}
                        onClick={() => { setActiveTab('notif'); setAddonsOpen(true); }}
                    >
                        🔔 Notifications
                    </button>
                    <button
                        style={{ ...s.addonPill, ...(activeTab === 'qr' ? s.addonPillActive : {}) }}
                        onClick={() => { setActiveTab('qr'); setAddonsOpen(true); }}
                    >
                        📱 QR Scanner
                    </button>
                    <button style={s.accordionChevronBtn} onClick={() => setAddonsOpen(o => !o)}>
                        <span style={{ ...s.accordionChevron, transform: addonsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                    </button>
                </div>

                {addonsOpen && (
                <div>
                {/* Order Notifications panel */}
                {activeTab === 'notif' && (
                    <div style={s.tabPanel}>
                        <div style={s.addonWhat}>
                            <div style={{ ...s.addonIconBox, background: '#eff6ff' }}>📧</div>
                            <div>
                                <p style={s.addonTitle}>Get notified for every new order</p>
                                <p style={s.addonDesc}>Receive an email the moment a customer places an order — with full order details, customer info, and items.</p>
                            </div>
                        </div>
                        <div style={s.howtoLabel}>HOW IT WORKS</div>
                        <div style={s.steps}>
                            {[
                                'Connect your Gmail account — we\'ll send order notifications to it.',
                                'Set up your email template — choose what info appears in each alert.',
                                'Every new order triggers an instant email to your inbox.'
                            ].map((text, i) => (
                                <div key={i} style={s.step}>
                                    <div style={s.stepNum}>{i + 1}</div>
                                    <div style={s.stepText}>{text}</div>
                                </div>
                            ))}
                        </div>
                        {sub && sub.payment_status === 'paid' && sub.is_trial === false ? (
                            <div style={s.ctaRow}>
                                <button style={s.btnCtaBlue} onClick={() => setShowNotifModal(true)}>✉️ Connect Gmail</button>
                                <button style={s.btnCtaGhost} onClick={() => { setShowNotifModal(true); setTimeout(openTemplates, 50); }}>📄 Email Template</button>
                            </div>
                        ) : (
                            <div style={s.lockedNote}>🔒 Available for paid subscriptions only</div>
                        )}
                    </div>
                )}

                {/* QR Scanner panel */}
                {activeTab === 'qr' && (
                    <div style={s.tabPanel}>
                        <div style={s.addonWhat}>
                            <div style={{ ...s.addonIconBox, background: '#f5f3ff' }}>📱</div>
                            <div>
                                <p style={s.addonTitle}>In-store QR ordering for walk-in customers</p>
                                <p style={s.addonDesc}>Staff scan a product's QR code to instantly add it to a customer's cart — no searching, no typing.</p>
                            </div>
                        </div>
                        <div style={s.howtoLabel}>HOW TO USE IT</div>
                        <div style={s.steps}>
                            {[
                                <span>Go to <strong>Store Admin Panel</strong> → open <strong>Inventory</strong>.</span>,
                                <span>Each product has a <strong>QR Code</strong> button. Print or display it at your counter.</span>,
                                <span>Staff tap <strong>Start QR Session</strong>, enter customer details, scan QR codes to build their cart.</span>,
                                <span>Confirm the order — it appears instantly in your order list.</span>,
                            ].map((text, i) => (
                                <div key={i} style={s.step}>
                                    <div style={s.stepNum}>{i + 1}</div>
                                    <div style={s.stepText}>{text}</div>
                                </div>
                            ))}
                        </div>
                        {isPublished ? (
                            qrActive ? (
                                <div style={s.qrActivePill}>✅ QR Scanner Active</div>
                            ) : (
                                <button style={s.btnQrPay} onClick={() => setShowQRModal(true)}>
                                    📱 Activate QR Scanner
                                </button>
                            )
                        ) : (
                            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Publish your store to activate QR Scanner.</p>
                        )}
                    </div>
                )}
                </div>
                )}
            </div>

            {/* ── Delete Store ── */}
            <div style={{ borderTop: '1px solid #f0f2f5', padding: '10px 16px' }}>
                <button style={s.btnDelete} onClick={() => { setDeleteInput(''); setShowDeleteModal(true); }}>
                    🗑 Delete Store
                </button>
            </div>

        </div>

        {/* ── QR Activation Modal ── */}
        {showQRModal && (
            <QRActivationModal
                storeId={store.id}
                onClose={() => setShowQRModal(false)}
                onActivated={() => { setQrActive(true); setShowQRModal(false); }}
            />
        )}

        {/* ── Gmail / Notifications Modal ── */}
        {showNotifModal && (
            <div style={s.overlay} onClick={e => e.target === e.currentTarget && (setShowNotifModal(false), setShowTemplates(false))}>
                <div style={s.modal}>
                    <div style={s.modalHead}>
                        {showTemplates ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button style={s.backBtn} onClick={() => setShowTemplates(false)}>←</button>
                                <h2 style={s.modalTitle}>Email Templates</h2>
                            </div>
                        ) : (
                            <h2 style={s.modalTitle}>Order Notifications</h2>
                        )}
                        <button style={s.modalClose} onClick={() => { setShowNotifModal(false); setShowTemplates(false); }}>×</button>
                    </div>

                    {!showTemplates ? (
                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.6 }}>
                                Connect your Gmail to send order confirmations and status updates from your own email address.
                            </p>
                            <div style={s.gmailConnectRow}>
                                <div style={s.gmailIcon}>📧</div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#111827', margin: 0 }}>Gmail</p>
                                    {gmailConnectedEmail ? (
                                        <p style={{ fontSize: '12px', color: '#006d2f', margin: '2px 0 0', fontWeight: 600 }}>✓ {gmailConnectedEmail}</p>
                                    ) : (
                                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' }}>Not connected</p>
                                    )}
                                </div>
                                {gmailConnectedEmail ? (
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <div style={s.btnConnected}>✓ Connected</div>
                                        <button style={s.btnDisconnect}
                                            onClick={async () => {
                                                if (!window.confirm('Disconnect Gmail? Order notification emails will stop being sent.')) return;
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    await fetch(`${API_URL}/api/auth/gmail-notify/disconnect?storeId=${store.id}`, {
                                                        method: 'POST',
                                                        headers: { Authorization: `Bearer ${token}` },
                                                    });
                                                } catch {}
                                                try { localStorage.removeItem(`gmail_connected_${store.id}`); } catch {}
                                                if (onStoreUpdate) onStoreUpdate();
                                                // Force re-render by navigating same page
                                                window.location.reload();
                                            }}>
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <button style={{ ...s.btnConnect, background: brand.brandColors?.primary || '#4f46e5' }}
                                        onClick={() => {
                                            const token = localStorage.getItem('token');
                                            window.location.href = `${API_URL}/api/auth/gmail-notify/connect?storeId=${store.id}&token=${token}`;
                                        }}>
                                        Connect
                                    </button>
                                )}
                            </div>
                            <button style={{ ...s.templateRowBtn, background: `${brand.brandColors?.primary || '#4f46e5'}12`, color: brand.brandColors?.primary || '#4f46e5', border: `1px solid ${brand.brandColors?.primary || '#4f46e5'}30` }} onClick={openTemplates}>
                                <span>📄 Email Templates</span>
                                <span>›</span>
                            </button>
                        </div>
                    ) : (
                        <div>
                            {/* Template tabs */}
                            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                                {TEMPLATE_TABS.map(tab => (
                                    <button key={tab.key} onClick={() => setActiveTemplateTab(tab.key)}
                                        style={{
                                            ...s.templateTabBtn,
                                            ...(activeTemplateTab === tab.key ? { background: brand.brandColors?.primary || '#4f46e5', color: '#fff' } : {})
                                        }}>
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>

                            {templateLoading ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>Loading templates…</div>
                            ) : (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>Enable this template</span>
                                        <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                                            <input type="checkbox"
                                                checked={getCurrentTemplate(activeTemplateTab).is_active !== false}
                                                onChange={e => updateTemplateField(activeTemplateTab, 'is_active', e.target.checked)}
                                                style={{ opacity: 0, width: 0, height: 0 }} />
                                            <div style={{
                                                width: '40px', height: '24px', borderRadius: '12px',
                                                background: getCurrentTemplate(activeTemplateTab).is_active !== false ? (brand.brandColors?.primary || '#4f46e5') : '#d1d5db',
                                                position: 'relative', transition: 'background .2s'
                                            }}>
                                                <div style={{
                                                    position: 'absolute', top: '2px',
                                                    left: getCurrentTemplate(activeTemplateTab).is_active !== false ? '18px' : '2px',
                                                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                                                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)'
                                                }} />
                                            </div>
                                        </label>
                                    </div>
                                    <label style={s.fieldLabel}>Subject</label>
                                    <input style={s.textInput} value={getCurrentTemplate(activeTemplateTab).subject}
                                        onChange={e => updateTemplateField(activeTemplateTab, 'subject', e.target.value)}
                                        placeholder="Email subject…" />
                                    <label style={s.fieldLabel}>Body</label>
                                    <textarea rows={6} style={{ ...s.textInput, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
                                        value={getCurrentTemplate(activeTemplateTab).body}
                                        onChange={e => updateTemplateField(activeTemplateTab, 'body', e.target.value)}
                                        placeholder="Email body…" />
                                    <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0 0 8px' }}>Click to insert variable:</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                        {TEMPLATE_VARIABLES.map(v => (
                                            <button key={v} onClick={() => insertVariable(v)}
                                                style={{ padding: '3px 10px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer' }}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                    <button style={{ ...s.btnPrimary, width: '100%', background: brand.brandColors?.primary || '#4f46e5' }} onClick={saveTemplate} disabled={templateSaving}>
                                        {templateSaving ? 'Saving…' : '💾 Save Template'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {showDeleteModal && (
            <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowDeleteModal(false)}>
                <div style={{ ...s.modal, maxWidth: '400px' }}>
                    <div style={s.modalHead}>
                        <h2 style={{ ...s.modalTitle, color: '#c0392b' }}>🗑 Delete Store</h2>
                        <button style={s.modalClose} onClick={() => setShowDeleteModal(false)}>×</button>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>
                        This will permanently delete <strong style={{ color: '#111827' }}>{store.store_name}</strong> and all its products, orders, and customer data. This cannot be undone.
                    </p>
                    <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#c0392b' }}>
                        ⚠️ Type <strong>DELETE</strong> to confirm
                    </div>
                    <input placeholder="Type DELETE" value={deleteInput}
                        onChange={e => setDeleteInput(e.target.value)}
                        style={{ ...s.textInput, marginBottom: '14px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={s.btnCancel} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                        <button
                            style={{ ...s.btnDeleteConfirm, opacity: deleteInput === 'DELETE' && !deleting ? 1 : 0.45, cursor: deleteInput === 'DELETE' && !deleting ? 'pointer' : 'not-allowed' }}
                            onClick={handleDelete}
                            disabled={deleteInput !== 'DELETE' || deleting}>
                            {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

// ─── styles ──────────────────────────────────────────────────
const s = {
    card: {
        background: '#fff', border: '1px solid #e4e7ec', borderRadius: '18px',
        boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 4px 16px rgba(0,0,0,.05)',
        overflow: 'hidden', marginBottom: '16px',
    },
    header: { padding: '14px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' },
    headerLeft: { display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1, minWidth: 0 },
    logo: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #25D366', flexShrink: 0 },
    logoPlaceholder: { width: '44px', height: '44px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
    storeName: { fontSize: '16px', fontWeight: 700, color: '#111827', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    storeUrl: { fontSize: '12px', color: '#9ca3af', margin: '0 0 4px' },
    subBadge: { display: 'inline-block', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, marginTop: '4px' },
    statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' },
    statusDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' },
    createdAt: { fontSize: '11px', color: '#9ca3af', margin: '4px 0 0', textAlign: 'right' },
    tagline: { fontSize: '13px', color: '#374151', padding: '0 16px 6px', margin: 0 },

    warningBanner: { margin: '0 16px 8px', padding: '7px 10px', borderRadius: '8px', fontSize: '12px' },
    warningBannerYellow: { background: '#fefce8', color: '#a16207', border: '1px solid #fde047' },
    warningBannerRed: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' },

    actionRow: { display: 'flex', gap: '8px', padding: '0 16px 10px', flexWrap: 'wrap' },
    btnGhost: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f3f4f6', color: '#374151', border: '1px solid #e4e7ec', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    btnPublish: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    btnUnpublish: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },

    dropOverlay: { position: 'fixed', inset: 0, zIndex: 998 },
    editDropdown: { position: 'absolute', left: 0, top: 'calc(100% + 4px)', background: '#fff', border: '1px solid #e4e7ec', borderRadius: '14px', boxShadow: '0 8px 32px rgba(0,0,0,.12)', zIndex: 999, width: '280px', overflow: 'hidden' },
    editDropdownTitle: { padding: '10px 14px 8px', fontSize: '11px', color: '#9ca3af', fontWeight: 600, borderBottom: '1px solid #f0f2f5' },
    editGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', padding: '8px' },
    editStepBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '8px 4px', borderRadius: '10px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit' },
    editStepIcon: { width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
    editStepLabel: { fontSize: '9px', fontWeight: 600, color: '#111827', textAlign: 'center', lineHeight: 1.2 },
    editStepNum: { fontSize: '8px', color: '#9ca3af' },

    trialWarning: { padding: '7px 10px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '12px', color: '#92400e', marginBottom: '8px' },
    trialExpired: { padding: '7px 10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', fontSize: '12px', color: '#b91c1c', marginBottom: '8px' },
    btnAdmin: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 14px', background: '#15803d', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },

    adminAccess: { margin: '0 16px 10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e4e7ec' },
    adminAccessLabel: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '8px' },
    passwordCode: { padding: '5px 10px', background: '#f3f4f6', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace', color: '#111827', border: '1px solid #e4e7ec' },
    btnSm: { padding: '5px 10px', fontSize: '12px', borderRadius: '7px', fontWeight: 600, border: '1px solid #e4e7ec', background: '#fff', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' },
    adminHint: { fontSize: '12px', color: '#9ca3af', margin: '8px 0 0', lineHeight: 1.5 },

    addonsSection: { borderTop: '1px solid #f0f2f5' },
    accordionLabelBtn: { fontSize: '12px', fontWeight: 700, color: '#9ca3af', letterSpacing: '.4px', textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '0', background: 'none', border: 'none', fontFamily: 'inherit' },
    addonPill: { fontSize: '11px', fontWeight: 600, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e4e7ec', borderRadius: '20px', padding: '3px 10px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
    addonPillActive: { color: '#006d2f', background: '#e6f4ec', borderColor: '#bbdfc8' },
    accordionChevronBtn: { marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
    accordionChevron: { fontSize: '14px', color: '#9ca3af', transition: 'transform .2s', display: 'inline-block' },
    tabBar: { padding: '0 16px', display: 'flex', alignItems: 'center', gap: '2px', borderTop: '1px solid #f0f2f5' },
    tabBtn: { display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', fontSize: '13px', fontWeight: 600, color: '#9ca3af', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
    tabBtnActive: { color: '#111827', borderBottomColor: '#111827' },
    tabDivider: { width: '1px', background: '#e4e7ec', margin: '8px 4px', alignSelf: 'stretch' },

    tabPanel: { padding: '12px 16px 16px' },
    addonWhat: { display: 'flex', gap: '10px', marginBottom: '10px' },
    addonIconBox: { width: '34px', height: '34px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    addonTitle: { fontSize: '14px', fontWeight: 700, color: '#111827', margin: '0 0 4px' },
    addonDesc: { fontSize: '12px', color: '#6b7280', margin: 0, lineHeight: 1.5 },

    howtoLabel: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '.6px', marginBottom: '10px' },
    steps: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' },
    step: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
    stepNum: { width: '22px', height: '22px', borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e4e7ec', fontSize: '11px', fontWeight: 700, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' },
    stepText: { fontSize: '13px', color: '#6b7280', lineHeight: 1.5 },

    ctaRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    btnCtaBlue: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#eff6ff', color: '#1a56db', border: '1px solid #bfdbfe', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    btnCtaGhost: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#f3f4f6', color: '#6b7280', border: '1px solid #e4e7ec', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    lockedNote: { fontSize: '12px', color: '#9ca3af', padding: '8px 12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e4e7ec' },

    btnQrPay: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 18px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%' },
    qrActivePill: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 16px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '9px', fontSize: '13px', fontWeight: 600 },

    btnDelete: { width: '100%', padding: '9px', background: 'none', border: '1px solid #fecaca', borderRadius: '9px', color: '#c0392b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },

    // modals
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' },
    modal: { background: '#fff', borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.22)' },
    modalHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
    modalTitle: { fontSize: '17px', fontWeight: 700, color: '#111827', margin: 0 },
    modalClose: { width: '32px', height: '32px', borderRadius: '8px', background: '#f3f4f6', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit' },
    backBtn: { padding: '4px 8px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontFamily: 'inherit', color: '#374151' },

    gmailConnectRow: { display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e4e7ec', borderRadius: '14px', padding: '14px', marginBottom: '12px' },
    gmailIcon: { width: '40px', height: '40px', borderRadius: '12px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
    btnConnect: { padding: '8px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    btnConnected: { padding: '8px 16px', background: '#e6f4ec', color: '#006d2f', border: '1px solid #bbdfc8', borderRadius: '10px', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' },
    btnDisconnect: { padding: '8px 12px', background: '#fff', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    templateRowBtn: { width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f5f3ff', color: '#4f46e5', border: '1px solid #e0e7ff', borderRadius: '14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
    templateTabBtn: { flexShrink: 0, padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: 'none', background: '#f3f4f6', color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' },
    templateTabBtnActive: { background: '#4f46e5', color: '#fff' },

    fieldLabel: { display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '.6px', textTransform: 'uppercase', marginBottom: '6px' },
    textInput: { width: '100%', padding: '9px 12px', border: '1px solid #e4e7ec', borderRadius: '8px', fontSize: '13px', background: '#f9fafb', color: '#111827', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '12px', display: 'block' },
    btnPrimary: { padding: '11px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },

    btnCancel: { flex: 1, padding: '10px', background: '#f3f4f6', border: '1px solid #e4e7ec', borderRadius: '9px', fontSize: '14px', fontWeight: 600, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' },
    btnDeleteConfirm: { flex: 1, padding: '10px', background: '#c0392b', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'inherit' },
};

export default StoreCard;
