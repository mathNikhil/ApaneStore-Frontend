import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../Common/TopAppBar';
import BottomNav from '../Common/BottomNav';
import { useAuth } from '../../Context/AuthContext';

const DashboardFirstTime = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCreateStore = () => {
        // Clear any existing store context and navigate to step 1
        localStorage.removeItem('currentStoreId');
        localStorage.removeItem('storeBuilderData');
        navigate('/store-builder/step/1?new=true');
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <TopAppBar title="eStore Manager" />

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#191c1e]">Welcome, {user?.company_name || 'there'}</h1>
                    <p className="text-[#3c4a3d] mt-1">Let's get your first eStore up and running.</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Total</span>
                            <span className="material-symbols-outlined text-[#556067] opacity-50 text-base">inventory_2</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">0</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Start today</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Published</span>
                            <span className="material-symbols-outlined text-[#006d2f] opacity-50 text-base">bolt</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">0</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">Waiting</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#bbcbb9] shadow-sm hover:shadow-md transition-shadow text-center">
                        <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs text-[#3c4a3d] font-semibold">Draft</span>
                            <span className="material-symbols-outlined text-[#006b58] opacity-50 text-base">edit_note</span>
                        </div>
                        <div className="text-2xl font-bold text-[#191c1e]">0</div>
                        <div className="text-[10px] text-[#3c4a3d] mt-1">No drafts</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#bbcbb9] overflow-hidden shadow-sm p-8 md:p-16 text-center relative">
                    <div className="w-24 h-24 bg-[#25D366]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[#006d2f] text-5xl filled">add_business</span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#191c1e] mb-4">Welcome to Apna eStore!</h2>
                    <p className="text-[#3c4a3d] max-w-xl mx-auto mb-8 leading-relaxed">
                        Let's get your business online. It's time to build your digital presence 
                        and reach customers across the globe with our intuitive store manager.
                    </p>
                    <button 
                        onClick={handleCreateStore} 
                        className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#25D366] text-[#005523] font-bold text-lg rounded-xl hover:brightness-105 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">add</span>
                        Create Your First Store
                    </button>
                </div>

                <section className="mt-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-[#006d2f] flex items-center justify-center">
                            <i className="ti ti-device-mobile-share text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#191c1e]">Quick Start Guide</h2>
                            <p className="text-sm text-[#556067]">Live in under 20 minutes</p>
                        </div>
                    </div>

                    {/* Horizontal scroll on mobile, grid on desktop */}
                    <div className="flex gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-5 md:overflow-visible">
                        {[
                            { num: 1, icon: 'ti-user-circle', title: 'Sign up & name your store', time: '2 min', desc: 'Register with your mobile, enter your store name and pick your brand color. Your store URL is ready instantly.' },
                            { num: 2, icon: 'ti-package', title: 'Add your products', time: '5 min', desc: 'Upload a photo, add name, price and stock. Works like posting on Instagram — no technical knowledge needed.' },
                            { num: 3, icon: 'ti-credit-card', title: 'Set up payments', time: '3 min', desc: 'Connect your UPI ID. Customers pay by UPI, card, or COD. Money goes directly to you — 0% commission.' },
                            { num: 4, icon: 'ti-world-upload', title: 'Publish your store', time: '1 min', desc: 'Hit Publish. Share your store link on WhatsApp, Instagram or visiting card — customers order 24x7.' },
                            { num: 5, icon: 'ti-brand-whatsapp', title: 'Promote on WhatsApp', time: 'Bonus', desc: 'Use the built-in WhatsApp marketing tool to send product photos to contacts. Schedule offers for festivals & sales.' },
                        ].map((step) => (
                            <div key={step.num}
                                className={`flex-shrink-0 w-56 md:w-auto flex flex-col gap-3 p-4 rounded-2xl border transition-colors
                                    ${step.num === 5
                                        ? 'border-2 border-[#006d2f] bg-white'
                                        : 'border border-[#bbcbb9] bg-[#f2f4f7] hover:border-[#006d2f]'}`}>
                                <div className="flex items-center justify-between">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                                        ${step.num === 5 ? 'bg-[#006d2f] text-white' : 'bg-[#e8f5e2] text-[#27500a]'}`}>
                                        {step.num}
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                        ${step.num === 5 ? 'bg-[#006d2f] text-white' : 'bg-[#e8f5e2] text-[#27500a]'}`}>
                                        {step.time}
                                    </span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <i className={`ti ${step.icon} text-[#006d2f] text-base`} />
                                        <span className="text-sm font-semibold text-[#191c1e]">{step.title}</span>
                                    </div>
                                    <p className="text-xs text-[#556067] leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {[['20 min','store to live'],['0%','commission on sales'],['₹9.8','per day']].map(([val,label]) => (
                            <div key={label} className="bg-[#f2f4f7] rounded-xl p-3 text-center">
                                <div className="text-xl font-bold text-[#191c1e]">{val}</div>
                                <div className="text-xs text-[#556067] mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardFirstTime;
