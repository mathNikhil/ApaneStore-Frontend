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
    tagline: brandData.tagline || 'Fresh, Organic & Delivered to Your Doorstep',
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
        tagline: brandData.tagline || 'Fresh, Organic & Delivered to Your Doorstep',
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
      logoUrl: logoPreview,
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
      setUploadError('Store is still loading. Please wait a moment and try again.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // ✅ FIX: Save FIRST so a brand-new store actually gets created (and
      // we get a real store ID back) before attempting anything that needs
      // one, like an image upload. The previous order uploaded the logo
      // first using currentStoreId — which is null for a new store, since
      // nothing has created it yet — permanently blocking first-time setup.
      console.log('💾 Saving brand data to backend...');
      let saveResult = await saveStore();

      if (!saveResult.success) {
        setUploadError(saveResult.error || 'Failed to save. Please try again.');
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
          setUploadError(`Logo upload failed: ${response.error}`);
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
          setUploadError(saveResult.error || 'Logo uploaded, but failed to save. Please try again.');
          setIsUploading(false);
          return;
        }
      } else {
        console.log('ℹ️ No new logo selected. Skipping upload.');
      }

      navigate(`/store-builder/step/2?storeId=${saveResult.data?.data?.id || savedStoreId}`);
    } catch (error) {
      console.error('❌ Save/upload error:', error);
      setUploadError(error.response?.data?.error || error.message || 'Failed to save. Please try again.');
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
    'DM Sans', 'Karla', 'Figtree', 'Outfit', 'Epilogue', 'Public Sans', 'Sora'
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

  const handleColorChange = (colorKey, value) => {
    setFormData((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const processLogoFile = (file) => {
    const validTypes = ['image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a PNG image only');
      return;
    }
    if (file.size > 120 * 1024) {
      setUploadError('File size should be less than 120KB');
      return;
    }
    setUploadError('');
    
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
    setUploadError('');
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
    <StoreBuilderLayout
      currentStep={1}
      totalSteps={8}
      title="Brand configuration"
      subtitle="Complete these details to personalize your Apna eStore store identity."
      onContinue={handleContinue}
      onClose={handleClose}
      isUploading={isUploading}
    >
      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-4">
          ⚠️ {uploadError}
        </div>
      )}

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
          <span className="text-xs text-gray-400">Recommended: PNG only</span>
        </div>
        
        <input ref={fileInputRef} type="file" accept="image/png" onChange={handleFileSelect} className="hidden" />
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
              <p className="font-caption text-caption text-[#556067] mt-1 text-xs">PNG only • 200×200px • Max 100KB</p>
              {uploadError && <p className="text-[#ba1a1a] text-xs mt-2">{uploadError}</p>}
              <button onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} className="font-label-md text-label-md text-[#006d2f] border border-[#006d2f] px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors mt-4">Browse Files</button>
            </>
          )}
        </div>
        
        <ImageGuidelineBadge 
          size="200×200px" 
          format="PNG" 
          maxSize="100KB" 
          ratio="1:1" 
        />
        
        <div className="flex justify-center">
          <button onClick={handleUseDefault} className="font-label-md text-label-md text-[#006d2f] px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors">Use Default Logo</button>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Brand Colors</label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="font-caption text-caption text-[#556067] text-xs">Heading Font</span>
            <div className="bg-white border border-[#bbcbb9] rounded-lg flex items-center px-3">
              <select name="typography.headingFont" value={formData.typography.headingFont} onChange={handleChange} className="w-full bg-transparent border-none py-3 font-body-md text-body-md text-[#191c1e] focus:ring-0 outline-none appearance-none">
                {allFonts.map((font) => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
              </select>
              <span className="material-symbols-outlined text-[#556067]">expand_more</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="font-caption text-caption text-[#556067] text-xs">Body Font</span>
            <div className="bg-white border border-[#bbcbb9] rounded-lg flex items-center px-3">
              <select name="typography.bodyFont" value={formData.typography.bodyFont} onChange={handleChange} className="w-full bg-transparent border-none py-3 font-body-md text-body-md text-[#191c1e] focus:ring-0 outline-none appearance-none">
                {allFonts.map((font) => <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>)}
              </select>
              <span className="material-symbols-outlined text-[#556067]">expand_more</span>
            </div>
          </div>
          <div className="md:col-span-2 space-y-1">
            <span className="font-caption text-caption text-[#556067] text-xs">Base Font Size</span>
            <Input type="text" name="typography.baseFontSize" value={formData.typography.baseFontSize} onChange={handleChange} className="bg-white border border-[#bbcbb9] rounded-lg" />
          </div>
        </div>
        <div className="mt-3">
          <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" onChange={handleFontUpload} className="hidden" />
          <button onClick={handleFontUploadClick} className="flex items-center gap-2 text-[#006d2f] font-semibold text-sm hover:bg-[#25D366]/10 px-4 py-2 rounded-lg transition-colors">
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
  );
};

export default Step1_BrandSetup;