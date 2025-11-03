// Authentication utilities
export const getUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isLibrarian = () => {
  const user = getUser();
  return user && user.role === 'librarian';
};

export const isUser = () => {
  const user = getUser();
  return user && user.role === 'user';
};

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (Array.isArray(error)) {
    return error.join(', ');
  }
  
  return 'An unexpected error occurred';
};

// Format utilities
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};