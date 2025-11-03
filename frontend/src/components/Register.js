import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { validateEmail, validatePassword, validateName, getErrorMessage, getPasswordValidationError } from '../utils/helpers';
import apiService from '../services/api';
import usePopup from '../hooks/usePopup';
import Popup from './Popup';

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { popup, showError, showSuccess, hidePopup } = usePopup();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear popup when user makes changes
    if (popup.isOpen) {
      hidePopup();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordError = getPasswordValidationError(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      showSuccess('Account created successfully! You can now login.', 'Registration Complete');
      
      // Delay the navigation to allow user to see the success message
      setTimeout(() => {
        onRegister(response.user);
      }, 2000);
    } catch (error) {
      showError(getErrorMessage(error), 'Registration Failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Create Your Account</h2>
        


        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              disabled={isLoading}
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
        </div>

        <div className="password-requirements">
          <small>Password must contain:</small>
          <ul>
            <li className={formData.password.length >= 8 ? 'valid' : ''}>At least 8 characters</li>
            <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>One uppercase letter</li>
            <li className={/[a-z]/.test(formData.password) ? 'valid' : ''}>One lowercase letter</li>
            <li className={/\d/.test(formData.password) ? 'valid' : ''}>One number</li>
            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'valid' : ''}>One special character</li>
          </ul>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div className="auth-link">
          <p>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#059669', 
                textDecoration: 'none'
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </form>
      
      <Popup
        isOpen={popup.isOpen}
        onClose={hidePopup}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        autoClose={popup.autoClose}
        autoCloseDelay={popup.autoCloseDelay}
      />
    </div>
  );
};

export default Register;