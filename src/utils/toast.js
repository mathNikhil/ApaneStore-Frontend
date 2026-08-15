import toast from 'react-hot-toast';

export const showSuccess = (message) => {
    toast.success(message, {
        duration: 3000,
        position: 'top-center',
    });
};

export const showError = (message) => {
    toast.error(message, {
        duration: 4000,
        position: 'top-center',
    });
};

export const showLoading = (message) => {
    return toast.loading(message, {
        position: 'top-center',
    });
};

export const dismissToast = (id) => {
    toast.dismiss(id);
};

export default toast;
