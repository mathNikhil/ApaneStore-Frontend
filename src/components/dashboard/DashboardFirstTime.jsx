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

                <div className="bg-white rounded-2xl border border-[#bbcbb9] overflow-hidden shadow-sm px-5 py-5">
                    {/* Icon + text row */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-[#006d2f] text-2xl filled">add_business</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-base font-bold text-[#191c1e] mb-1">Welcome to Apna eStore!</h2>
                            <p className="text-sm text-[#3c4a3d] leading-relaxed">
                                Let's get your business online. Build your digital presence and reach customers across the globe.
                            </p>
                        </div>
                    </div>
                    {/* CTA full width below */}
                    <button 
                        onClick={handleCreateStore} 
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#25D366] text-[#005523] font-bold text-sm rounded-xl hover:brightness-105 active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        Create Your First Store
                    </button>
                </div>

                {/* Quick Start Guide */}
                <section className="mt-6">
                  <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">

                    {/* Guide header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f0f0f0]">
                      <div className="w-8 h-8 rounded-lg bg-[#2d7a22] flex items-center justify-center flex-shrink-0">
                        <i className="ti ti-rocket text-white text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#111]">Quick start guide</div>
                        <div className="text-xs text-[#6b7280]">Follow these steps to go live</div>
                      </div>
                      <div className="text-xs text-[#2d7a22] font-medium bg-[#e8f5e2] rounded-full px-3 py-1 whitespace-nowrap flex items-center gap-1">
                        <i className="ti ti-clock text-xs" /> ~20 min to live
                      </div>
                    </div>

                    {/* 4 horizontal steps */}
                    <div className="grid grid-cols-2 md:grid-cols-4">
                      {[
                        { num:1, time:'3 + 10–15 min', title:'Set up your store', desc:'Name, branding and your products.', sub:[['Name and branding','3 min'],['Upload product photos','10–15 min']] },
                        { num:2, time:'3 min', title:'Set up payments', desc:'Connect UPI or bank. Customers pay by UPI, card, or COD. 0% commission — every rupee is yours.' },
                        { num:3, time:'1 min', title:'Publish your store', desc:'Hit Publish. Copy your link and share on WhatsApp and Instagram bio. Live 24×7.' },
                        { num:4, time:'1 min', title:'Share your link', desc:'Add store link to your Instagram bio, visiting card and WhatsApp status. Let people find you.', muted:true },
                      ].map((step, idx) => (
                        <div key={step.num} className={`p-3 relative ${idx < 3 ? 'border-r border-[#f0f0f0]' : ''} ${idx < 2 ? 'border-b border-[#f0f0f0] md:border-b-0' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border
                              ${step.muted ? 'bg-white border-[#e5e7eb] text-[#6b7280]' : 'bg-[#e8f5e2] border-[#b3d9a4] text-[#2d7a22]'}`}>
                              {step.num}
                            </div>
                            <span className="text-[9px] text-[#9ca3af] bg-[#f9fafb] border border-[#e5e7eb] rounded-full px-1.5 py-0.5">{step.time}</span>
                          </div>
                          <div className={`text-xs font-medium mb-1 leading-tight ${step.muted ? 'text-[#6b7280]' : 'text-[#111]'}`}>{step.title}</div>
                          <div className="text-[10px] text-[#6b7280] leading-relaxed">{step.desc}</div>
                          {step.sub && (
                            <div className="mt-2 pt-2 border-t border-dashed border-[#e5e7eb] space-y-1.5">
                              {step.sub.map(([name, t]) => (
                                <div key={name} className="flex items-start gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#b3d9a4] mt-1 flex-shrink-0" />
                                  <div>
                                    <div className="text-[10px] font-medium text-[#374151]">{name}</div>
                                    <div className="text-[9px] text-[#9ca3af]">{t}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp marketing bonus row */}
                    <div className="flex items-start gap-3 px-4 py-3 bg-[#f0faf0] border-t border-[#f0f0f0]">
                      <div className="w-7 h-7 rounded-lg bg-[#2d7a22] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ti ti-brand-whatsapp text-white text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-medium text-[#1a4f12]">WhatsApp marketing</span>
                          <span className="text-[9px] bg-white border border-[#b3d9a4] text-[#2d7a22] rounded-full px-2 py-0.5">~15 min setup</span>
                          <span className="text-[9px] bg-[#d1eac9] text-[#2d7a22] rounded-full px-2 py-0.5">Standalone feature</span>
                        </div>
                        <div className="text-xs text-[#2d7a22] leading-relaxed">Send product photos and offers to your contacts in one tap. Schedule festival offers and new arrivals — all built in, no extra app.</div>
                        <div className="text-[10px] text-[#6b9e6b] mt-1">Set this up after your store is live — go to the Market tab when ready.</div>
                      </div>
                    </div>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 border-t border-[#e5e7eb]">
                      {[['~20 min','store to live'],['0%','commission'],['₹9.8','per day']].map(([val,label],i) => (
                        <div key={label} className={`py-2.5 text-center ${i < 2 ? 'border-r border-[#e5e7eb]' : ''}`}>
                          <div className="text-sm font-medium text-[#2d7a22]">{val}</div>
                          <div className="text-[10px] text-[#9ca3af]">{label}</div>
                        </div>
                      ))}
                    </div>

                  </div>
                </section>
            </main>

            <BottomNav />
        </div>
    );
};

export default DashboardFirstTime;
