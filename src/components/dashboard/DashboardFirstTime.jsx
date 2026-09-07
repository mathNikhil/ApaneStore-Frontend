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

            <main className="max-w-2xl mx-auto px-4 py-5">

                {/* Welcome */}
                <div className="mb-5">
                    <h1 className="text-xl font-medium text-[#111]">Welcome, {user?.company_name || 'there'}</h1>
                    <p className="text-xs text-[#9ca3af] mt-0.5">Let's get your first eStore up and running.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                    {[['Total','0','Start today'],['Published','0','Waiting'],['Draft','0','No drafts']].map(([lbl,num,hint]) => (
                        <div key={lbl} className="bg-white border border-[#f0f0f0] rounded-xl p-2.5">
                            <div className="text-[10px] text-[#c4c4c4] mb-1">{lbl}</div>
                            <div className="text-xl font-medium text-[#d1d5db]">{num}</div>
                            <div className="text-[9px] text-[#d1d5db] mt-0.5">{hint}</div>
                        </div>
                    ))}
                </div>

                {/* CTA block */}
                <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 mb-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#e8f5e2] flex items-center justify-center mx-auto mb-4">
                        <i className="ti ti-building-store text-[#2d7a22] text-2xl" />
                    </div>
                    <div className="text-base font-medium text-[#111] mb-1.5">Your store is ready to be built</div>
                    <div className="text-xs text-[#9ca3af] mb-6 leading-relaxed">Takes about 20 minutes.<br/>No coding. No tech knowledge needed.</div>
                    <button onClick={handleCreateStore}
                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium text-white"
                        style={{backgroundColor:'#2d7a22'}}>
                        <i className="ti ti-plus text-sm" style={{color:'#fff'}} />
                        Create your first store
                    </button>
                </div>

                {/* Quick Start Guide */}
                <div className="bg-white border border-[#f0f0f0] rounded-xl overflow-hidden">

                    {/* Guide header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f7f7f7]">
                        <div className="w-6 h-6 rounded-lg bg-[#e8f5e2] flex items-center justify-center flex-shrink-0">
                            <i className="ti ti-list-check text-[#2d7a22] text-xs" />
                        </div>
                        <div className="text-xs font-medium text-[#6b7280] flex-1">Quick start guide</div>
                        <div className="text-[10px] text-[#b3d9a4] font-medium flex items-center gap-1">
                            <i className="ti ti-clock text-[10px]" /> ~20 min to live
                        </div>
                    </div>

                    {/* 4 steps horizontal */}
                    <div className="grid grid-cols-2 md:grid-cols-4">
                        {[
                            { num:1, time:'3+10–15 min', title:'Set up your store', sub:[['Name and branding','3 min'],['Upload products','10–15 min']] },
                            { num:2, time:'3 min', title:'Set up payments', desc:'UPI or bank. 0% commission.' },
                            { num:3, time:'1 min', title:'Publish your store', desc:'Go live. Share your link.' },
                            { num:4, time:'1 min', title:'Share your link', desc:'Instagram bio, WhatsApp, visiting card.' },
                        ].map((step, idx) => (
                            <div key={step.num} className={`p-3 relative ${idx < 3 ? 'border-r border-[#f7f7f7]' : ''} ${idx < 2 ? 'border-b border-[#f7f7f7] md:border-b-0' : ''}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="w-5 h-5 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[10px] font-medium text-[#9ca3af]">{step.num}</div>
                                    <span className="text-[9px] text-[#d1d5db]">{step.time}</span>
                                </div>
                                <div className="text-[10px] font-medium text-[#9ca3af] mb-1 leading-tight">{step.title}</div>
                                {step.desc && <div className="text-[9px] text-[#c4c4c4] leading-relaxed">{step.desc}</div>}
                                {step.sub && (
                                    <div className="mt-1.5 pt-1.5 border-t border-dashed border-[#f0f0f0] space-y-1">
                                        {step.sub.map(([name,t]) => (
                                            <div key={name} className="flex items-start gap-1">
                                                <div className="w-1 h-1 rounded-full bg-[#d1d5db] mt-1.5 flex-shrink-0" />
                                                <div>
                                                    <div className="text-[9px] text-[#c4c4c4]">{name}</div>
                                                    <div className="text-[8px] text-[#d1d5db]">{t}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* WhatsApp row */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fafafa] border-t border-[#f7f7f7]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#b3d9a4] flex-shrink-0" />
                        <div className="text-[10px] text-[#9ca3af] flex-1">WhatsApp marketing — set up after your store is live via the Market tab</div>
                        <div className="text-[9px] text-[#b3d9a4] bg-[#f0faf0] rounded-full px-2 py-0.5 whitespace-nowrap">~15 min</div>
                    </div>

                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardFirstTime;
