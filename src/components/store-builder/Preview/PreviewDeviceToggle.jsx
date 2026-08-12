import React from 'react';

const PreviewDeviceToggle = ({ device, onChange }) => {
    const devices = [
        { id: 'mobile', icon: 'smartphone', label: 'Mobile' },
        { id: 'tablet', icon: 'tablet', label: 'Tablet' },
        { id: 'desktop', icon: 'desktop_windows', label: 'Desktop' },
    ];

    return (
        <div className="flex items-center gap-1 bg-[#f2f4f7] p-1 rounded-lg">
            {devices.map((d) => (
                <button
                    key={d.id}
                    onClick={() => onChange(d.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        device === d.id
                            ? 'bg-white text-[#006d2f] shadow-sm'
                            : 'text-[#556067] hover:text-[#191c1e]'
                    }`}
                >
                    <span className="material-symbols-outlined text-base">{d.icon}</span>
                    <span className="hidden sm:inline">{d.label}</span>
                </button>
            ))}
        </div>
    );
};

export default PreviewDeviceToggle;