import AIAssistant from './AIAssistant';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';

const Step7_ProfileConfig = () => {
  const navigate = useNavigate();
  const { profileData, setProfileData, productData, brandData, currentStoreId, saveStore } = useStoreBuilder();
  const profileDataRef = React.useRef(false);

  var hasProducts = false;
  if (productData.categories) {
    for (var i = 0; i < productData.categories.length; i++) {
      if (productData.categories[i].products && productData.categories[i].products.length > 0) {
        hasProducts = true;
        break;
      }
    }
  }

  var [profile, setProfile] = useState({
    officeNumber: profileData.officeNumber || '',
    storeAddress: profileData.storeAddress || '',
    supportTime: profileData.supportTime || '9:00 AM - 6:00 PM',
    supportEmail: profileData.supportEmail || '',
    aboutUs: profileData.aboutUs || '',
    facebook: profileData.socialLinks && profileData.socialLinks.facebook ? profileData.socialLinks.facebook : '',
    instagram: profileData.socialLinks && profileData.socialLinks.instagram ? profileData.socialLinks.instagram : '',
    twitter: profileData.socialLinks && profileData.socialLinks.twitter ? profileData.socialLinks.twitter : '',
    youtube: profileData.socialLinks && profileData.socialLinks.youtube ? profileData.socialLinks.youtube : '',
    facebookReviews: profileData.feedbackLinks && profileData.feedbackLinks.facebookReviews ? profileData.feedbackLinks.facebookReviews : '',
    instagramFeedback: profileData.feedbackLinks && profileData.feedbackLinks.instagramFeedback ? profileData.feedbackLinks.instagramFeedback : '',
    returnPolicy: profileData.returnPolicy || '',
    shippingInfo: profileData.shippingInfo || '',
    seoTitle: profileData.seoTitle || '',
    seoDescription: profileData.seoDescription || '',
    seoKeywords: profileData.seoKeywords || '',
    storeLocations: profileData.storeLocations || [],
    storeState: profileData.storeState || '',
    storeCity: profileData.storeCity || '',
    storePincode: profileData.storePincode || '',
  });

  // Sync when store changes (store switch or refresh)
  useEffect(function() {
    setProfile({
      officeNumber: profileData.officeNumber || '',
      storeAddress: profileData.storeAddress || '',
      supportTime: profileData.supportTime || '9:00 AM - 6:00 PM',
      supportEmail: profileData.supportEmail || '',
      aboutUs: profileData.aboutUs || '',
      facebook: (profileData.socialLinks && profileData.socialLinks.facebook) || '',
      instagram: (profileData.socialLinks && profileData.socialLinks.instagram) || '',
      twitter: (profileData.socialLinks && profileData.socialLinks.twitter) || '',
      youtube: (profileData.socialLinks && profileData.socialLinks.youtube) || '',
      facebookReviews: (profileData.feedbackLinks && profileData.feedbackLinks.facebookReviews) || '',
      instagramFeedback: (profileData.feedbackLinks && profileData.feedbackLinks.instagramFeedback) || '',
      returnPolicy: profileData.returnPolicy || '',
    shippingInfo: profileData.shippingInfo || '',
    seoTitle: profileData.seoTitle || '',
    seoDescription: profileData.seoDescription || '',
    seoKeywords: profileData.seoKeywords || '',
      storeLocations: profileData.storeLocations || [],
      storeState: profileData.storeState || '',
      storeCity: profileData.storeCity || '',
      storePincode: profileData.storePincode || '',
    });
  }, [currentStoreId]);

  useEffect(function() {
    setProfileData({
      officeNumber: profile.officeNumber,
      storeAddress: profile.storeAddress,
      supportTime: profile.supportTime,
      supportEmail: profile.supportEmail,
      aboutUs: profile.aboutUs,
      socialLinks: {
        facebook: profile.facebook || '',
        instagram: profile.instagram || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
      },
      feedbackLinks: {
        facebookReviews: profile.facebookReviews || '',
        instagramFeedback: profile.instagramFeedback || '',
      },
      returnPolicy: profile.returnPolicy || '',
      shippingInfo: profile.shippingInfo || '',
      seoTitle: profile.seoTitle || '',
      seoDescription: profile.seoDescription || '',
      seoKeywords: profile.seoKeywords || '',
      storeLocations: profile.storeLocations || [],
      storeState: profile.storeState || '',
      storeCity: profile.storeCity || '',
      storePincode: profile.storePincode || '',
    });
  }, [profile]);

  var addLocation = function() {
    var newLoc = { id: 'loc_' + Date.now(), name: '', address: '', phone: '' };
    handleChange('storeLocations', [...(profile.storeLocations || []), newLoc]);
  };

  var updateLocation = function(id, field, value) {
    var updated = (profile.storeLocations || []).map(function(loc) {
      if (loc.id === id) { return { ...loc, [field]: value }; }
      return loc;
    });
    handleChange('storeLocations', updated);
  };

  var removeLocation = function(id) {
    var updated = (profile.storeLocations || []).filter(function(loc) { return loc.id !== id; });
    handleChange('storeLocations', updated);
  };

  var handleChange = function(key, value) {
    var newProfile = { ...profile };
    newProfile[key] = value;
    setProfile(newProfile);
    setProfileData(newProfile);
  };

  var handleSaveAndContinue = async function() {
    console.log('Step7 saving profile:', profile);
    console.log('seoTitle:', profile.seoTitle);
    if (saveStore) {
      const result = await saveStore().catch(console.error);
      console.log('Save result:', result);
    }
    navigate('/store-builder/step/8');
  };

  var handleCloseAndSaveDraft = function() {
    console.log('Close & Save - draft saved');
    navigate('/dashboard');
  };

  var socialLinks = [
    { key: 'facebook', label: 'Facebook URL', icon: 'facebook' },
    { key: 'instagram', label: 'Instagram URL', icon: 'camera_alt' },
    { key: 'twitter', label: 'Twitter URL', icon: 'alternate_email' },
    { key: 'youtube', label: 'YouTube URL', icon: 'play_circle' },
  ];

  return (
    <>
    <AIAssistant currentStep={7} brandData={brandData} />
    <StoreBuilderLayout
      currentStep={7}
      totalSteps={8}
      title="Profile configuration"
      subtitle="Step 7 of 8"
      onContinue={handleSaveAndContinue}
      continueLabel="Save & Continue"
      showCloseButton={true}
      onClose={handleCloseAndSaveDraft}
    >
      {!hasProducts && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ You haven't added any products yet. Your store preview will be empty.
            <button 
              onClick={function() { navigate('/store-builder/step/2'); }} 
              className="ml-2 font-semibold text-yellow-600 hover:underline"
            >
              Go to Products
            </button>
          </p>
        </div>
      )}

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#67c9af] text-[#005343] flex items-center justify-center">
            <span className="material-symbols-outlined">support_agent</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e] uppercase text-base">Support Details</h2>
        </div>

        {/* Office Number + Support Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Office Number</label>
            <Input value={profile.officeNumber} onChange={function(e) { handleChange('officeNumber', e.target.value); }} placeholder="+91 XXXXX XXXXX" />
          </div>
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Support Time</label>
            <Input value={profile.supportTime} onChange={function(e) { handleChange('supportTime', e.target.value); }} placeholder="e.g., 9 AM - 6 PM" />
          </div>
        </div>

        {/* Support Email */}
        <div className="space-y-1 mb-4">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Support Email ID</label>
          <Input value={profile.supportEmail} onChange={function(e) { handleChange('supportEmail', e.target.value); }} placeholder="support@domain.com" />
        </div>

        {/* Main Store Address */}
        <div className="mb-4">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs mb-1">Main Store Address</label>
          <textarea value={profile.storeAddress} onChange={function(e) { handleChange('storeAddress', e.target.value); }}
            className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none transition-all resize-none mb-2"
            rows="2" placeholder="Shop No. 5, MG Road, Mumbai - 400001" />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">State</label>
              <select value={profile.storeState || ''} onChange={function(e) { handleChange('storeState', e.target.value); }}
                className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none text-sm">
                <option value="">Select</option>
                {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Andaman and Nicobar Islands','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'].map(function(s) { return <option key={s} value={s}>{s}</option>; })}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">City</label>
              <Input value={profile.storeCity || ''} onChange={function(e) { handleChange('storeCity', e.target.value); }} placeholder="City" />
            </div>
            <div className="space-y-1">
              <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Pincode *</label>
              <Input value={profile.storePincode || ''} onChange={function(e) { handleChange('storePincode', e.target.value.replace(/\D/g, '').slice(0,6)); }} placeholder="6 digits" inputMode="numeric" pattern="[0-9]*" />
            </div>
          </div>
          <p className="text-xs text-[#556067] mt-1">Shown on invoice/bill. Pincode used for delivery zone matching.</p>
        </div>

        {/* Additional Store Locations */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Additional Store Locations</label>
            <span className="text-xs text-[#556067]">Optional</span>
          </div>
          {(profile.storeLocations || []).map(function(loc) {
            return (
              <div key={loc.id} className="border border-[#e0e3e6] rounded-xl p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#191c1e]">{loc.name || 'New Location'}</span>
                  <button onClick={function() { removeLocation(loc.id); }} className="text-red-400 hover:text-red-600">
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Location Name *</label>
                    <Input value={loc.name} onChange={function(e) { updateLocation(loc.id, 'name', e.target.value); }} placeholder="e.g. Rohini Branch, South Store" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Address *</label>
                    <Input value={loc.address} onChange={function(e) { updateLocation(loc.id, 'address', e.target.value); }} placeholder="Full address" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">State</label>
                      <select value={loc.state || ''} onChange={function(e) { updateLocation(loc.id, 'state', e.target.value); }}
                        className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none text-sm">
                        <option value="">Select</option>
                        {['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu and Kashmir','Ladakh','Puducherry','Chandigarh','Andaman and Nicobar Islands','Dadra and Nagar Haveli and Daman and Diu','Lakshadweep'].map(function(s) { return <option key={s} value={s}>{s}</option>; })}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">City</label>
                      <Input value={loc.city || ''} onChange={function(e) { updateLocation(loc.id, 'city', e.target.value); }} placeholder="City" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Pincode *</label>
                      <Input value={loc.pincode || ''} onChange={function(e) { updateLocation(loc.id, 'pincode', e.target.value.replace(/\D/g, '').slice(0,6)); }} placeholder="6 digits" inputMode="numeric" pattern="[0-9]*" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Phone</label>
                    <Input value={loc.phone || ''} onChange={function(e) { updateLocation(loc.id, 'phone', e.target.value); }} placeholder="Contact number for this location" />
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={addLocation}
            className="w-full py-2.5 border-2 border-dashed border-[#006d2f] text-[#006d2f] rounded-xl text-sm font-semibold hover:bg-[#f0faf4] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">add</span>
            Add Store Location
          </button>
        </div>

        {/* About Us */}
        <div className="space-y-1 mb-4">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">About Us</label>
          <textarea value={profile.aboutUs} onChange={function(e) { handleChange('aboutUs', e.target.value); }}
            className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none transition-all resize-none"
            rows="4" />
        </div>

        {/* Return Policy */}
        <div className="space-y-1">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Return & Exchange Policy <span className="text-[#8e9eab] normal-case font-normal">(Optional)</span></label>
          <textarea value={profile.returnPolicy || ''} onChange={function(e) { handleChange('returnPolicy', e.target.value); }}
            className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none transition-all resize-none"
            rows="3" placeholder="e.g. We accept returns within 7 days of delivery. Items must be unused and in original packaging..." />
          <p className="text-xs text-[#556067]">If filled, customers will see this on your store profile page.</p>
        </div>

        {/* Shipping Info */}
        <div className="space-y-1 mt-4">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Shipping Information <span className="text-[#8e9eab] normal-case font-normal">(Optional)</span></label>
          <textarea value={profile.shippingInfo || ''} onChange={function(e) { handleChange('shippingInfo', e.target.value); }}
            className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none transition-all resize-none"
            rows="3" placeholder="e.g. We ship within 2-3 business days. Free shipping on orders above ₹500..." />
          <p className="text-xs text-[#556067]">If filled, customers will see this on your store profile page.</p>
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#e0e3e6] text-[#556067] flex items-center justify-center">
            <span className="material-symbols-outlined">share</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e] uppercase text-base">Social Media</h2>
        </div>

        <div className="space-y-3">
          {socialLinks.map(function(social) {
            return (
              <div key={social.key} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#556067] opacity-60">{social.icon}</span>
                <Input 
                  value={profile[social.key]} 
                  onChange={function(e) { handleChange(social.key, e.target.value); }} 
                  placeholder={social.label} 
                  className="flex-1" 
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#e0e3e6] text-[#556067] flex items-center justify-center">
            <span className="material-symbols-outlined">reviews</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-[#191c1e] uppercase text-base">Feedback Links</h2>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Facebook Reviews URL</label>
            <Input 
              value={profile.facebookReviews} 
              onChange={function(e) { handleChange('facebookReviews', e.target.value); }} 
              placeholder="Paste link here" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Instagram Feedback URL</label>
            <Input 
              value={profile.instagramFeedback} 
              onChange={function(e) { handleChange('instagramFeedback', e.target.value); }} 
              placeholder="Paste link here" 
            />
          </div>
        </div>
      </Card>


      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#e8f5e9] text-[#006d2f] flex items-center justify-center">
            <span className="material-symbols-outlined">travel_explore</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-[#191c1e] uppercase text-base">SEO & Discoverability</h2>
            <p className="text-xs text-[#556067]">Help customers find your store on Google and social media</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">
              SEO Title <span className="text-[#8e9eab] normal-case font-normal">(shown on Google — max 60 chars)</span>
            </label>
            <Input
              value={profile.seoTitle || ''}
              onChange={function(e) { handleChange('seoTitle', e.target.value.slice(0, 60)); }}
              placeholder={`${profile.storeName || 'Your Store'} - Shop Online`}
            />
            <p className="text-xs text-[#8e9eab]">{(profile.seoTitle || '').length}/60 characters</p>
          </div>

          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">
              Meta Description <span className="text-[#8e9eab] normal-case font-normal">(shown on Google — max 160 chars)</span>
            </label>
            <textarea
              value={profile.seoDescription || ''}
              onChange={function(e) { handleChange('seoDescription', e.target.value.slice(0, 160)); }}
              className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none transition-all resize-none text-sm"
              rows="3"
              placeholder="Describe your store in 1-2 sentences. What do you sell? Where are you located?"
            />
            <p className="text-xs text-[#8e9eab]">{(profile.seoDescription || '').length}/160 characters</p>
          </div>

          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">
              Keywords <span className="text-[#8e9eab] normal-case font-normal">(comma separated)</span>
            </label>
            <Input
              value={profile.seoKeywords || ''}
              onChange={function(e) { handleChange('seoKeywords', e.target.value); }}
              placeholder="e.g. ethnic wear, kurti, delhi fashion, handmade jewellery"
            />
            <p className="text-xs text-[#556067]">Add words your customers search for on Google</p>
          </div>
        </div>
      </Card>

    </StoreBuilderLayout>
    </>
  );
};

export default Step7_ProfileConfig;