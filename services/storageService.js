import axios from 'axios';

class StorageService {
    constructor() {
        // ✅ Use import.meta.env instead of process.env
        this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002';
    }

    /**
     * Upload a single image
     */
    async uploadImage(file, options = {}) {
        const {
            tenantId = 'demo_tenant',
            storeId = 'demo_store',
            productId = null,
            categoryId = null,
            usageType = 'product',
            onProgress = null,
        } = options;

        if (!file) {
            throw new Error('No file provided');
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('tenantId', tenantId);
        formData.append('storeId', storeId);
        formData.append('productId', productId || '');
        formData.append('categoryId', categoryId || '');
        formData.append('usageType', usageType);

        try {
            const response = await axios.post(
                `${this.apiUrl}/api/images/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percent);
                        }
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Upload failed:', error);
            throw new Error(error.response?.data?.error || 'Failed to upload image');
        }
    }

    /**
     * Upload multiple images
     */
    async batchUploadImages(files, options = {}) {
        const {
            tenantId = 'demo_tenant',
            storeId = 'demo_store',
            productId = null,
            categoryId = null,
            usageType = 'product',
            onProgress = null,
        } = options;

        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        const formData = new FormData();
        
        files.forEach((file) => {
            formData.append('images', file);
        });
        
        formData.append('tenantId', tenantId);
        formData.append('storeId', storeId);
        formData.append('productId', productId || '');
        formData.append('categoryId', categoryId || '');
        formData.append('usageType', usageType);

        try {
            const response = await axios.post(
                `${this.apiUrl}/api/images/upload-multiple`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress(percent);
                        }
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error('Batch upload failed:', error);
            throw new Error(error.response?.data?.error || 'Failed to upload images');
        }
    }

    /**
     * Delete an image
     */
    async deleteImage(publicId) {
        try {
            const response = await axios.delete(`${this.apiUrl}/api/images/delete`, {
                data: { publicId }
            });
            return response.data;
        } catch (error) {
            console.error('Delete failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete all images for a product
     */
    async deleteProductImages(tenantId, storeId, productId) {
        try {
            const response = await axios.delete(`${this.apiUrl}/api/images/product-images`, {
                data: { tenantId, storeId, productId }
            });
            return response.data;
        } catch (error) {
            console.error('Delete product images failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get storage usage
     */
    async getStorageUsage(tenantId) {
        try {
            const response = await axios.get(`${this.apiUrl}/api/images/usage/${tenantId}`);
            return response.data;
        } catch (error) {
            console.error('Get storage usage failed:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new StorageService();