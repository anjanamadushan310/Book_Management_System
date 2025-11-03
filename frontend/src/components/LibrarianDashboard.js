import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BookManagement from './BookManagement';
import CategoryManagement from './CategoryManagement';
import BorrowManagement from './BorrowManagement';

const LibrarianDashboard = ({ user, onLogout, defaultView = 'books' }) => {
  const [activeSection, setActiveSection] = useState(defaultView);
  const location = useLocation();

  useEffect(() => {
    // Set active section based on URL path or defaultView
    if (location.pathname.includes('/admin/books')) {
      setActiveSection('books');
    } else if (location.pathname.includes('/admin/categories')) {
      setActiveSection('categories');
    } else if (location.pathname.includes('/admin/borrows')) {
      setActiveSection('borrowing');
    } else if (defaultView) {
      setActiveSection(defaultView === 'categories' ? 'categories' : defaultView === 'borrows' ? 'borrowing' : 'books');
    }
  }, [location.pathname, defaultView]);

  const menuItems = [
    { id: 'books', label: 'Manage Books', path: '/admin/books' },
    { id: 'categories', label: 'Manage Categories', path: '/admin/categories' },
    { id: 'borrowing', label: 'Manage Borrowing', path: '/admin/borrows' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'books':
        return <BookManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'borrowing':
        return <BorrowManagement />;
      default:
        return <BookManagement />;
    }
  };

  return (
    <div className="librarian-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Library Management System</h1>
        </div>
        <div className="header-right">
          <span className="user-info">
            {user?.name} (Librarian)
          </span>
          <button className="btn btn-secondary logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Sidebar */}
        <nav className="dashboard-sidebar">
          <div className="sidebar-header">
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

          <div className="sidebar-footer">
            <div className="user-profile">
              <div className="user-details">
                <div className="user-name">{user?.name}</div>
                <div className="user-role">Librarian</div>
              </div>
            </div>
          </div>
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

export default LibrarianDashboard;