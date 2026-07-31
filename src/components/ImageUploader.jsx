import React, { useState, useRef } from 'react';
import { 
    validateImageFile, 
    getImageDimensions, 
    validateImageDimensions,
    formatFileSize 
} from '../utils/imageValidation';

function ImageUploader({ 
    type,
    label,
    requirements,
    value,
    onChange,
    error: externalError,
    accept = 'image/*',
    maxFiles = 1,
    multiple = false,
    onUploadStart,
    onUploadComplete,
}) {
    const [preview, setPreview] = useState(value || null);
    const [previews, setPreviews] = useState([]);
    const [localError, setLocalError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef();

    const { display, validation } = requirements;

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setLocalError('');
        setUploadProgress(0);
        setIsUploading(true);

        if (onUploadStart) onUploadStart();

        try {
            // Single file upload
            if (!multiple) {
                const file = files[0];
                
                // Validate file
                const validationResult = validateImageFile(file, requirements);
                if (!validationResult.valid) {
                    setLocalError(validationResult.errors[0]);
                    setIsUploading(false);
                    return;
                }

                // Get dimensions
                const dimensions = await getImageDimensions(file);
                const dimensionValidation = validateImageDimensions(dimensions, requirements);
                if (!dimensionValidation.valid) {
                    setLocalError(dimensionValidation.errors[0]);
                    setIsUploading(false);
                    return;
                }

                // Set preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(file);

                // Call onChange with file data
                onChange({
                    file: file,
                    preview: URL.createObjectURL(file),
                    dimensions: dimensions,
                    size: file.size,
                    type: file.type,
                    name: file.name
                });

                setUploadProgress(100);
                if (onUploadComplete) onUploadComplete(true);

            } else {
                // Multiple files upload
                const validFiles = [];
                const errors = [];

                for (const file of files) {
                    // Validate each file
                    const validationResult = validateImageFile(file, requirements);
                    if (!validationResult.valid) {
                        errors.push(`${file.name}: ${validationResult.errors[0]}`);
                        continue;
                    }

                    const dimensions = await getImageDimensions(file);
                    const dimensionValidation = validateImageDimensions(dimensions, requirements);
                    if (!dimensionValidation.valid) {
                        errors.push(`${file.name}: ${dimensionValidation.errors[0]}`);
                        continue;
                    }

                    validFiles.push({
                        file: file,
                        preview: URL.createObjectURL(file),
                        dimensions: dimensions,
                        size: file.size,
                        type: file.type,
                        name: file.name
                    });
                }

                if (errors.length > 0) {
                    setLocalError(errors.join(' | '));
                }

                if (validFiles.length > 0) {
                    setPreviews(validFiles.map(f => f.preview));
                    onChange(validFiles);
                }

                setUploadProgress(100);
                if (onUploadComplete) onUploadComplete(errors.length === 0);
            }

        } catch (error) {
            setLocalError('Failed to process image. Please try again.');
            if (onUploadComplete) onUploadComplete(false);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        setPreviews([]);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const displayError = externalError || localError;

    return (
        <div className="space-y-3">
            {/* Label with Requirements */}
            <div className="flex items-start justify-between">
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    <span className="ml-2 text-xs text-gray-500">
                        ({display.dimensions} • {display.format} • Max {display.maxSize})
                    </span>
                </label>
                {(preview || previews.length > 0) && (
                    <button
                        onClick={handleRemove}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                        Remove All
                    </button>
                )}
            </div>

            {/* Upload Area */}
            <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                    ${displayError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-500'}
                    ${(preview || previews.length > 0) ? 'bg-gray-50' : ''}`}
            >
                {preview && !multiple ? (
                    // Single Preview
                    <div className="space-y-3">
                        <img 
                            src={preview} 
                            alt={label}
                            className="mx-auto max-h-48 object-contain"
                        />
                        <p className="text-xs text-gray-500">
                            Click "Change" to upload a different image
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-600 hover:text-blue-800"
                            disabled={isUploading}
                        >
                            Change Image
                        </button>
                    </div>
                ) : previews.length > 0 && multiple ? (
                    // Multiple Preview
                    <div className="grid grid-cols-3 gap-2">
                        {previews.map((p, index) => (
                            <img 
                                key={index}
                                src={p} 
                                alt={`${label} ${index + 1}`}
                                className="w-full h-24 object-cover rounded"
                            />
                        ))}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="col-span-3 text-sm text-blue-600 hover:text-blue-800 mt-2"
                            disabled={isUploading}
                        >
                            Add More Images
                        </button>
                    </div>
                ) : (
                    // Upload Button
                    <div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={isUploading}
                        >
                            {isUploading ? 'Processing...' : 'Choose Image(s)'}
                        </button>
                        <p className="mt-2 text-xs text-gray-500">
                            {display.hint}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            Requirements: {display.dimensions} • {display.format} • Max {display.maxSize}
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                    multiple={multiple}
                />
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}

            {/* Error Display */}
            {displayError && (
                <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                    <span className="font-bold">⚠️</span>
                    <span>{displayError}</span>
                </div>
            )}

            {/* Success Message */}
            {(preview || previews.length > 0) && !displayError && !isUploading && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    ✅ {multiple ? `${previews.length} images` : 'Image'} uploaded successfully!
                </div>
            )}
        </div>
    );
}

export default ImageUploader;