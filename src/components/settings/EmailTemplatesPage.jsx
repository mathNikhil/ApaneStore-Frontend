import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_LABELS = {
    order_confirmed:   { label: 'Order Confirmed',      emoji: '🎉', color: null }, // uses brand color
    order_packed:      { label: 'Order Packed',          emoji: '📦', color: '#0891b2' },
    out_for_delivery:  { label: 'Out for Delivery',      emoji: '🚚', color: '#d97706' },
    delivered:         { label: 'Delivered',             emoji: '✅', color: '#16a34a' },
    cancelled:         { label: 'Cancelled',             emoji: '❌', color: '#dc2626' },
    return_requested:  { label: 'Return Requested',      emoji: '↩️', color: '#7c3aed' },
};

const VARIABLES = [
    { token: '{{customer_name}}', desc: "Customer's name" },
    { token: '{{order_id}}',      desc: 'Order ID' },
    { token: '{{item_list}}',     desc: 'List of items' },
    { token: '{{total_amount}}',  desc: 'Order total (₹)' },
    { token: '{{store_name}}',    desc: 'Your store name' },
    { token: '{{tracking_number}}', desc: 'Tracking number' },
];

export default function EmailTemplatesPage() {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.aapnaestore.com/api';
    // token read per-request

    const [templates, setTemplates] = useState({});
    const [defaults, setDefaults] = useState({});
    const [activeKey, setActiveKey] = useState('order_confirmed');
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [preview, setPreview] = useState(false);
    const [brandColor, setBrandColor] = useState('#4f46e5');

    useEffect(() => {
        fetchTemplates();
        fetchBrandColor();
    }, [storeId]);

    const fetchBrandColor = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/stores/${storeId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const primary = data?.config?.brand?.brandColors?.primary || data?.brandColors?.primary;
            if (primary) setBrandColor(primary);
        } catch (e) {
            // keep default color on error
        }
    };

    useEffect(() => {
        if (templates[activeKey]) {
            setEditSubject(templates[activeKey].subject);
            setEditBody(templates[activeKey].body);
            setIsActive(templates[activeKey].is_active !== false);
            setSaved(false);
        }
    }, [activeKey, templates]);

    const fetchTemplates = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/email-templates/${storeId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setTemplates(data.templates);
            setDefaults(data.defaults);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.put(`${API_URL}/email-templates/${storeId}/${activeKey}`,
                { subject: editSubject, body: editBody, is_active: isActive },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setTemplates(prev => ({
                ...prev,
                [activeKey]: { subject: editSubject, body: editBody, is_active: isActive, is_custom: true }
            }));
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            alert('Save failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Reset to default template?')) return;
        try {
            await axios.delete(`${API_URL}/email-templates/${storeId}/${activeKey}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const def = defaults[activeKey];
            setTemplates(prev => ({
                ...prev,
                [activeKey]: { ...def, is_active: true, is_custom: false }
            }));
        } catch (e) {
            alert('Reset failed.');
        }
    };

    const insertVar = (token_str) => {
        const ta = document.getElementById('email-body-ta');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = editBody.substring(0, start) + token_str + editBody.substring(end);
        setEditBody(newVal);
        setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = start + token_str.length; }, 0);
    };

    const renderPreview = (text) => text
        .replace(/{{customer_name}}/g, 'Rahul Sharma')
        .replace(/{{order_id}}/g, 'ORD-2024-001')
        .replace(/{{item_list}}/g, 'Momos (2), Chilli Sauce (1)')
        .replace(/{{total_amount}}/g, '249')
        .replace(/{{store_name}}/g, 'MomoHouse')
        .replace(/{{tracking_number}}/g, 'TRK123456')
        .replace(/{{#if tracking_number}}([\s\S]*?){{\/if}}/g, '$1');

    if (loading) return (
        <div className="min-h-screen bg-[#f5f7f5] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-t-transparent rounded-full" style={{ borderColor: `${brandColor} transparent transparent transparent` }} />
        </div>
    );

    const current = STATUS_LABELS[activeKey];
    const currentColor = current.color || brandColor;

    return (
        <div className="min-h-screen bg-[#f5f7f5]">
            {/* Header */}
            <div className="bg-white border-b border-[#e0e3e6] px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f5f7f5]">
                    <span className="material-symbols-outlined text-[#3c4a3d]">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-base font-bold text-[#191c1e]">Email Templates</h1>
                    <p className="text-xs text-[#6c7b6b]">Customize messages sent to your customers</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Status Tabs */}
                <div className="bg-white rounded-2xl p-4 border border-[#e0e3e6]">
                    <p className="text-xs font-semibold text-[#6c7b6b] uppercase tracking-wide mb-3">Order Status</p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {Object.entries(STATUS_LABELS).map(([key, info]) => {
                            const tpl = templates[key];
                            const isOn = tpl?.is_active !== false;
                            const isActive = activeKey === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveKey(key)}
                                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all"
                                    style={isActive ? {
                                        borderColor: brandColor,
                                        background: `${brandColor}12`,
                                    } : {
                                        borderColor: '#e0e3e6',
                                        background: 'white',
                                    }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = `${brandColor}60`; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = '#e0e3e6'; }}
                                >
                                    <span className="text-base">{info.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold truncate" style={{ color: isActive ? brandColor : '#191c1e' }}>{info.label}</p>
                                        <p className={`text-[10px] ${isOn ? 'text-[#16a34a]' : 'text-[#9ca3af]'}`}>{isOn ? 'Active' : 'Off'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Editor */}
                <div className="bg-white rounded-2xl border border-[#e0e3e6] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e3e6]" style={{ background: `${currentColor}10` }}>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{current.emoji}</span>
                            <span className="text-sm font-bold text-[#191c1e]">{current.label}</span>
                            {templates[activeKey]?.is_custom && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-semibold" style={{ background: brandColor }}>Custom</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPreview(!preview)}
                                className="text-xs px-3 py-1 rounded-lg border border-[#e0e3e6] text-[#6c7b6b] hover:bg-[#f5f7f5]"
                            >
                                {preview ? 'Edit' : 'Preview'}
                            </button>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                                <span className="text-xs text-[#6c7b6b]">Active</span>
                                <div
                                    onClick={() => setIsActive(!isActive)}
                                    className="w-9 h-5 rounded-full transition-colors relative cursor-pointer"
                                    style={{ background: isActive ? brandColor : '#e0e3e6' }}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {preview ? (
                        <div className="p-4 space-y-3">
                            <div className="bg-[#f5f7f5] rounded-xl p-3">
                                <p className="text-[10px] text-[#6c7b6b] font-semibold uppercase mb-1">Subject</p>
                                <p className="text-sm font-semibold text-[#191c1e]">{renderPreview(editSubject)}</p>
                            </div>
                            <div className="bg-[#f5f7f5] rounded-xl p-3">
                                <p className="text-[10px] text-[#6c7b6b] font-semibold uppercase mb-1">Body</p>
                                <pre className="text-sm text-[#3c4a3d] whitespace-pre-wrap font-sans">{renderPreview(editBody)}</pre>
                            </div>
                            <p className="text-[10px] text-[#9ca3af] text-center">Preview with sample data</p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-[#6c7b6b] block mb-1">Subject Line</label>
                                <input
                                    type="text"
                                    value={editSubject}
                                    onChange={e => setEditSubject(e.target.value)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-[#e0e3e6] text-sm text-[#191c1e] focus:outline-none bg-white"
                                    style={{ '--focus-color': brandColor }}
                                    onFocus={e => e.target.style.borderColor = brandColor}
                                    onBlur={e => e.target.style.borderColor = '#e0e3e6'}
                                    placeholder="Email subject..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-[#6c7b6b] block mb-1">Message Body</label>
                                <textarea
                                    id="email-body-ta"
                                    value={editBody}
                                    onChange={e => setEditBody(e.target.value)}
                                    rows={10}
                                    className="w-full px-3 py-2.5 rounded-xl border border-[#e0e3e6] text-sm text-[#3c4a3d] focus:outline-none bg-white font-mono resize-none"
                                    onFocus={e => e.target.style.borderColor = brandColor}
                                    onBlur={e => e.target.style.borderColor = '#e0e3e6'}
                                    placeholder="Email body..."
                                />
                            </div>

                            {/* Variables */}
                            <div>
                                <p className="text-[10px] font-semibold text-[#6c7b6b] uppercase tracking-wide mb-2">Insert Variable</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {VARIABLES.map(v => (
                                        <button
                                            key={v.token}
                                            onClick={() => insertVar(v.token)}
                                            title={v.desc}
                                            className="px-2 py-1 text-[10px] font-mono bg-[#f5f7f5] border border-[#e0e3e6] rounded-lg transition-colors"
                                            style={{ color: brandColor }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.background = `${brandColor}12`;
                                                e.currentTarget.style.borderColor = `${brandColor}50`;
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.background = '#f5f7f5';
                                                e.currentTarget.style.borderColor = '#e0e3e6';
                                            }}
                                        >
                                            {v.token}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-4 py-3 border-t border-[#e0e3e6] flex items-center justify-between bg-[#fafafa]">
                        <button
                            onClick={handleReset}
                            className="text-xs text-[#6c7b6b] hover:text-[#dc2626] underline"
                        >
                            Reset to default
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                            style={{ background: saved ? '#16a34a' : brandColor }}
                            onMouseEnter={e => { if (!saving && !saved) e.currentTarget.style.filter = 'brightness(0.9)'; }}
                            onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
                        >
                            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Template'}
                        </button>
                    </div>
                </div>

                {/* Help */}
                <div className="bg-[#fffbeb] border border-[#fcd34d] rounded-2xl p-4">
                    <p className="text-xs font-semibold text-[#92400e] mb-1">💡 How variables work</p>
                    <p className="text-xs text-[#78350f]">Use <span className="font-mono">{'{{customer_name}}'}</span>, <span className="font-mono">{'{{order_id}}'}</span> etc. in your template — they'll be replaced with real values when the email is sent. Use Preview to see how it looks.</p>
                </div>
            </div>
        </div>
    );
}
