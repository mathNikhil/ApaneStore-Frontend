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
        navigate('/store-builder/new/step/1');
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] pb-24">
            <TopAppBar title="eStore Manager" showProfile={true} />

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
                    <h2 className="text-xl font-bold text-[#191c1e] mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#006d2f]">rocket_launch</span>
                        Quick Start Guide
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#f2f4f7] p-6 rounded-xl border border-[#bbcbb9] hover:border-[#006d2f] transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-[#006d2f] shadow-sm mb-4">1</div>
                            <h4 className="font-bold text-[#191c1e] mb-2">Brand your store</h4>
                            <p className="text-sm text-[#3c4a3d]">Choose a unique name, upload your logo, and pick colors that represent your business.</p>
                        </div>
                        <div className="bg-[#f2f4f7] p-6 rounded-xl border border-[#bbcbb9] hover:border-[#006d2f] transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-[#006d2f] shadow-sm mb-4">2</div>
                            <h4 className="font-bold text-[#191c1e] mb-2">Add Products</h4>
                            <p className="text-sm text-[#3c4a3d]">List your items with high-quality photos, descriptions, and competitive pricing.</p>
                        </div>
                        <div className="bg-[#f2f4f7] p-6 rounded-xl border border-[#bbcbb9] hover:border-[#006d2f] transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center font-bold text-[#006d2f] shadow-sm mb-4">3</div>
                            <h4 className="font-bold text-[#191c1e] mb-2">Go Live</h4>
                            <p className="text-sm text-[#3c4a3d]">Connect your custom domain or use our subdomain to start accepting orders instantly.</p>
                        </div>
                    </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardFirstTime;
