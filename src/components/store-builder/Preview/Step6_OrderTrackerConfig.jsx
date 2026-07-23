import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Toggle from '../Common/Toggle';
import Slider from '../Common/Slider';

const Step6_OrderTrackerConfig = () => {
  const { orderData, setOrderData } = useStoreBuilder();

  const [settings, setSettings] = useState({
    enableCancellation: orderData.enableCancellation !== undefined ? orderData.enableCancellation : true,
    cancellationWindow: orderData.cancellationWindow || 2,
    cancelOnlyConfirmed: orderData.cancelOnlyConfirmed !== undefined ? orderData.cancelOnlyConfirmed : true,
    showCancelReason: orderData.showCancelReason !== undefined ? orderData.showCancelReason : true,
    sendCancelEmail: orderData.sendCancelEmail !== undefined ? orderData.sendCancelEmail : true,
    showStatusTimeline: orderData.showStatusTimeline !== undefined ? orderData.showStatusTimeline : true,
    showEstimatedDelivery: orderData.showEstimatedDelivery !== undefined ? orderData.showEstimatedDelivery : true,
  });

  // Save to context on every change
  useEffect(() => {
    console.log('Saving Step 6 data:', settings); // Debug log
    setOrderData(settings);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSliderChange = (e) => {
    setSettings(prev => ({ ...prev, cancellationWindow: parseInt(e.target.value) }));
  };

  const statusSteps = [
    { label: 'Confirmed', icon: 'check_circle', active: true },
    { label: 'Processing', icon: 'sync', active: true },
    { label: 'Out for Delivery', icon: 'local_shipping', active: false },
    { label: 'Delivered', icon: 'task_alt', active: false },
  ];

  return (
    <StoreBuilderLayout currentStep={6} totalSteps={7} title="Order Configuration" subtitle="Step 6 of 7">
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#ffdad6] text-[#93000a] flex items-center justify-center">
            <span className="material-symbols-outlined">cancel</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-background uppercase text-base">Order Cancellation</h2>
        </div>

        <Toggle label="Enable Order Cancellation" description="Allow customers to cancel orders from their tracker" checked={settings.enableCancellation} onChange={() => handleToggle('enableCancellation')} className="mb-4" />

        <Slider label="Cancellation Window" value={settings.cancellationWindow} onChange={handleSliderChange} valueLabel={`${settings.cancellationWindow} Hours`} min={0} max={24} unit="h" className="mb-4" />

        <div className="space-y-3 pt-3 border-t border-[#e0e3e6]">
          <Toggle label='Allow cancellation only for "Confirmed" orders' checked={settings.cancelOnlyConfirmed} onChange={() => handleToggle('cancelOnlyConfirmed')} />
          <Toggle label="Show cancellation reason option" checked={settings.showCancelReason} onChange={() => handleToggle('showCancelReason')} />
          <Toggle label="Send cancellation confirmation email" checked={settings.sendCancelEmail} onChange={() => handleToggle('sendCancelEmail')} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#67c9af] text-[#005343] flex items-center justify-center">
            <span className="material-symbols-outlined">analytics</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-background uppercase text-base">Order Status Flow</h2>
        </div>

        <div className="relative py-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[400px] px-2">
            {statusSteps.map((step, index) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${step.active ? 'bg-[#25D366] text-[#005523]' : 'bg-[#e0e3e6] text-[#556067]'}`}>
                    <span className="material-symbols-outlined text-base">{step.icon}</span>
                  </div>
                  <span className={`font-label-md text-label-md text-xs ${step.active ? 'text-[#191c1e]' : 'text-[#556067]'}`}>{step.label}</span>
                </div>
                {index < statusSteps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${step.active ? 'bg-[#25D366]' : 'bg-[#e0e3e6]'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-[#e0e3e6]">
          <Toggle label="Show status timeline on tracker page" checked={settings.showStatusTimeline} onChange={() => handleToggle('showStatusTimeline')} />
          <Toggle label="Show estimated delivery time" checked={settings.showEstimatedDelivery} onChange={() => handleToggle('showEstimatedDelivery')} />
        </div>
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step6_OrderTrackerConfig;