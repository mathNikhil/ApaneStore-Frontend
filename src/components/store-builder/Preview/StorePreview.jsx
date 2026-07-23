import React, { useState } from 'react';
import PreviewHeader from './PreviewHeader';
import PreviewNav from './PreviewNav';
import PreviewFooter from './PreviewFooter';
import PreviewDeviceToggle from './PreviewDeviceToggle';
import PreviewHomeTab from './tabs/PreviewHomeTab';
import PreviewCartTab from './tabs/PreviewCartTab';
import PreviewOrdersTab from './tabs/PreviewOrdersTab';
import PreviewProfileTab from './tabs/PreviewProfileTab';
import { usePreviewData } from './hooks/usePreviewData';

const StorePreview = ({ 
  builderData = null,
  onClose, 
  onPublish,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [device, setDevice] = useState('desktop');
  
  const {
    storeData,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartItemCount,
  } = usePreviewData(builderData);

  const handleAddToCart = (productId, variationId, sizeId) => {
    const allProducts = storeData.products || [];
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product, variationId, sizeId);
    }
  };

  const renderTab = () => {
    switch(activeTab) {
      case 'home':
        return (
          <PreviewHomeTab 
            data={storeData} 
            onAddToCart={handleAddToCart}
          />
        );
      case 'cart':
        return (
          <PreviewCartTab 
            data={storeData}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        );
      case 'orders':
        return <PreviewOrdersTab data={storeData} />;
      case 'profile':
        return <PreviewProfileTab data={storeData} />;
      default:
        return <PreviewHomeTab data={storeData} onAddToCart={handleAddToCart} />;
    }
  };

  const deviceWidths = {
    desktop: '1200px',
    tablet: '768px',
    mobile: '400px'
  };

  // Get the primary color with fallback
  const primaryColor = storeData?.brand?.colors?.primary || '#25D366';
  const secondaryColor = storeData?.brand?.colors?.secondary || '#556067';

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col">
      {/* Top Bar - Device Toggle & Actions */}
      <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#556067] hover:bg-[#f2f4f7] p-2 rounded-lg transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-semibold text-lg">Store Preview</h2>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <PreviewDeviceToggle device={device} onChange={setDevice} />
          
          <button
            onClick={onPublish}
            className="px-4 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Ready to Publish
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border hover:bg-[#f2f4f7] transition-colors"
            style={{ borderColor: secondaryColor, color: secondaryColor }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Store Content - Scaled to Device */}
      <div className="flex-1 overflow-y-auto bg-[#f2f4f7] p-4">
        <div 
          className="mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500"
          style={{ maxWidth: deviceWidths[device] || '1200px' }}
        >
          {/* Store Header */}
          <PreviewHeader 
            brand={storeData.brand || {}} 
            cartCount={getCartItemCount()} 
          />
          
          {/* Store Navigation */}
          <PreviewNav 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            brandColors={storeData.brand?.colors || {}}
          />
          
          {/* Tab Content */}
          <div className="pb-20 lg:pb-0">
            {renderTab()}
          </div>
          
          {/* Footer (Mobile Bottom Nav) */}
          <PreviewFooter 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            brandColors={storeData.brand?.colors || {}}
          />
        </div>
      </div>
    </div>
  );
};

export default StorePreview;