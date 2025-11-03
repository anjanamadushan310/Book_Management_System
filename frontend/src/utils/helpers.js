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

// Function to decode JWT and check expiration
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) {
    console.log('No token found');
    return true;
  }
  
  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    console.log('Token payload:', payload);
    console.log('Token exp:', payload.exp, 'Current time:', currentTime);
    console.log('Token expired?', payload.exp < currentTime);
    
    // Check if token is expired
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Consider invalid token as expired
  }
};

// Function to handle automatic logout on token expiration
export const handleTokenExpiration = () => {
  console.log('Token expired - performing automatic logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Dispatch a custom event to notify App.js
  window.dispatchEvent(new CustomEvent('tokenExpired'));
};

export const isAuthenticated = () => {
  const hasToken = !!getToken();
  const tokenValid = hasToken && !isTokenExpired();
  
  // Clear expired token and trigger logout
  if (hasToken && !tokenValid) {
    handleTokenExpiration();
  }
  
  return tokenValid;
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
  if (!password) return false;
  
  // Strong password requirements:
  // - At least 8 characters long
  // - At least one uppercase letter
  // - At least one lowercase letter  
  // - At least one number
  // - At least one special character
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Function to get specific password validation error message
export const getPasswordValidationError = (password) => {
  if (!password) return 'Password is required';
  
  const errors = [];
  
  if (password.length < 8) {
    errors.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('one special character (!@#$%^&*(),.?":{}|<>)');
  }
  
  if (errors.length > 0) {
    return `Password must contain ${errors.join(', ')}`;
  }
  
  return null;
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
    // Handle specific authentication errors
    if (error.message.includes('Invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (error.message.includes('User with this email already exists')) {
      return 'An account with this email already exists. Please use a different email or try logging in.';
    }
    
    if (error.message.includes('Token expired')) {
      return 'Your session has expired. Please log in again.';
    }
    
    return error.message;
  }
  
  if (Array.isArray(error)) {
    return error.join(', ');
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Format utilities
export const formatPrice = (price) => {
  return `Rs ${(parseFloat(price) || 0).toFixed(2)}`;
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};