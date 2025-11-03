import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import usePopup from '../hooks/usePopup';
import Popup from './Popup';

const MyBooks = ({ user }) => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { popup, showError, hidePopup } = usePopup();

  useEffect(() => {
    loadMyBooks();
  }, [user]);

  const loadMyBooks = async () => {
    try {
      setLoading(true);
      const currentBooksResponse = await apiService.getMyCurrentBooks();
      
      setBorrowedBooks(currentBooksResponse || []);
    } catch (error) {
      showError(getErrorMessage(error), 'Error Loading Books');
      setBorrowedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (dueDate, status) => {
    if (status === 'returned') return 'returned';
    const daysUntilDue = getDaysUntilDue(dueDate);
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'due-soon';
    return 'active';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your books...</p>
      </div>
    );
  }

  return (
    <div className="my-books">
      <div className="my-books-header">
        <h2>My Books</h2>
        <p>Track your currently borrowed books</p>
      </div>



      {/* Statistics */}
      <div className="my-books-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>Currently Borrowed</h3>
            <p className="stat-number">{borrowedBooks.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>Overdue Books</h3>
            <p className="stat-number overdue">
              {borrowedBooks.filter(book => isOverdue(book.dueDate)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Current Books Section */}
      <div className="current-books-section">
        {borrowedBooks.length === 0 ? (
          <div className="no-books">
            <div className="no-books-content">
              <h3>No books currently borrowed</h3>
              <p>Browse our collection to find books to borrow!</p>
            </div>
          </div>
        ) : (
          <div className="books-list">
            {borrowedBooks.map((record) => {
              const daysUntilDue = getDaysUntilDue(record.dueDate);
              const statusColor = getStatusColor(record.dueDate, record.status);
              
              return (
                <div key={record.id} className={`book-item ${statusColor}`}>
                  <div className="book-item-header">
                    <div className="book-details">
                      <h3 className="book-title">{record.book?.title}</h3>
                      <p className="book-author">by {record.book?.author}</p>
                      <span className="book-category">
                        {record.book?.category?.name || 'Unknown Category'}
                      </span>
                    </div>
                    <div className="book-status">
                      {isOverdue(record.dueDate) ? (
                        <span className="status-badge overdue">Overdue</span>
                      ) : daysUntilDue <= 3 ? (
                        <span className="status-badge due-soon">Due Soon</span>
                      ) : (
                        <span className="status-badge active">Active</span>
                      )}
                    </div>
                  </div>

                  <div className="book-item-body">
                    <div className="date-info">
                      <div className="date-item">
                        <span className="date-label">Borrowed:</span>
                        <span className="date-value">{formatDate(record.borrowDate)}</span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Due Date:</span>
                        <span className={`date-value ${isOverdue(record.dueDate) ? 'overdue' : daysUntilDue <= 3 ? 'due-soon' : ''}`}>
                          {formatDate(record.dueDate)}
                        </span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Days Left:</span>
                        <span className={`date-value ${isOverdue(record.dueDate) ? 'overdue' : daysUntilDue <= 3 ? 'due-soon' : ''}`}>
                          {isOverdue(record.dueDate) 
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : daysUntilDue === 0 
                              ? 'Due today'
                              : `${daysUntilDue} days`
                          }
                        </span>
                      </div>
                    </div>

                    {record.notes && (
                      <div className="book-notes">
                        <span className="notes-label">Notes:</span>
                        <span className="notes-value">{record.notes}</span>
                      </div>
                    )}
                  </div>

                  {isOverdue(record.dueDate) && (
                    <div className="overdue-notice">
                      This book is overdue. Please return it as soon as possible.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
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

export default MyBooks;