import React, { useEffect } from 'react';

const Popup = ({ 
  isOpen, 
  onClose, 
  type = 'info', // 'success', 'error', 'warning', 'info'
  title, 
  message, 
  autoClose = false, 
  autoCloseDelay = 3000 
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return 'ℹ';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="popup-backdrop" onClick={onClose}></div>
      
      {/* Popup Container */}
      <div className={`popup-container popup-${type}`}>
        <div className="popup-header">
          <div className="popup-icon">
            {getIcon()}
          </div>
          <div className="popup-title">
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <button className="popup-close" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="popup-content">
          <p>{message}</p>
        </div>
        
        <div className="popup-actions">
          <button className="btn btn-primary popup-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </>
  );
};

export default Popup;