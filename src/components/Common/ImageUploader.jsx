import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import storageService from '../../services/storageService';

const ImageUploader = ({
    type = 'product',
    tenantId = 'demo_tenant',
    storeId = 'demo_store',
    productId = null,
    categoryId = null,
    maxFiles = 20,
    existingImages = [],
    onUpload = null,
    onDelete = null,
    className = '',
    label = 'Upload Images',
    showGuidelines = true,
    multiple = true,
    disabled = false,
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [images, setImages] = useState(existingImages);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (disabled || uploading) return;
        
        setUploading(true);
        setProgress(0);
        setErrors([]);

        try {
            const response = await storageService.batchUploadImages(
                acceptedFiles,
                {
                    tenantId,
                    storeId,
                    productId,
                    categoryId,
                    usageType: type,
                    onProgress: setProgress,
                }
            );

            if (response.success) {
                const newImages = response.results
                    .filter(r => r.success)
                    .map(r => ({
                        url: r.urls.web,
                        original: r.urls.original,
                        thumbnail: r.urls.thumbnail,
                        mobile: r.urls.mobile,
                        hd: r.urls.hd,
                        publicId: r.publicId,
                        size: r.size,
                        format: r.format,
                    }));
                
                setImages(prev => [...prev, ...newImages]);
                if (onUpload) onUpload(newImages);
            }

            if (response.results.some(r => !r.success)) {
                const failed = response.results.filter(r => !r.success);
                setErrors(failed.map(r => `${r.fileName}: ${r.error}`));
            }

        } catch (error) {
            setErrors([error.message]);
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [tenantId, storeId, productId, categoryId, type, onUpload, disabled, uploading]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/gif': [],
        },
        maxSize: 5 * 1024 * 1024,
        multiple,
        disabled: disabled || uploading,
    });

    const handleDelete = async (image) => {
        if (!window.confirm('Delete this image?')) return;
        
        try {
            const result = await storageService.deleteImage(image.publicId);
            if (result.success) {
                setImages(prev => prev.filter(img => img.url !== image.url));
                if (onDelete) onDelete(image);
            } else {
                setErrors([result.error || 'Failed to delete image']);
            }
        } catch (error) {
            setErrors([error.message]);
        }
    };

    const guidelineTexts = {
        logo: {
            size: '500×500px',
            format: 'PNG (transparent background)',
            maxSize: '2MB',
            ratio: '1:1',
        },
        banner: {
            size: '1920×600px',
            format: 'JPG, PNG, WebP',
            maxSize: '5MB',
            ratio: '16:5',
        },
        product: {
            size: '800×800px',
            format: 'JPG, PNG, WebP',
            maxSize: '5MB',
            ratio: '1:1',
        },
        category: {
            size: '400×400px',
            format: 'JPG, PNG, WebP',
            maxSize: '2MB',
            ratio: '1:1',
        },
    };

    const guidelines = guidelineTexts[type] || guidelineTexts.product;

    return (
        <div className={`space-y-4 ${className}`}>
            {showGuidelines && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600">info</span>
                        <div className="text-sm text-blue-800">
                            <p className="font-semibold">Image Guidelines:</p>
                            <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                                <li>Recommended size: <strong>{guidelines.size}</strong></li>
                                <li>Format: <strong>{guidelines.format}</strong></li>
                                <li>Maximum file size: <strong>{guidelines.maxSize}</strong></li>
                                <li>Aspect ratio: <strong>{guidelines.ratio}</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500'}
                    ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} />
                
                {uploading ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center">
                            <span className="material-symbols-outlined animate-spin text-4xl text-green-600">
                                progress_activity
                            </span>
                        </div>
                        <div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-600 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Uploading... {progress}%
                            </p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-3xl text-gray-400">
                                upload_file
                            </span>
                        </div>
                        <p className="font-semibold text-gray-700 mt-4">
                            {isDragActive ? 'Drop your images here' : label}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {isDragActive ? '' : 'Drag & drop or click to browse'}
                        </p>
                        {multiple && (
                            <p className="text-xs text-gray-400 mt-1">
                                Max {maxFiles} images
                            </p>
                        )}
                    </div>
                )}
            </div>

            {errors.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-semibold">Errors:</p>
                    <ul className="list-disc list-inside mt-1">
                        {errors.map((error, index) => (
                            <li key={index} className="text-xs text-red-600">{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {images.length > 0 && (
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                        Uploaded Images ({images.length}/{maxFiles})
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {images.map((image, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                    <img
                                        src={image.thumbnail || image.url}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                
                                <button
                                    onClick={() => handleDelete(image)}
                                    className="absolute top-1 right-1 w-7 h-7 bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    disabled={disabled || uploading}
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>

                                <p className="text-xs text-gray-500 truncate mt-1 text-center">
                                    Image {index + 1}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;