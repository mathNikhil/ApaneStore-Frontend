import React, { useState } from 'react';
import PreviewHeader from './PreviewHeader';
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
  onBack,
  isQuickPreview = false,
}) => {
  const [activeTab, setActiveTab] = useState('home');
  const [device, setDevice] = useState('desktop');

  const {
    storeData,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartItemCount,
  } = usePreviewData(builderData);

  const handleAddToCart = function(productId, variationId, sizeId) {
    var allProducts = storeData.products || [];
    var product = null;
    for (var i = 0; i < allProducts.length; i++) {
      if (allProducts[i].id === productId) {
        product = allProducts[i];
        break;
      }
    }
    if (product) {
      addToCart(product, variationId, sizeId);
    }
  };

  var renderTab = function() {
    switch(activeTab) {
      case 'home':
        return <PreviewHomeTab data={storeData} onAddToCart={handleAddToCart} />;
      case 'cart':
        return <PreviewCartTab data={storeData} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />;
      case 'orders':
        return <PreviewOrdersTab data={storeData} />;
      case 'profile':
        return <PreviewProfileTab data={storeData} />;
      default:
        return <PreviewHomeTab data={storeData} onAddToCart={handleAddToCart} />;
    }
  };

  var deviceWidths = {
    desktop: '1200px',
    tablet: '768px',
    mobile: '400px'
  };

  // SAFE: Get colors with fallbacks
  var primaryColor = '#25D366';
  var secondaryColor = '#556067';
  if (storeData && storeData.brand && storeData.brand.colors) {
    primaryColor = storeData.brand.colors.primary || '#25D366';
    secondaryColor = storeData.brand.colors.secondary || '#556067';
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b px-4 py-3 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-[#556067] hover:bg-[#f2f4f7] p-2 rounded-lg transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="font-semibold text-lg">{isQuickPreview ? 'Quick Preview' : 'Store Preview'}</h2>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          {!isQuickPreview && (
            <PreviewDeviceToggle device={device} onChange={setDevice} />
          )}
          
          {!isQuickPreview && (
            <button
              onClick={onPublish}
              className="px-4 py-2 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Ready to Publish
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium border hover:bg-[#f2f4f7] transition-colors"
            style={{ borderColor: secondaryColor, color: secondaryColor }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Store Content */}
      <div className="flex-1 overflow-y-auto bg-[#f2f4f7] p-4">
        <div 
          className="mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500"
          style={{ maxWidth: isQuickPreview ? '400px' : (deviceWidths[device] || '1200px') }}
        >
          <PreviewHeader 
            brand={storeData.brand || {}} 
            cartCount={getCartItemCount()} 
          />
          
          <div className="pb-20">
            {renderTab()}
          </div>
          
          <PreviewFooter 
            activeTab={activeTab} 
            onChange={setActiveTab} 
            brandColors={storeData.brand && storeData.brand.colors ? storeData.brand.colors : {}}
          />
        </div>
      </div>
    </div>
  );
};

export default StorePreview;