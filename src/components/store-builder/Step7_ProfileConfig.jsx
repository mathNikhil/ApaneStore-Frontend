import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';

const Step7_ProfileConfig = () => {
  const navigate = useNavigate();
  const { profileData, setProfileData, productData } = useStoreBuilder();

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
    officeNumber: profileData.officeNumber || '+91 8800244169',
    supportTime: profileData.supportTime || '9:00 AM - 6:00 PM',
    supportEmail: profileData.supportEmail || 'support@chakki.com',
    aboutUs: profileData.aboutUs || 'We help small businesses create their own e-commerce stores easily.',
    facebook: profileData.socialLinks && profileData.socialLinks.facebook ? profileData.socialLinks.facebook : '',
    instagram: profileData.socialLinks && profileData.socialLinks.instagram ? profileData.socialLinks.instagram : '',
    twitter: profileData.socialLinks && profileData.socialLinks.twitter ? profileData.socialLinks.twitter : '',
    youtube: profileData.socialLinks && profileData.socialLinks.youtube ? profileData.socialLinks.youtube : '',
    facebookReviews: profileData.feedbackLinks && profileData.feedbackLinks.facebookReviews ? profileData.feedbackLinks.facebookReviews : '',
    instagramFeedback: profileData.feedbackLinks && profileData.feedbackLinks.instagramFeedback ? profileData.feedbackLinks.instagramFeedback : '',
  });

  useEffect(function() {
    setProfileData({
      officeNumber: profile.officeNumber,
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
    });
  }, [profile]);

  var handleChange = function(key, value) {
    var newProfile = { ...profile };
    newProfile[key] = value;
    setProfile(newProfile);
  };

  var handleSaveAndContinue = function() {
    // Navigate to Step 8 (Return Policy)
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Office Number</label>
            <Input 
              value={profile.officeNumber} 
              onChange={function(e) { handleChange('officeNumber', e.target.value); }} 
              placeholder="+91 XXXXX XXXXX" 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Support Time</label>
            <Input 
              value={profile.supportTime} 
              onChange={function(e) { handleChange('supportTime', e.target.value); }} 
              placeholder="e.g., 9 AM - 6 PM" 
            />
          </div>
        </div>

        <div className="space-y-1 mb-4">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Support Email ID</label>
          <Input 
            value={profile.supportEmail} 
            onChange={function(e) { handleChange('supportEmail', e.target.value); }} 
            placeholder="support@domain.com" 
          />
        </div>

        <div className="space-y-1">
          <label className="block text-label-md font-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">About Us</label>
          <textarea 
            value={profile.aboutUs} 
            onChange={function(e) { handleChange('aboutUs', e.target.value); }} 
            className="w-full bg-[#f2f4f7] border border-[#bbcbb9] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#25D366] focus:border-[#006d2f] outline-none transition-all resize-none" 
            rows="4" 
          />
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
    </StoreBuilderLayout>
  );
};

export default Step7_ProfileConfig;