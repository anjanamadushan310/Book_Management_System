import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookBrowser from './BookBrowser';
import MyBooks from './MyBooks';

const UserDashboard = ({ user, onLogout, defaultView = 'browse' }) => {
  const [activeSection, setActiveSection] = useState(defaultView);
  const location = useLocation();

  useEffect(() => {
    // Set active section based on URL path or defaultView
    if (location.pathname.includes('/books')) {
      setActiveSection('browse');
    } else if (location.pathname.includes('/my-books')) {
      setActiveSection('mybooks');
    } else if (defaultView) {
      setActiveSection(defaultView);
    }
  }, [location.pathname, defaultView]);

  const menuItems = [
    { id: 'browse', label: 'Browse Books', path: '/books' },
    { id: 'mybooks', label: 'My Books', path: '/my-books' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'mybooks':
        return <MyBooks user={user} />;
      default:
        return <BookBrowser user={user} />;
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-container">
        {/* Sidebar */}
        <nav className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="user-profile">
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-id">ID: {user?.id}</div>
                <div className="user-role">Member</div>
              </div>
            </div>
            <button className="btn btn-secondary logout-btn" onClick={onLogout}>
              Sign Out
            </button>
          </div>
          
          <div className="sidebar-nav-header">
            <h3>Navigation</h3>
          </div>
          
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span className="sidebar-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;