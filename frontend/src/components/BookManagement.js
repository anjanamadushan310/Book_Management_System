import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import Pagination from './Pagination';
import usePopup from '../hooks/usePopup';
import Popup from './Popup';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { popup, showError, showSuccess, hidePopup } = usePopup();
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    stock: '',
    bookCategoryId: ''
  });
  const [filterCategory, setFilterCategory] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, filterCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filterCategory && { categoryId: filterCategory })
      };
      
      const [booksResponse, categoriesResponse] = await Promise.all([
        apiService.getBooks(filters),
        apiService.getCategories()
      ]);
      
      // Handle paginated response
      if (booksResponse && booksResponse.data) {
        const formattedBooks = booksResponse.data.map(book => ({
          ...book,
          price: parseFloat(book.price || 0),
          stock: parseInt(book.stock || 0),
          bookCategoryId: parseInt(book.bookCategoryId || 0)
        }));
        
        setBooks(formattedBooks);
        setTotalItems(booksResponse.total);
        setTotalPages(booksResponse.totalPages);
      } else {
        // Fallback for non-paginated response
        const formattedBooks = (booksResponse || []).map(book => ({
          ...book,
          price: parseFloat(book.price || 0),
          stock: parseInt(book.stock || 0),
          bookCategoryId: parseInt(book.bookCategoryId || 0)
        }));
        setBooks(formattedBooks);
        setTotalItems(formattedBooks.length);
        setTotalPages(1);
      }
      
      setCategories(categoriesResponse || []);
    } catch (error) {
      showError(getErrorMessage(error), 'Error Loading Data');
      setBooks([]);
      setCategories([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (categoryId) => {
    setFilterCategory(categoryId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate and convert form data
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);
      const bookCategoryId = parseInt(formData.bookCategoryId);

      if (isNaN(price) || price < 0) {
        showError('Please enter a valid price in Rs', 'Validation Error');
        return;
      }

      if (isNaN(stock) || stock < 0) {
        showError('Please enter a valid stock quantity', 'Validation Error');
        return;
      }

      if (isNaN(bookCategoryId)) {
        showError('Please select a valid category', 'Validation Error');
        return;
      }

      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        price: price,
        stock: stock,
        bookCategoryId: bookCategoryId
      };

      if (editingBook) {
        await apiService.updateBook(editingBook.id, bookData);
        showSuccess('Book updated successfully!', 'Success');
      } else {
        await apiService.createBook(bookData);
        showSuccess('Book created successfully!', 'Success');
      }

      resetForm();
      loadData();
    } catch (error) {
      showError(getErrorMessage(error), 'Operation Failed');
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      price: (book.price || 0).toString(),
      stock: (book.stock || 0).toString(),
      bookCategoryId: (book.bookCategoryId || '').toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await apiService.deleteBook(book.id);
        showSuccess('Book deleted successfully!', 'Success');
        loadData();
      } catch (error) {
        showError(getErrorMessage(error), 'Delete Failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      price: '',
      stock: '',
      bookCategoryId: ''
    });
    setEditingBook(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading books...</p>
      </div>
    );
  }

  return (
    <div className="book-management">
      <div className="management-header">
        <h2>Book Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add New Book
        </button>
      </div>



      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label htmlFor="categoryFilter" className="form-label">Filter by Category:</label>
          <select
            id="categoryFilter"
            className="form-select"
            value={filterCategory}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-modal">
          <div className="modal-overlay" onClick={resetForm}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
              <button className="close-btn" onClick={resetForm}>Close</button>
            </div>
            
            <form onSubmit={handleSubmit} className="book-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title" className="form-label">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="form-input"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="author" className="form-label">Author *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    className="form-input"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price" className="form-label">Price (Rs) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className="form-input"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price in Rs"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock" className="form-label">Stock *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    className="form-input"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bookCategoryId" className="form-label">Category *</label>
                <select
                  id="bookCategoryId"
                  name="bookCategoryId"
                  className="form-select"
                  value={formData.bookCategoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Books Table */}
      <div className="books-table-container">
        <table className="table books-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  {filterCategory ? 'No books found in this category.' : 'No books available. Add your first book!'}
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <span className="book-id">{book.id}</span>
                  </td>
                  <td>
                    <div className="book-title">
                      <strong>{book.title}</strong>
                      {book.stock === 0 && <span className="out-of-stock-badge">UNAVAILABLE</span>}
                    </div>
                  </td>
                  <td>{book.author}</td>
                  <td>
                    <span className="category-tag">
                      {book.category?.name || 'Unknown'}
                    </span>
                  </td>
                  <td>
                    <span className="price">Rs {(parseFloat(book.price) || 0).toFixed(2)}</span>
                  </td>
                  <td>
                    <div className="stock-info">
                      <span className={`stock-number ${book.stock === 0 ? 'out-of-stock' : book.stock < 5 ? 'low-stock' : ''}`}>
                        {book.stock}
                      </span>
                      {book.stock === 0 && <span className="stock-status out-of-stock">Out of Stock</span>}
                      {book.stock > 0 && book.stock < 5 && <span className="stock-status low-stock">Low Stock</span>}
                    </div>
                  </td>
                  <td>
                    {new Date(book.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(book)}
                        title="Edit book"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(book)}
                        title="Delete book"
                      >
                        Delete
                      </button>
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

export default BookManagement;