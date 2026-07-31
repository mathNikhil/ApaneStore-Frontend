// Client-side image validation

export const validateImageFile = (file, requirements) => {
    const { validation } = requirements;
    const errors = [];

    // 1. Check MIME type
    if (!validation.allowedMimeTypes.includes(file.type)) {
        errors.push(
            `Invalid file format. Please upload ${validation.allowedMimeTypes.join(' or ')}`
        );
    }

    // 2. Check file size
    if (file.size > validation.maxSize) {
        errors.push(
            `File too large. Maximum ${(validation.maxSize / 1024).toFixed(0)}KB. ` +
            `Current: ${(file.size / 1024).toFixed(1)}KB`
        );
    }

    if (file.size < validation.minSize) {
        errors.push(
            `File too small. Minimum ${(validation.minSize / 1024).toFixed(0)}KB. ` +
            `Current: ${(file.size / 1024).toFixed(1)}KB`
        );
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

export const getImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                });
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const validateImageDimensions = (dimensions, requirements) => {
    const { validation } = requirements;
    const errors = [];

    // Check width
    if (dimensions.width < validation.minWidth || dimensions.width > validation.maxWidth) {
        errors.push(
            `Image width should be around ${validation.minWidth}px. ` +
            `Current: ${dimensions.width}px (Allowed: ${validation.minWidth}-${validation.maxWidth}px)`
        );
    }

    // Check height
    if (dimensions.height < validation.minHeight || dimensions.height > validation.maxHeight) {
        errors.push(
            `Image height should be around ${validation.minHeight}px. ` +
            `Current: ${dimensions.height}px (Allowed: ${validation.minHeight}-${validation.maxHeight}px)`
        );
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
    validateImageFile,
    getImageDimensions,
    validateImageDimensions,
    formatFileSize
};