import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import Pagination from './Pagination';
import usePopup from '../hooks/usePopup';
import Popup from './Popup';

const BorrowManagement = () => {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { popup, showError, showSuccess, hidePopup } = usePopup();
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [borrowFormData, setBorrowFormData] = useState({
    userId: '',
    bookId: '',
    dueDate: '',
    notes: ''
  });
  const [returnFormData, setReturnFormData] = useState({
    notes: ''
  });
  const [filter, setFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filterParams = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filter !== 'all' && { status: filter })
      };
      
      const [recordsResponse, usersResponse, booksResponse, statsResponse, overdueResponse] = await Promise.all([
        apiService.getBorrowRecords(filterParams),
        apiService.getUsersList().catch(() => []), // Fallback if endpoint doesn't exist
        apiService.getBooksNoPagination(),
        apiService.getBorrowStatistics(),
        apiService.getOverdueBooks()
      ]);

      // Handle paginated borrow records response
      if (recordsResponse && recordsResponse.data) {
        setBorrowRecords(recordsResponse.data);
        setTotalItems(recordsResponse.total);
        setTotalPages(recordsResponse.totalPages);
      } else {
        setBorrowRecords(recordsResponse || []);
        setTotalItems((recordsResponse || []).length);
        setTotalPages(1);
      }

      setUsers(usersResponse);
      setBooks(booksResponse);
      setStatistics(statsResponse);
      setOverdueBooks(overdueResponse);
    } catch (error) {
      showError(getErrorMessage(error), 'Error Loading Data');
      setBorrowRecords([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleBorrowInputChange = (e) => {
    const { name, value } = e.target;
    setBorrowFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReturnInputChange = (e) => {
    const { name, value } = e.target;
    setReturnFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBorrowSubmit = async (e) => {
    e.preventDefault();

    try {
      const borrowData = {
        userId: parseInt(borrowFormData.userId),
        bookId: parseInt(borrowFormData.bookId),
        ...(borrowFormData.dueDate && { dueDate: borrowFormData.dueDate }),
        ...(borrowFormData.notes && { notes: borrowFormData.notes })
      };

      await apiService.borrowBook(borrowData);
      showSuccess('Book borrowed successfully!', 'Success');
      resetBorrowForm();
      loadData();
    } catch (error) {
      showError(getErrorMessage(error), 'Borrow Failed');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();

    try {
      const returnData = {
        borrowRecordId: selectedRecord.id,
        ...(returnFormData.notes && { notes: returnFormData.notes })
      };

      await apiService.returnBook(returnData);
      showSuccess('Book returned successfully!', 'Success');
      resetReturnForm();
      loadData();
    } catch (error) {
      showError(getErrorMessage(error), 'Return Failed');
    }
  };

  const resetBorrowForm = () => {
    setBorrowFormData({
      userId: '',
      bookId: '',
      dueDate: '',
      notes: ''
    });
    setShowBorrowForm(false);
  };

  const resetReturnForm = () => {
    setReturnFormData({
      notes: ''
    });
    setSelectedRecord(null);
    setShowReturnForm(false);
  };

  const handleReturnBook = (record) => {
    setSelectedRecord(record);
    setShowReturnForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate, status) => {
    return status === 'borrowed' && new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading borrow records...</p>
      </div>
    );
  }

  return (
    <div className="borrow-management">
      <div className="management-header">
        <h2>Borrow Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowBorrowForm(true)}
        >
          Borrow Book
        </button>
      </div>







      {/* Borrow Form */}
      {showBorrowForm && (
        <div className="form-modal">
          <div className="modal-overlay" onClick={resetBorrowForm}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Borrow Book</h3>
              <button className="close-btn" onClick={resetBorrowForm}>Close</button>
            </div>
            
            <form onSubmit={handleBorrowSubmit} className="borrow-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="userId" className="form-label">User ID *</label>
                  <input
                    type="number"
                    id="userId"
                    name="userId"
                    className="form-input"
                    value={borrowFormData.userId}
                    onChange={handleBorrowInputChange}
                    placeholder="Enter user ID"
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bookId" className="form-label">Book ID *</label>
                  <input
                    type="number"
                    id="bookId"
                    name="bookId"
                    className="form-input"
                    value={borrowFormData.bookId}
                    onChange={handleBorrowInputChange}
                    placeholder="Enter book ID"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dueDate" className="form-label">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  className="form-input"
                  value={borrowFormData.dueDate}
                  onChange={handleBorrowInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
                <small className="form-help">
                  Leave empty for default 14 days from today
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-input"
                  rows="3"
                  value={borrowFormData.notes}
                  onChange={handleBorrowInputChange}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetBorrowForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Borrow Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Form */}
      {showReturnForm && selectedRecord && (
        <div className="form-modal">
          <div className="modal-overlay" onClick={resetReturnForm}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Return Book</h3>
              <button className="close-btn" onClick={resetReturnForm}>Close</button>
            </div>
            
            <div className="return-info">
              <h4>Book Details:</h4>
              <p><strong>Title:</strong> {selectedRecord.book?.title}</p>
              <p><strong>Author:</strong> {selectedRecord.book?.author}</p>
              <p><strong>Borrower:</strong> {selectedRecord.user?.name}</p>
              <p><strong>Borrowed:</strong> {formatDate(selectedRecord.borrowDate)}</p>
              <p><strong>Due:</strong> {formatDate(selectedRecord.dueDate)}</p>
              {isOverdue(selectedRecord.dueDate, selectedRecord.status) && (
                <p className="overdue-warning">This book is overdue!</p>
              )}
            </div>

            <form onSubmit={handleReturnSubmit} className="return-form">
              <div className="form-group">
                <label htmlFor="returnNotes" className="form-label">Return Notes</label>
                <textarea
                  id="returnNotes"
                  name="notes"
                  className="form-input"
                  rows="3"
                  value={returnFormData.notes}
                  onChange={handleReturnInputChange}
                  placeholder="Optional return notes (condition, late fees, etc.)..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetReturnForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Return Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="records-table-container">
        <table className="table records-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Borrower</th>
              <th>Borrowed Date</th>
              <th>Due Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {borrowRecords.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No borrow records found.
                </td>
              </tr>
            ) : (
              borrowRecords.map((record) => (
                <tr key={record.id} className={isOverdue(record.dueDate, record.status) ? 'overdue-row' : ''}>
                  <td>
                    <div className="book-info">
                      <strong>{record.book?.title}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      <strong>{record.user?.id}</strong>
                    </div>
                  </td>
                  <td>{formatDate(record.borrowDate)}</td>
                  <td className={isOverdue(record.dueDate, record.status) ? 'overdue-date' : ''}>
                    {formatDate(record.dueDate)}
                    {isOverdue(record.dueDate, record.status) && <span className="overdue-label"> (Overdue)</span>}
                  </td>
                  <td>
                    {record.returnDate ? formatDate(record.returnDate) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge status-${record.status}`}>
                      {record.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {record.status === 'borrowed' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleReturnBook(record)}
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          showPageSizeSelector={false}
        />
      )}
      
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

export default BorrowManagement;