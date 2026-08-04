import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/Apnaestore-Logo.png';

const TopAppBar = ({
    title = 'Apna eStore',
    showBack = false,
    className = '',
}) => {
    const navigate = useNavigate();

    return (
        <header className={`
            w-full sticky top-0 bg-white z-50 border-b border-[#bbcbb9] shadow-sm
            flex items-center justify-between px-4 py-3
            ${className}
        `}>
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
                        alt="ApnaEstore" 
                        className="h-8 w-auto"
                    />
                    
                    {title && (
                        <h1 className="text-xl font-bold text-[#006d2f] ml-1">{title}</h1>
                    )}
                </button>
            </div>
        </header>
    );
};

export default TopAppBar;