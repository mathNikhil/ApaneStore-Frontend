import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

// Helper to get the auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Maps each imageType to its real backend route segment (see routes/imageRoutes.js).
// imageType.toLowerCase() only happens to match LOGO ("logo") and HERO ("hero") —
// PRODUCT_MAIN/PRODUCT_GALLERY live under a nested "products/" path, and
// VARIANT/CATEGORY are pluralized on the route ("variants"/"categories"), so
// naively lowercasing the type produced a URL that didn't match any route (404).
const IMAGE_TYPE_ROUTE_SEGMENTS = {
    LOGO: 'logo',
    HERO: 'hero',
    PRODUCT_MAIN: 'products/main',
    PRODUCT_GALLERY: 'products/gallery',
    VARIANT: 'variants',
    CATEGORY: 'categories',
};

const getImageTypeSegment = (imageType) => {
    const segment = IMAGE_TYPE_ROUTE_SEGMENTS[imageType?.toUpperCase()];
    if (!segment) {
        throw new Error(`Unknown image type: ${imageType}`);
    }
    return segment;
};

const imageService = {
    // Upload a single image
    uploadImage: async (storeId, tenantId, imageType, file, referenceId = null) => {
        const formData = new FormData();
        formData.append('image', file);
        if (referenceId) {
            formData.append('referenceId', referenceId);
        }

        const token = getAuthToken();

        const response = await axios.post(
            `${API_URL}/api/stores/${tenantId}/${storeId}/images/${getImageTypeSegment(imageType)}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            }
        );
        return response.data;
    },

    // Upload multiple images (gallery)
    uploadGalleryImages: async (storeId, tenantId, imageType, files, referenceId) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('images', file);
        });
        formData.append('referenceId', referenceId);

        const token = getAuthToken();

        const response = await axios.post(
            `${API_URL}/api/stores/${tenantId}/${storeId}/images/${getImageTypeSegment(imageType)}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            }
        );
        return response.data;
    },

    // Get all store images
    getStoreImages: async (storeId) => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/stores/${storeId}/images`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Get branding images
    getBrandingImages: async (storeId) => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/stores/${storeId}/images/branding`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Get product images
    getProductImages: async (productId) => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/stores/products/${productId}/images`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Delete an image
    deleteImage: async (imageId) => {
        const token = getAuthToken();
        const response = await axios.delete(
            `${API_URL}/api/stores/images/${imageId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Get image requirements
    getRequirements: async (imageType) => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/stores/images/requirements/${imageType}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },

    // Get all image requirements
    getAllRequirements: async () => {
        const token = getAuthToken();
        const response = await axios.get(
            `${API_URL}/api/stores/images/requirements`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    },
};

export default imageService;