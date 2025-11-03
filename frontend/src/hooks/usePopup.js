import { useState, useCallback } from 'react';

const usePopup = () => {
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    autoClose: false,
    autoCloseDelay: 3000
  });

  const showPopup = useCallback((config) => {
    setPopup({
      isOpen: true,
      type: config.type || 'info',
      title: config.title || '',
      message: config.message || '',
      autoClose: config.autoClose !== undefined ? config.autoClose : false,
      autoCloseDelay: config.autoCloseDelay || 3000
    });
  }, []);

  const hidePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, title = 'Success', autoClose = true) => {
    showPopup({ type: 'success', title, message, autoClose });
  }, [showPopup]);

  const showError = useCallback((message, title = 'Error', autoClose = false) => {
    showPopup({ type: 'error', title, message, autoClose });
  }, [showPopup]);

  const showWarning = useCallback((message, title = 'Warning', autoClose = false) => {
    showPopup({ type: 'warning', title, message, autoClose });
  }, [showPopup]);

  const showInfo = useCallback((message, title = 'Information', autoClose = true) => {
    showPopup({ type: 'info', title, message, autoClose });
  }, [showPopup]);

  return {
    popup,
    showPopup,
    hidePopup,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default usePopup;