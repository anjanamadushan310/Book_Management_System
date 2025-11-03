import React, { useState } from 'react';
import { validateEmail, validatePassword, validateName, getErrorMessage } from '../utils/helpers';
import apiService from '../services/api';

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

    // Clear API error when user makes changes
    if (apiError) {
      setApiError('');
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

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters long';
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
    setApiError('');

    try {
      const response = await apiService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });

      // Call parent component's onRegister function
      onRegister(response.user);
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Create Your Account</h2>
        
        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

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
            placeholder="Enter your password (min 6 characters)"
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
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#059669', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              disabled={isLoading}
            >
              Sign in here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;