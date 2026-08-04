import React from 'react';
import { useNavigate } from 'react-router-dom';

const PublishFlowHeader = ({ title, step, totalSteps = 4, onBack, storeId }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(`/store-builder/preview?storeId=${storeId}`);
        }
    };

    return (
        <div className="sticky top-0 bg-white border-b border-[#e0e3e6] px-4 py-4 flex items-center justify-between z-10">
            <button onClick={handleBack} className="p-1 text-[#556067] hover:text-[#191c1e] transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="text-center">
                <span className="text-sm font-semibold text-[#006d2f]">{title}</span>
                {step && <div className="text-xs text-[#8e9eab] mt-0.5">Step {step} of {totalSteps}</div>}
            </div>
            <div className="w-8" />
        </div>
    );
};

export default PublishFlowHeader;
