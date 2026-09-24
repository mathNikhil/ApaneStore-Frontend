import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import Toggle from '../Common/Toggle';
import Slider from '../Common/Slider';

const Step3_CartConfig = () => {
  const { cartData, setCartData } = useStoreBuilder();

  const [settings, setSettings] = useState({
    enableDineIn: cartData.enableDineIn || false,
    dineInLabel: cartData.dineInLabel || 'Dine In',
    freeDelivery: cartData.freeDelivery !== undefined ? cartData.freeDelivery : true,
    freeDeliveryThreshold: cartData.freeDeliveryThreshold || 500,
    deliveryCharge: cartData.deliveryCharge || 40,
    showProgressBar: cartData.showProgressBar !== undefined ? cartData.showProgressBar : true,
    showDeliveryMessage: cartData.showDeliveryMessage !== undefined ? cartData.showDeliveryMessage : true,
    enableGST: cartData.enableGST !== undefined ? cartData.enableGST : true,
    gstRate: cartData.gstRate || 5,
    taxLabel: cartData.taxLabel || 'GST',
    showGSTBreakdownCart: cartData.showGSTBreakdownCart !== undefined ? cartData.showGSTBreakdownCart : true,
    showGSTBreakdownCheckout: cartData.showGSTBreakdownCheckout !== undefined ? cartData.showGSTBreakdownCheckout : true,
    gstNumber: cartData.gstNumber || '',
    hsnCode: cartData.hsnCode || '',
    storeState: cartData.storeState || '',
    panNumber: cartData.panNumber || '',
    tallyStockGroup: cartData.tallyStockGroup || '',
    tabName: cartData.tabName || 'Cart',
  });

  // Save to context on every change
  useEffect(() => {
    console.log('Saving Step 3 data:', settings); // Debug log
    setCartData(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setCartData(prev => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSliderChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <StoreBuilderLayout currentStep={3} totalSteps={8} title="Cart Configuration" subtitle="Step 3 of 8">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f] filled">tab</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Cart Tab Name</h2>
        </div>
        <div className="space-y-1 mb-2">
          <Input
            type="text"
            placeholder="e.g. Cart, Booking, Reserve, Order"
            value={settings.tabName}
            onChange={(e) => setSettings(prev => ({ ...prev, tabName: e.target.value }))}
            maxLength={20}
          />
          <p className="text-xs text-[#556067] ml-1">This label shows on the bottom navigation tab. Default is "Cart".</p>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f] filled">local_shipping</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Delivery Settings</h2>
        </div>

        <Toggle label="Enable Dine-In Option" description="Allow customers to choose between Dine In or Delivery at checkout (ideal for restaurants)" checked={settings.enableDineIn} onChange={() => handleToggle('enableDineIn')} className="mb-4" />
        {settings.enableDineIn && (
          <div className="mb-4 ml-1">
            <label className="block text-xs font-semibold text-[#3c4a3d] uppercase tracking-wider mb-1">Dine-In Button Label</label>
            <input
              type="text"
              value={settings.dineInLabel ?? ''}
              onChange={(e) => handleChange('dineInLabel', e.target.value)}
              placeholder="e.g. Dine In, Eat Here, Table Order"
              className="w-full border border-[#bbcbb9] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#006d2f]"
              maxLength={20}
            />
            <p className="text-xs text-[#556067] mt-1">This label appears on the order type selector in your storefront</p>
          </div>
        )}
        <Toggle label="Enable Free Delivery" checked={settings.freeDelivery} onChange={() => handleToggle('freeDelivery')} className="mb-4" />
        <Slider label="Free Delivery Threshold" value={settings.freeDeliveryThreshold} onChange={(e) => handleSliderChange('freeDeliveryThreshold', e.target.value)} valueLabel={`₹${settings.freeDeliveryThreshold}`} min={0} max={2000} unit="₹" className="mb-4" />
        <Toggle label="Show Progress Bar on Cart Page" description="Encourages customers to add more items for free delivery" checked={settings.showProgressBar} onChange={() => handleToggle('showProgressBar')} className="mb-3" />
        <Toggle label="Show Delivery Message on Product Page" description='Display text like "Free delivery above ₹500" near buy button' checked={settings.showDeliveryMessage} onChange={() => handleToggle('showDeliveryMessage')} className="mb-3" />

        <div className="space-y-1">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">Delivery Charge (when not free)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-[#191c1e] font-semibold">₹</span>
            </div>
            <Input type="text" value={settings.deliveryCharge} onChange={(e) => setSettings(prev => ({ ...prev, deliveryCharge: Number(e.target.value.replace(/[^0-9.]/g, '')) || 0 }))} className="pl-8" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#006d2f] filled">receipt_long</span>
          <h2 className="font-label-md text-label-md text-[#556067] uppercase tracking-wider text-xs">Tax Settings</h2>
        </div>

        <Toggle label="Enable GST" checked={settings.enableGST} onChange={() => handleToggle('enableGST')} className="mb-4" />
        <Slider label="GST Rate (%)" value={settings.gstRate} onChange={(e) => handleSliderChange('gstRate', e.target.value)} valueLabel={`${settings.gstRate}%`} min={0} max={28} unit="%" className="mb-4" />

        <div className="space-y-1 mb-4">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">Tax Label</label>
          <Input type="text" value={settings.taxLabel} onChange={(e) => setSettings(prev => ({ ...prev, taxLabel: e.target.value }))} />
        </div>

        <div className="space-y-1 mb-4">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">GSTIN / GST Number</label>
          <Input
            type="text"
            placeholder="e.g. 22AAAAA0000A1Z5"
            value={settings.gstNumber}
            onChange={(e) => setSettings(prev => ({ ...prev, gstNumber: e.target.value.toUpperCase() }))}
            maxLength={15}
          />
          <p className="text-xs text-[#556067] ml-1">Shown on cart and order pages to build customer trust</p>
        </div>

        <div className="space-y-1 mb-4">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">HSN / SAC Code</label>
          <Input
            type="text"
            placeholder="e.g. 6109 for T-shirts, 9963 for restaurants"
            value={settings.hsnCode}
            onChange={(e) => setSettings(prev => ({ ...prev, hsnCode: e.target.value }))}
            maxLength={8}
          />
          <p className="text-xs text-[#556067] ml-1">Required on GST tax invoice for each product</p>
        </div>

        <div className="space-y-1 mb-4">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">Place of Supply (State)</label>
          <select
            value={settings.storeState}
            onChange={(e) => setSettings(prev => ({ ...prev, storeState: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-[#bbcbb9] rounded-lg text-sm focus:outline-none focus:border-[#006d2f]"
          >
            <option value="">Select State</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Assam">Assam</option>
            <option value="Bihar">Bihar</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
            <option value="Goa">Goa</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Haryana">Haryana</option>
            <option value="Himachal Pradesh">Himachal Pradesh</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Kerala">Kerala</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Manipur">Manipur</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Odisha">Odisha</option>
            <option value="Punjab">Punjab</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Telangana">Telangana</option>
            <option value="Tripura">Tripura</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Uttarakhand">Uttarakhand</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
            <option value="Chandigarh">Chandigarh</option>
            <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
            <option value="Delhi">Delhi</option>
            <option value="Jammu and Kashmir">Jammu and Kashmir</option>
            <option value="Ladakh">Ladakh</option>
            <option value="Lakshadweep">Lakshadweep</option>
            <option value="Puducherry">Puducherry</option>
          </select>
          <p className="text-xs text-[#556067] ml-1">Required on GST tax invoice — your business state</p>
        </div>

        <div className="space-y-1 mb-4">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">PAN Number</label>
          <Input
            type="text"
            placeholder="e.g. AAAAA0000A"
            value={settings.panNumber}
            onChange={(e) => setSettings(prev => ({ ...prev, panNumber: e.target.value.toUpperCase() }))}
            maxLength={10}
          />
          <p className="text-xs text-[#556067] ml-1">Required on GST tax invoice</p>
        </div>

        <div className="space-y-1 mb-4 pt-4 border-t border-[#e0e3e6]">
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider font-bold">Tally / Accounting Settings</label>
          <p className="text-xs text-[#556067] ml-1 mb-3">These settings help export your inventory in Tally-compatible format</p>
          <label className="font-label-md text-[#3c4a3d] ml-1 text-xs uppercase tracking-wider">Tally Stock Group Name</label>
          <Input
            type="text"
            placeholder="e.g. Trading Goods, Finished Goods"
            value={settings.tallyStockGroup}
            onChange={(e) => setSettings(prev => ({ ...prev, tallyStockGroup: e.target.value }))}
          />
          <p className="text-xs text-[#556067] ml-1">Your CA will tell you what to enter here. Used in Tally inventory import.</p>
        </div>

        <Toggle label="Show GST Breakdown on Cart Page" checked={settings.showGSTBreakdownCart} onChange={() => handleToggle('showGSTBreakdownCart')} className="mb-3" />
        <Toggle label="Show GST Breakdown on Checkout Page" checked={settings.showGSTBreakdownCheckout} onChange={() => handleToggle('showGSTBreakdownCheckout')} />
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step3_CartConfig;