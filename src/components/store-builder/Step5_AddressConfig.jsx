import React, { useState, useEffect } from 'react';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Toggle from '../Common/Toggle';
import Slider from '../Common/Slider';

const Step5_AddressConfig = () => {
  const { addressData, setAddressData } = useStoreBuilder();

  const [settings, setSettings] = useState({
    maxAddresses: addressData.maxAddresses || 3,
    allowDefaultAddress: addressData.allowDefaultAddress !== undefined ? addressData.allowDefaultAddress : true,
    showAddressLabels: addressData.showAddressLabels !== undefined ? addressData.showAddressLabels : true,
    allowAddressEditing: addressData.allowAddressEditing !== undefined ? addressData.allowAddressEditing : true,
    allowAddressDeletion: addressData.allowAddressDeletion !== undefined ? addressData.allowAddressDeletion : true,
    fields: addressData.fields || {
      recipientName: true,
      recipientMobile: true,
      addressLine1: true,
      addressLine2: false,
      city: true,
      state: true,
      pincode: true,
      landmark: false,
    },
  });

  // Save to context on every change
  useEffect(() => {
    console.log('Saving Step 5 data:', settings); // Debug log
    setAddressData(settings);
  }, [settings]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFieldToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: !prev.fields[key],
      },
    }));
  };

  const handleSliderChange = (e) => {
    setSettings(prev => ({ ...prev, maxAddresses: parseInt(e.target.value) }));
  };

  const fieldLabels = [
    { key: 'recipientName', label: 'Recipient Name' },
    { key: 'recipientMobile', label: 'Recipient Mobile' },
    { key: 'addressLine1', label: 'Address Line 1' },
    { key: 'addressLine2', label: 'Address Line 2 (Optional)' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'Pincode' },
    { key: 'landmark', label: 'Landmark (Optional)' },
  ];

  return (
    <StoreBuilderLayout currentStep={5} totalSteps={8} title="Customer Address Configuration" subtitle="Step 5 of 8">
      <Card className="mb-6">
        <h2 className="font-label-md text-label-md text-[#3c4a3d] mb-4 tracking-wider uppercase text-xs">Address Management</h2>

        <Slider label="Maximum Addresses per User" value={settings.maxAddresses} onChange={handleSliderChange} valueLabel={settings.maxAddresses} min={1} max={5} className="mb-4" />

        <div className="space-y-3 pt-3 border-t border-[#e0e3e6]">
          <Toggle label="Allow users to set default address" checked={settings.allowDefaultAddress} onChange={() => handleToggle('allowDefaultAddress')} />
          <Toggle label="Show address labels (Home, Office, Other)" checked={settings.showAddressLabels} onChange={() => handleToggle('showAddressLabels')} />
          <Toggle label="Allow address editing" checked={settings.allowAddressEditing} onChange={() => handleToggle('allowAddressEditing')} />
          <Toggle label="Allow address deletion (except default)" checked={settings.allowAddressDeletion} onChange={() => handleToggle('allowAddressDeletion')} />
        </div>
      </Card>

      <Card>
        <h2 className="font-label-md text-label-md text-[#3c4a3d] mb-4 tracking-wider uppercase text-xs">Address Fields</h2>
        <div className="space-y-3">
          {fieldLabels.map((field) => (
            <Toggle key={field.key} label={field.label} checked={settings.fields[field.key]} onChange={() => handleFieldToggle(field.key)} className="border-b border-[#e0e3e6] pb-3 last:border-0 last:pb-0" />
          ))}
        </div>
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step5_AddressConfig;