import toast, { Toaster } from 'react-hot-toast';
import { FaInfoCircle } from 'react-icons/fa';
import './ToastNotification.css';

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#10b981',
    },
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    },
    iconTheme: {
      primary: 'white',
      secondary: '#ef4444',
    },
  });
};

export const showInfoToast = (message: string) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: <FaInfoCircle aria-hidden />,
    style: {
      background: '#15803d',
      color: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 4px 12px rgba(21, 128, 61, 0.35)',
    },
  });
};

const ToastNotification = () => {
  return (
    <Toaster
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        className: 'custom-toast',
      }}
    />
  );
};

export default ToastNotification;






