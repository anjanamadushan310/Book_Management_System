import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getUser, isAuthenticated, isLibrarian, isTokenExpired, handleTokenExpiration } from './utils/helpers';
import apiService from './services/api';

// Auth Components
import Login from './components/Login';
import Register from './components/Register';

// Dashboard Components
import LibrarianDashboard from './components/LibrarianDashboard';
import UserDashboard from './components/UserDashboard';

import './index.css';

// Inner component that can use navigation hooks
function AppContent() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUser();
        if (userData) {
          setUser(userData);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Listen for custom token expiration event
    const handleTokenExpired = () => {
      console.log('Token expiration event received - redirecting to login');
      setUser(null);
      navigate('/login', { replace: true });
    };

    window.addEventListener('tokenExpired', handleTokenExpired);

    // Set up periodic token expiration check (every 5 seconds)
    const tokenCheckInterval = setInterval(() => {
      console.log('Checking token expiration...');
      const authenticated = isAuthenticated();
      console.log('Is authenticated:', authenticated, 'Current user:', !!user);
      
      // Note: isAuthenticated() will automatically trigger handleTokenExpiration() if token is expired
      // so we don't need additional logic here
    }, 5000); // Check every 5 seconds for testing

    // Cleanup interval and event listener on component unmount
    return () => {
      clearInterval(tokenCheckInterval);
      window.removeEventListener('tokenExpired', handleTokenExpired);
    };
  }, []); // Empty dependency array to run only once

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still log out locally even if API call fails
      setUser(null);
    }
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requireLibrarian = false }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    
    if (requireLibrarian && !isLibrarian()) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return children;
  };

  // Public Route Component (redirect if already logged in)
  const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login onLogin={handleLogin} />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register onRegister={handleRegister} />
          </PublicRoute>
        } />

        {/* Protected Routes - General Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            {isLibrarian() ? (
              <LibrarianDashboard 
                user={user} 
                onLogout={handleLogout} 
              />
            ) : (
              <UserDashboard 
                user={user} 
                onLogout={handleLogout} 
              />
            )}
          </ProtectedRoute>
        } />

        {/* Librarian-Only Routes */}
        <Route path="/admin/books" element={
          <ProtectedRoute requireLibrarian={true}>
            <LibrarianDashboard user={user} onLogout={handleLogout} defaultView="books" />
          </ProtectedRoute>
        } />

        <Route path="/admin/categories" element={
          <ProtectedRoute requireLibrarian={true}>
            <LibrarianDashboard user={user} onLogout={handleLogout} defaultView="categories" />
          </ProtectedRoute>
        } />

        <Route path="/admin/borrows" element={
          <ProtectedRoute requireLibrarian={true}>
            <LibrarianDashboard user={user} onLogout={handleLogout} defaultView="borrows" />
          </ProtectedRoute>
        } />

        {/* User Routes */}
        <Route path="/books" element={
          <ProtectedRoute>
            <UserDashboard user={user} onLogout={handleLogout} defaultView="browse" />
          </ProtectedRoute>
        } />

        <Route path="/my-books" element={
          <ProtectedRoute>
            <UserDashboard user={user} onLogout={handleLogout} defaultView="mybooks" />
          </ProtectedRoute>
        } />

        {/* Root redirect */}
        <Route path="/" element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />

        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </div>
  );
}

// Main App component with BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;