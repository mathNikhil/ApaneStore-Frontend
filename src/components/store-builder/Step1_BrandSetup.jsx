import AIAssistant from './AIAssistant';
import { showSuccess, showError } from '../../utils/toast';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';
import imageService from '../../services/imageService';

// ✅ Image Guideline Component
const ImageGuidelineBadge = ({ size, format, maxSize, ratio }) => (
  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">crop</span>
      <span className="font-medium">{size}</span>
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">description</span>
      <span>{format}</span>
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">sd_storage</span>
      <span>{maxSize}</span>
    </span>
    <span className="text-gray-300">|</span>
    <span className="flex items-center gap-0.5">
      <span className="material-symbols-outlined text-sm">aspect_ratio</span>
      <span>{ratio}</span>
    </span>
  </div>
);

// ✅ New brand color system (see design discussion): Tertiary and Element
// removed (they were unused across the real storefront), Font split into
// Header/Body, Secondary repurposed from "muted text" to "default/inactive
// state of toggles, checkboxes, progress bars" (muted text now comes from
// Font Body instead).

const BRAND_THEMES = [
  { name: 'Custom', emoji: '🎨' },
  { name: 'Forest', emoji: '🌿', colors: { primary: '#25D366', secondary: '#E0E3E6', background: '#FFFFFF', button: '#25D366', buttonLabel: '#005523', fontHeader: '#191C1E', fontBody: '#556067' } },
  { name: 'Ocean', emoji: '🌊', colors: { primary: '#0077B6', secondary: '#CAF0F8', background: '#F0F8FF', button: '#0077B6', buttonLabel: '#FFFFFF', fontHeader: '#03045E', fontBody: '#0096C7' } },
  { name: 'Sunset', emoji: '🌅', colors: { primary: '#FF6B35', secondary: '#FFE8DF', background: '#FFF8F5', button: '#FF6B35', buttonLabel: '#FFFFFF', fontHeader: '#2D1A0E', fontBody: '#7A3B1E' } },
  { name: 'Midnight', emoji: '🌙', colors: { primary: '#6C63FF', secondary: '#2D2B55', background: '#0F0F1A', button: '#6C63FF', buttonLabel: '#FFFFFF', fontHeader: '#FFFFFF', fontBody: '#B0AAFF' } },
  { name: 'Rose', emoji: '🌸', colors: { primary: '#E91E8C', secondary: '#FCE4F3', background: '#FFF5F9', button: '#E91E8C', buttonLabel: '#FFFFFF', fontHeader: '#4A0028', fontBody: '#9C2666' } },
  { name: 'Earth', emoji: '🪵', colors: { primary: '#8B4513', secondary: '#E8D5C4', background: '#FAF7F2', button: '#8B4513', buttonLabel: '#FFFFFF', fontHeader: '#2C1A0E', fontBody: '#6B4226' } },
  { name: 'Royal', emoji: '👑', colors: { primary: '#7B2FBE', secondary: '#EDE0FF', background: '#FAF7FF', button: '#7B2FBE', buttonLabel: '#FFFFFF', fontHeader: '#2D0063', fontBody: '#6B21A8' } },
  { name: 'Mint', emoji: '🍃', colors: { primary: '#00B894', secondary: '#D4F5EE', background: '#F5FFFD', button: '#00B894', buttonLabel: '#003D30', fontHeader: '#003D30', fontBody: '#2D7A6A' } },
  { name: 'Candy', emoji: '🍬', colors: { primary: '#FF4D8D', secondary: '#FFD6E7', background: '#FFF0F6', button: '#FF4D8D', buttonLabel: '#FFFFFF', fontHeader: '#3D0020', fontBody: '#A3004E' } },
  { name: 'Slate', emoji: '🩶', colors: { primary: '#475569', secondary: '#E2E8F0', background: '#F8FAFC', button: '#475569', buttonLabel: '#FFFFFF', fontHeader: '#0F172A', fontBody: '#64748B' } },
  { name: 'Saffron', emoji: '🟡', colors: { primary: '#F59E0B', secondary: '#FEF3C7', background: '#FFFBEB', button: '#F59E0B', buttonLabel: '#451A03', fontHeader: '#1C1400', fontBody: '#92400E' } },
  { name: 'Arctic', emoji: '❄️', colors: { primary: '#38BDF8', secondary: '#E0F2FE', background: '#F0F9FF', button: '#38BDF8', buttonLabel: '#0C2A40', fontHeader: '#0C2A40', fontBody: '#0369A1' } },
  { name: 'Olive', emoji: '🫒', colors: { primary: '#65A30D', secondary: '#ECFCCB', background: '#F7FEE7', button: '#65A30D', buttonLabel: '#1A2E05', fontHeader: '#1A2E05', fontBody: '#3F6212' } },
  { name: 'Crimson', emoji: '🔴', colors: { primary: '#DC143C', secondary: '#FFE4E8', background: '#FFF8F9', button: '#DC143C', buttonLabel: '#FFFFFF', fontHeader: '#3D0010', fontBody: '#9B0E2A' } },
  { name: 'Dusk', emoji: '🌆', colors: { primary: '#C084FC', secondary: '#F3E8FF', background: '#FAF5FF', button: '#A855F7', buttonLabel: '#FFFFFF', fontHeader: '#3B0764', fontBody: '#7C3AED' } },
];

const DEFAULT_BRAND_COLORS = {
  primary: '#25D366',
  secondary: '#E0E3E6',
  background: '#FFFFFF',
  button: '#25D366',
  buttonLabel: '#005523',
  fontHeader: '#191C1E',
  fontBody: '#556067',
};

// Merges saved brand colors with the new defaults. Existing stores saved
// before this change have the OLD shape (font/tertiary/element) — this
// migrates `font` -> `fontHeader` so nobody's saved header color silently
// resets, while tertiary/element are just left unused (harmless) rather
// than requiring a data migration.
const normalizeBrandColors = (saved) => {
  if (!saved) return { ...DEFAULT_BRAND_COLORS };
  return {
    ...DEFAULT_BRAND_COLORS,
    ...saved,
    fontHeader: saved.fontHeader || saved.font || DEFAULT_BRAND_COLORS.fontHeader,
  };
};

const Step1_BrandSetup = () => {
  const navigate = useNavigate();
  // ✅ FIX: Use `currentStoreId` and `tenantId` from context
  const { brandData, setBrandData, currentStoreId, tenantId, saveStore } = useStoreBuilder();
  const [validationError, setValidationError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // ✅ FIX: Prevent the button from working if IDs aren't loaded yet
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // ✅ FIX: Only require tenantId, not currentStoreId. A brand-new store
    // legitimately has no currentStoreId until the first save creates one —
    // requiring it here meant new store creation could never become "ready"
    // and Continue would be permanently blocked for first-time tenants.
    if (tenantId) {
      setIsReady(true);
      console.log('✅ Step 1 is ready! Store:', currentStoreId || '(new)', 'Tenant:', tenantId);
    } else {
      setIsReady(false);
      console.log('⏳ Step 1 waiting for tenant ID...');
    }
  }, [currentStoreId, tenantId]);

  // Load from context on mount
  const [formData, setFormData] = useState({
    brandName: brandData.brandName || '',
    tagline: brandData.tagline || '',
    colors: normalizeBrandColors(brandData.brandColors),
    typography: {
      headingFont: brandData.headingFont || 'Inter',
      bodyFont: brandData.bodyFont || 'Inter',
      baseFontSize: brandData.baseFontSize || '16px',
    },
  });

  const [logoData, setLogoData] = useState(null);
  const [logoPreview, setLogoPreview] = useState(brandData.logoUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const fontInputRef = useRef(null);

  // ✅ FIX: Re-hydrate the form once loadStore() actually finishes.
  // formData/logoPreview above are only captured once at mount, but loadStore()
  // is async and often hasn't resolved yet when this component first mounts —
  // so editing an existing store showed blank/default values. currentStoreId
  // only changes once loadStore's response has landed, so syncing on it here
  // (instead of on brandData) picks up the real data without looping against
  // the formData -> context effect below.
  useEffect(() => {
    if (currentStoreId) {
      setFormData({
        brandName: brandData.brandName || '',
        tagline: brandData.tagline || '',
        colors: normalizeBrandColors(brandData.brandColors),
        typography: {
          headingFont: brandData.headingFont || 'Inter',
          bodyFont: brandData.bodyFont || 'Inter',
          baseFontSize: brandData.baseFontSize || '16px',
        },
      });
      setLogoPreview(brandData.logoUrl || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStoreId]);

  // Save to context whenever formData or logo changes.
  // ✅ FIX: This used to call the raw setBrandData(...) with a completely
  // different set of field names (logo/colors/fonts) than what saveStore()
  // and loadStore() actually use (logoUrl/brandColors/headingFont/bodyFont).
  // Since setBrandData replaces the whole object (it's the raw useState
  // setter, not a merge), this was destructively wiping out logoUrl,
  // brandColors, headingFont, bodyFont, and bannerUrl on every keystroke —
  // then saveStore() would persist those wiped-out nulls to the database.
  // That's why brand color/logo/font choices "disappeared" on the next
  // visit: they were being overwritten with null on every save, not just
  // failing to load. Now merges (via the functional update form) and uses
  // the correct field names throughout.
  useEffect(() => {
    setBrandData(prev => ({
      ...prev,
      brandName: formData.brandName,
      tagline: formData.tagline,
      // Only save server URL, not base64 preview
      logoUrl: logoPreview?.startsWith('data:') ? (brandData.logoUrl || null) : (logoPreview || null),
      brandColors: formData.colors,
      headingFont: formData.typography.headingFont,
      bodyFont: formData.typography.bodyFont,
      baseFontSize: formData.typography.baseFontSize,
    }));
  }, [formData, logoPreview, setBrandData]);

  const validateStoreName = () => {
    if (!formData.brandName || formData.brandName.trim() === '') {
      setValidationError('Store name is required');
      return false;
    }
    setValidationError('');
    return true;
  };

  // ✅ FIXED: correct ordering for both new and existing stores
  const handleContinue = async () => {
    if (!validateStoreName()) return;

    // 🛡️ Only tenantId needs to be ready — currentStoreId is legitimately
    // null for a brand-new store until the save below creates it.
    if (!isReady || !tenantId) {
      showError('Store is still loading. Please wait a moment and try again.');
      return;
    }

    setIsUploading(true);
    

    try {
      // ✅ FIX: Save FIRST so a brand-new store actually gets created (and
      // we get a real store ID back) before attempting anything that needs
      // one, like an image upload. The previous order uploaded the logo
      // first using currentStoreId — which is null for a new store, since
      // nothing has created it yet — permanently blocking first-time setup.
      console.log('💾 Saving brand data to backend...');
      let saveResult = await saveStore();

      if (!saveResult.success) {
        showError(saveResult.error || 'Failed to save. Please try again.');
        setIsUploading(false);
        return;
      }

      const savedStoreId = saveResult.data?.data?.id || currentStoreId;

      // Only upload if a NEW file was actually selected.
      if (logoData && logoData.file) {
        console.log('📤 Uploading new logo to backend...');
        const response = await imageService.uploadImage(
          savedStoreId,
          tenantId,
          'LOGO',
          logoData.file
        );

        if (!response.success) {
          showError(`Logo upload failed: ${response.error}`);
          setIsUploading(false);
          return;
        }

        setLogoPreview(response.data.url);
        console.log('✅ Logo uploaded successfully.');

        // Save again to persist the new logo URL now that we have it.
        // Passing savedStoreId explicitly avoids saveStore() mistaking this
        // for another brand-new store — the closure's own currentStoreId
        // won't reflect the ID we just got back from the save above.
        saveResult = await saveStore(savedStoreId);
        if (!saveResult.success) {
          showError(saveResult.error || 'Logo uploaded, but failed to save. Please try again.');
          setIsUploading(false);
          return;
        }
      } else {
        console.log('ℹ️ No new logo selected. Skipping upload.');
      }

      navigate(`/store-builder/step/2?storeId=${saveResult.data?.data?.id || savedStoreId}`);
    } catch (error) {
      console.error('❌ Save/upload error:', error);
      showError(error.response?.data?.error || error.message || 'Failed to save. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!formData.brandName || formData.brandName.trim() === '') {
      setValidationError('Please enter a store name before closing');
      return;
    }
    navigate('/dashboard');
  };

  const freeFonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Nunito', 'Quicksand', 'Manrope', 'Work Sans', 'Plus Jakarta Sans',
    'DM Sans', 'Karla', 'Figtree', 'Outfit', 'Epilogue', 'Public Sans', 'Sora',
    'Raleway', 'Josefin Sans', 'Urbanist', 'Jost', 'Lexend', 'Mulish',
    'Playfair Display', 'Merriweather', 'Lora', 'EB Garamond', 'Cormorant Garamond',
    'DM Serif Display', 'Libre Baskerville', 'Source Serif 4',
    'Pacifico', 'Lobster', 'Dancing Script', 'Righteous', 'Fredoka',
    'Noto Sans Devanagari', 'Mukta', 'Hind', 'Baloo 2', 'Tiro Devanagari', 'Rozha One',
  ];

  const [customFonts, setCustomFonts] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (name === 'brandName' && validationError) {
      setValidationError('');
    }
  };

  const [selectedTheme, setSelectedTheme] = useState('Custom');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [headingFontOpen, setHeadingFontOpen] = useState(false);
  const [bodyFontOpen, setBodyFontOpen] = useState(false);

  const handleThemeSelect = (theme) => {
    if (theme.name === 'Custom') return;
    setSelectedTheme(theme.name);
    setFormData(prev => ({ ...prev, colors: { ...theme.colors } }));
  };

  const handleColorChange = (colorKey, value) => {
    setSelectedTheme('Custom');
    setFormData((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const processLogoFile = (file) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showError('Invalid format. Please upload a PNG or JPG image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const fileMB = (file.size / 1024 / 1024).toFixed(1);
      showError('File too large (' + fileMB + 'MB). Maximum allowed: 2MB');
      return;
    }
    
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target.result);
      setLogoData({
        file: file,        
        preview: e.target.result,
        name: file.name,
        size: file.size,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  };

  const handleFontUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const fontName = file.name.replace(/\.[^/.]+$/, '');
      if (!customFonts.includes(fontName) && !freeFonts.includes(fontName)) {
        setCustomFonts([...customFonts, fontName]);
      }
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFontUploadClick = () => fontInputRef.current?.click();

  const handleDragEnter = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.stopPropagation(); if (!isDragging) setIsDragging(true); }, [isDragging]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processLogoFile(files[0]);
  }, []);

  const handleUseDefault = () => {
    setLogoPreview(null);
    setLogoData(null);
    
  };

  const colorOptions = [
    { key: 'primary', label: 'Primary', hint: 'Active/selected state (toggles, checkboxes, progress bar)' },
    { key: 'secondary', label: 'Secondary', hint: 'Default/inactive state of the same elements' },
    { key: 'background', label: 'Background', hint: 'Default background of every element' },
    { key: 'button', label: 'Button', hint: 'Call-to-action button fill' },
    { key: 'buttonLabel', label: 'Button Label', hint: 'Text on top of buttons' },
    { key: 'fontHeader', label: 'Font Header', hint: 'All heading/title text' },
    { key: 'fontBody', label: 'Font Body', hint: 'All body/paragraph text' },
  ];

  const allFonts = [...freeFonts, ...customFonts];

  return (
    <>
    <AIAssistant currentStep={1} brandData={formData} />
    <StoreBuilderLayout
      currentStep={1}
      totalSteps={8}
      title="Brand configuration"
      subtitle="Complete these details to personalize your Apna eStore store identity."
      onContinue={handleContinue}
      onClose={handleClose}
      isUploading={isUploading}
    >
      {/* Brand Name */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">
          Store Name <span className="text-red-500">*</span>
        </label>
        <Input 
          name="brandName" 
          value={formData.brandName} 
          onChange={handleChange} 
          placeholder="Enter brand name" 
          className={`bg-white border ${validationError ? 'border-red-500' : 'border-[#bbcbb9]'} rounded-lg`}
          required
        />
        {validationError && (
          <p className="text-red-500 text-xs mt-1">{validationError}</p>
        )}
        <p className="text-xs text-gray-400">This will be your store name and is required to continue.</p>
      </div>

      {/* Store Tagline */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Store Tagline</label>
        <Input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Enter tagline" className="bg-white border border-[#bbcbb9] rounded-lg" />
      </div>

      {/* Logo Upload */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Logo Upload</label>
          <span className="text-xs text-gray-400">Recommended: 200×200px • Max 2MB • PNG/JPG</span>
        </div>
        
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" onChange={handleFileSelect} className="hidden" />
        <div
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`bg-white border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${isDragging ? 'border-[#006d2f] bg-[#25D366]/10' : 'border-[#bbcbb9] hover:border-[#006d2f] hover:bg-[#f2f4f7]'} ${logoPreview ? 'py-4' : 'py-8'}`}
        >
          {logoPreview ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="relative group">
                <img src={logoPreview} alt="Logo preview" className="w-24 h-24 rounded-full object-cover border-2 border-[#25D366]" />
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">Change</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#3c4a3d]">Logo uploaded</span>
                <button onClick={(e) => { e.stopPropagation(); handleUseDefault(); }} className="text-xs text-[#ba1a1a] font-semibold hover:underline">Remove</button>
              </div>
              <p className="font-caption text-caption text-[#556067] text-xs">Drag & drop a new image or click to replace</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-[#f2f4f7] flex items-center justify-center rounded-full mb-4">
                <span className="material-symbols-outlined text-4xl text-[#556067]">{isDragging ? 'file_upload' : 'storefront'}</span>
              </div>
              <p className="font-title-lg text-title-lg text-[#191c1e]">{isDragging ? 'Drop your logo here' : 'Drop your logo here or click to upload'}</p>
              <p className="font-caption text-caption text-[#556067] mt-1 text-xs">Recommended: 200×200px • Max 2MB • PNG/JPG</p>
              
              <button onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} className="font-label-md text-label-md text-[#006d2f] border border-[#006d2f] px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors mt-4">Browse Files</button>
            </>
          )}
        </div>
        
        <ImageGuidelineBadge 
          size="200×200px" 
          format="PNG" 
          maxSize="2MB" 
          ratio="1:1" 
        />
        
        <div className="flex justify-center">
          <button onClick={handleUseDefault} className="font-label-md text-label-md text-[#006d2f] px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors">Use Default Logo</button>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Brand Colors</label>
        <div className="mb-3">
          <label className="text-xs text-[#556067] mb-1 block">Start with a theme</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setThemeDropdownOpen(prev => !prev)}
              className="w-full border border-[#bbcbb9] rounded-lg px-3 py-2 text-sm bg-white text-[#191C1E] flex items-center justify-between cursor-pointer hover:border-[#25D366] transition-colors"
              style={{ borderColor: themeDropdownOpen ? '#25D366' : undefined }}
            >
              <div className="flex items-center gap-2">
                <span>{BRAND_THEMES.find(t => t.name === selectedTheme)?.emoji}</span>
                <span>{selectedTheme}</span>
                {selectedTheme !== 'Custom' && (
                  <div className="flex gap-1 ml-1">
                    {Object.values(BRAND_THEMES.find(t => t.name === selectedTheme)?.colors || {}).slice(0, 5).map((hex, i) => (
                      <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: hex, border: '0.5px solid rgba(0,0,0,0.1)' }} />
                    ))}
                  </div>
                )}
              </div>
              <span className="material-symbols-outlined text-[#556067] text-lg" style={{ transform: themeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>expand_more</span>
            </button>
            {themeDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-[#e0e3e6] rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: 320, overflowY: 'auto' }}>
                {BRAND_THEMES.map(theme => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => { handleThemeSelect(theme); setThemeDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#f0faf4] transition-colors text-sm"
                    style={{ background: selectedTheme === theme.name ? '#f0faf4' : undefined, borderLeft: selectedTheme === theme.name ? '3px solid #25D366' : '3px solid transparent' }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{theme.emoji}</span>
                      <span className="font-medium text-[#191C1E]">{theme.name}</span>
                    </div>
                    {theme.colors && (
                      <div className="flex gap-1">
                        {Object.values(theme.colors).map((hex, i) => (
                          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: hex, border: '0.5px solid rgba(0,0,0,0.1)' }} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {colorOptions.map((color) => (
              <div key={color.key} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.colors[color.key]}
                    onChange={(e) => handleColorChange(color.key, e.target.value)}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform p-0"
                    style={{ 
                      backgroundColor: formData.colors[color.key],
                      WebkitAppearance: 'none',
                      border: 'none',
                      outline: 'none',
                    }}
                    title={color.hint}
                  />
                  <style>{`
                    input[type="color"]::-webkit-color-swatch-wrapper {
                      padding: 0;
                    }
                    input[type="color"]::-webkit-color-swatch {
                      border: 2px solid white;
                      border-radius: 50%;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    input[type="color"]::-moz-color-swatch {
                      border: 2px solid white;
                      border-radius: 50%;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                  `}</style>
                </div>
                <span className="font-caption text-caption text-[#556067] text-xs">{color.label}</span>
                <span className="text-[10px] font-mono text-[#bbcbb9]">{formData.colors[color.key]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Typography */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Typography</label>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <span className="font-caption text-caption text-[#556067] text-xs">Font</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => { setBodyFontOpen(p => !p); setHeadingFontOpen(false); }}
                className="w-full bg-white border border-[#bbcbb9] rounded-lg flex items-center justify-between px-3 py-2.5 hover:border-[#25D366] transition-colors"
                style={{ borderColor: bodyFontOpen ? '#25D366' : undefined }}
              >
                <span className="text-[#556067] text-sm" style={{ fontFamily: formData.typography.bodyFont }}>{formData.typography.bodyFont}</span>
                <span className="material-symbols-outlined text-[#556067] text-lg" style={{ transform: bodyFontOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>expand_more</span>
              </button>
              {bodyFontOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-[#e0e3e6] rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: 260, overflowY: 'auto' }}>
                  {allFonts.map(font => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => { handleChange({ target: { name: 'typography.bodyFont', value: font } }); setBodyFontOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-[#f0faf4] transition-colors"
                      style={{ fontFamily: font, color: formData.typography.bodyFont === font ? '#006d2f' : '#556067', background: formData.typography.bodyFont === font ? '#f0faf4' : undefined, borderLeft: formData.typography.bodyFont === font ? '3px solid #25D366' : '3px solid transparent' }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[11px] mt-1 block px-1" style={{ fontFamily: formData.typography.bodyFont, color: formData.colors.fontBody }}>
              The quick brown fox jumps
            </span>
          </div>
          <div className="md:col-span-2 space-y-1 hidden">
            <span className="font-caption text-caption text-[#556067] text-xs">Base Font Size</span>
            <Input type="text" name="typography.baseFontSize" value={formData.typography.baseFontSize} onChange={handleChange} className="bg-white border border-[#bbcbb9] rounded-lg" />
          </div>
        </div>
        <div className="mt-3">
          <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" />
          <button onClick={handleFontUploadClick} className="hidden flex items-center gap-2 text-[#006d2f] font-semibold text-sm hover:bg-[#25D366]/10 px-4 py-2 rounded-lg transition-colors">
            <span className="material-symbols-outlined text-base">upload_file</span> Upload Custom Font
          </button>
          {customFonts.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {customFonts.map((font) => <span key={font} className="bg-[#25D366]/10 text-[#005523] px-3 py-1 rounded-full text-xs font-medium">{font} ✓</span>)}
            </div>
          )}
        </div>
      </div>

      {/* Brand Preview */}
      <Card className="relative overflow-hidden border border-[#bbcbb9]" style={{ backgroundColor: formData.colors.background }}>
        <div className="absolute top-3 right-3">
          <span className="font-label-md text-label-md bg-[#25D366]/20 text-[#005523] px-2 py-1 rounded text-xs">Live Preview</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#f2f4f7] flex-shrink-0" style={{ backgroundColor: formData.colors.primary }}>
            {logoPreview ? (
              <img className="w-full h-full object-cover" src={logoPreview} alt="Brand logo preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl">storefront</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-headline-md text-headline-md" style={{ color: formData.colors.fontHeader, fontFamily: formData.typography.headingFont }}>{formData.brandName || 'Your Brand Name'}</h3>
            <p className="font-body-md text-body-md" style={{ color: formData.colors.fontBody, fontFamily: formData.typography.bodyFont }}>{formData.tagline || 'Your tagline here'}</p>
          </div>
        </div>
        {/* Progress bar demo: Primary = active/filled, Secondary = default/inactive track */}
        <div className="mt-4 flex gap-2">
          <div className="h-1 flex-[2] rounded-full" style={{ backgroundColor: formData.colors.primary }} />
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: formData.colors.secondary }} />
        </div>
        <div className="mt-3 pt-3 border-t border-[#e0e3e6]">
          <button className="w-full py-2 rounded-lg text-sm font-semibold transition-colors" style={{ backgroundColor: formData.colors.button, color: formData.colors.buttonLabel }}>Preview Button</button>
        </div>
      </Card>
      
    </StoreBuilderLayout>
  </>
  );
};

export default Step1_BrandSetup;