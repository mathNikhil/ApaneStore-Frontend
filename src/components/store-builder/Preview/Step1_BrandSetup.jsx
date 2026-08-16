import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoreBuilder } from '../../Context/StoreBuilderContext';
import StoreBuilderLayout from './StoreBuilderLayout';
import Card from '../Common/Card';
import Input from '../Common/Input';

const Step1_BrandSetup = () => {
  const navigate = useNavigate();
  const { brandData, setBrandData } = useStoreBuilder();

  // Load from context on mount
  const [formData, setFormData] = useState({
    brandName: brandData.brandName || '',
    tagline: brandData.tagline || 'Fresh, Organic & Delivered to Your Doorstep',
    colors: brandData.colors || {
      primary: '#25D366',
      secondary: '#111B21',
      tertiary: '#008069',
      element: '#F0F2F5',
      background: '#FFFFFF',
      button: '#25D366',
      buttonLabel: '#005523',
      font: '#191C1E',
    },
    typography: {
      headingFont: brandData.fonts?.heading || 'Inter',
      bodyFont: brandData.fonts?.body || 'Inter',
      baseFontSize: brandData.baseFontSize || '16px',
    },
  });

  const [logoPreview, setLogoPreview] = useState(brandData.logo || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const fontInputRef = useRef(null);

  // Save to context whenever formData or logo changes
  useEffect(() => {
    setBrandData({
      brandName: formData.brandName,
      tagline: formData.tagline,
      logo: logoPreview,
      colors: formData.colors,
      fonts: formData.typography,
      baseFontSize: formData.typography.baseFontSize,
    });
  }, [formData, logoPreview]);

  // Available free fonts
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
  };

  // One-click color picker - directly opens color picker
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
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (PNG, JPG, JPEG, GIF, WEBP, SVG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size should be less than 5MB');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target.result);
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
    setUploadError('');
  };

  const colorOptions = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'tertiary', label: 'Tertiary' },
    { key: 'element', label: 'Element' },
    { key: 'background', label: 'Background' },
    { key: 'button', label: 'Button' },
    { key: 'buttonLabel', label: 'Button Label' },
    { key: 'font', label: 'Font' },
  ];

  const allFonts = [...freeFonts, ...customFonts];

  return (
    <StoreBuilderLayout
      currentStep={1}
      totalSteps={7}
      title="Brand configuration"
      subtitle="Complete these details to personalize your Apna eStore store identity."
    >
      {/* Logo Upload */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Logo Upload</label>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
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
              {uploadError && <p className="text-[#ba1a1a] text-xs mt-2">{uploadError}</p>}
              <button onClick={(e) => { e.stopPropagation(); handleUploadClick(); }} className="font-label-md text-label-md text-[#006d2f] border border-[#006d2f] px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors mt-4">Browse Files</button>
            </>
          )}
        </div>
        <div className="flex justify-center">
          <button onClick={handleUseDefault} className="font-label-md text-label-md text-[#006d2f] px-4 py-2 rounded-lg hover:bg-[#25D366]/10 transition-colors">Use Default Logo</button>
        </div>
      </div>

      {/* Brand Name */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Brand Name</label>
        <Input name="brandName" value={formData.brandName} onChange={handleChange} placeholder="Enter brand name" className="bg-white border border-[#bbcbb9] rounded-lg" />
      </div>

      {/* Store Tagline */}
      <div className="space-y-4 mb-6">
        <label className="font-label-md text-label-md text-[#3c4a3d] uppercase tracking-wider text-xs">Store Tagline</label>
        <Input name="tagline" value={formData.tagline} onChange={handleChange} placeholder="Enter tagline" className="bg-white border border-[#bbcbb9] rounded-lg" />
      </div>

      {/* Brand Colors - One Click Color Picker */}
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
                    title={`Click to change ${color.label} color`}
                  />
                  {/* Custom styling for color picker */}
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
      <Card className="relative overflow-hidden border border-[#bbcbb9]">
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
            <h3 className="font-headline-md text-headline-md" style={{ color: formData.colors.font, fontFamily: formData.typography.headingFont }}>{formData.brandName || 'Your Brand Name'}</h3>
            <p className="font-body-md text-body-md" style={{ color: formData.colors.secondary, fontFamily: formData.typography.bodyFont }}>{formData.tagline || 'Your tagline here'}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: formData.colors.primary }} />
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: formData.colors.secondary }} />
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: formData.colors.tertiary }} />
        </div>
        <div className="mt-3 pt-3 border-t border-[#e0e3e6]">
          <button className="w-full py-2 rounded-lg text-sm font-semibold transition-colors" style={{ backgroundColor: formData.colors.button, color: formData.colors.buttonLabel }}>Preview Button</button>
        </div>
      </Card>
    </StoreBuilderLayout>
  );
};

export default Step1_BrandSetup;