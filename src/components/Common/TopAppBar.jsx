import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/Apnaestore-Logo.png';

const TopAppBar = ({
    title = 'Apna eStore',
    showBack = false,
    className = '',
    // Optional: pass these from StoreBuilderLayout to show step progress in header
    currentStep = null,
    totalSteps = null,
}) => {
    const navigate = useNavigate();

    const showProgress = currentStep !== null && totalSteps !== null;
    const percent = showProgress
        ? Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)
        : 0;

    return (
        <header className={`
            w-full sticky top-0 bg-white z-50 border-b border-[#bbcbb9] shadow-sm
            ${className}
        `}>
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                    {showBack && (
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1 rounded-full hover:bg-[#eceef1] transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                    )}

                    {/* ✅ Logo now navigates to the dashboard from any page */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                    >
                        <img
                            src={logo}
                            alt="Aapna eStore"
                            className="h-8 w-auto"
                        />

                        {title && (
                            <h1 className="text-xl font-bold text-[#006d2f] ml-1">{title}</h1>
                        )}
                    </button>
                </div>

                {/* Step + % badge — only rendered when currentStep/totalSteps are passed */}
                {showProgress && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#006d2f]">
                        <span className="bg-[#e6f4ec] text-[#006d2f] px-2.5 py-1 rounded-full">
                            Step {currentStep} / {totalSteps}
                        </span>
                        <span className="bg-[#006d2f] text-white px-2.5 py-1 rounded-full">
                            {percent}%
                        </span>
                    </div>
                )}
            </div>

            {/* Thin progress bar pinned to the very bottom of the header */}
            {showProgress && (
                <div className="h-1 w-full bg-[#e0e3e6]">
                    <div
                        className="h-1 bg-[#006d2f] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            )}
        </header>
    );
};

export default TopAppBar;