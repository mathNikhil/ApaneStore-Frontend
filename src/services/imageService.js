import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const imageService = {
    // Upload a single image
    uploadImage: async (storeId, tenantId, imageType, file, referenceId = null) => {
        const formData = new FormData();
        formData.append('image', file);
        if (referenceId) {
            formData.append('referenceId', referenceId);
        }

        // FIXED: Swapped storeId and tenantId order to match backend
        const response = await axios.post(
            `${API_URL}/api/stores/${tenantId}/${storeId}/images/${imageType.toLowerCase()}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
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

        // FIXED: Swapped storeId and tenantId order to match backend
        const response = await axios.post(
            `${API_URL}/api/stores/${tenantId}/${storeId}/images/${imageType.toLowerCase()}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    // Get all store images
    getStoreImages: async (storeId) => {
        const response = await axios.get(
            `${API_URL}/api/stores/${storeId}/images`
        );
        return response.data;
    },

    // Get branding images
    getBrandingImages: async (storeId) => {
        const response = await axios.get(
            `${API_URL}/api/stores/${storeId}/images/branding`
        );
        return response.data;
    },

    // Get product images
    getProductImages: async (productId) => {
        const response = await axios.get(
            `${API_URL}/api/stores/products/${productId}/images`
        );
        return response.data;
    },

    // Delete an image
    deleteImage: async (imageId) => {
        const response = await axios.delete(
            `${API_URL}/api/stores/images/${imageId}`
        );
        return response.data;
    },

    // Get image requirements
    getRequirements: async (imageType) => {
        const response = await axios.get(
            `${API_URL}/api/stores/images/requirements/${imageType}`
        );
        return response.data;
    },

    // Get all image requirements
    getAllRequirements: async () => {
        const response = await axios.get(
            `${API_URL}/api/stores/images/requirements`
        );
        return response.data;
    },
};

export default imageService;