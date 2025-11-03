import React, { useState, useEffect } from 'react';
import { getUser, isAuthenticated } from './utils/helpers';
import apiService from './services/api';
import Login from './components/Login';
import Register from './components/Register';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUser();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setShowRegister(false);
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still log out locally even if API call fails
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const switchToRegister = () => {
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return showRegister ? (
      <Register 
        onRegister={handleRegister}
        onSwitchToLogin={switchToLogin}
      />
    ) : (
      <Login 
        onLogin={handleLogin}
        onSwitchToRegister={switchToRegister}
      />
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">Book Management System</h1>
            <nav className="nav">
              <span className="nav-link">
                Welcome, {user?.name}
              </span>
              <span className="nav-link">
                Role: {user?.role === 'librarian' ? 'Librarian' : 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ marginLeft: '1rem' }}
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h2>Dashboard</h2>
          </div>
          <div className="card-body">
            <div className="alert alert-success">
              <h3>🎉 Authentication Successful!</h3>
              <p>You have successfully logged in to the Book Management System.</p>
              <div style={{ marginTop: '1rem' }}>
                <strong>Your Account Details:</strong>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  <li><strong>Name:</strong> {user?.name}</li>
                  <li><strong>Email:</strong> {user?.email}</li>
                  <li><strong>Role:</strong> {user?.role === 'librarian' ? 'Librarian (Full Access)' : 'User (Read Only)'}</li>
                </ul>
              </div>
            </div>

            {user?.role === 'librarian' ? (
              <div className="alert alert-info">
                <h4>📚 Librarian Features Available:</h4>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  <li>View all books and categories</li>
                  <li>Add new books and categories</li>
                  <li>Edit existing books and categories</li>
                  <li>Delete books and categories</li>
                  <li>Manage inventory and stock</li>
                </ul>
                <p style={{ marginTop: '1rem' }}>
                  <em>Book listing and management features are coming in the next phase...</em>
                </p>
              </div>
            ) : (
              <div className="alert alert-info">
                <h4>👤 User Features Available:</h4>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                  <li>View all books and categories</li>
                  <li>Search and filter books</li>
                  <li>View book details</li>
                </ul>
                <p style={{ marginTop: '1rem' }}>
                  <em>Book browsing features are coming in the next phase...</em>
                </p>
              </div>
            )}

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <h4>🚀 What's Next?</h4>
              <p>The book management features (CRUD operations, filtering, etc.) will be implemented next.</p>
              <p>This authentication system is now ready and working perfectly!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;