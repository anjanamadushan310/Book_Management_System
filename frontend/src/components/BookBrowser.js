import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import Pagination from './Pagination';
import usePopup from '../hooks/usePopup';
import Popup from './Popup';

const BookBrowser = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { popup, showError, showSuccess, hidePopup } = usePopup();
  const [filterCategory, setFilterCategory] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // 10 books per page for user browsing
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadData();
  }, [currentPage, filterCategory]); // Removed itemsPerPage since it's now fixed

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filterCategory && { categoryId: filterCategory })
      };
      
      const [booksResponse, categoriesResponse] = await Promise.all([
        apiService.getBooks(filters), // Use paginated endpoint for user browsing
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
        
        // Sort books by title by default
        formattedBooks.sort((a, b) => a.title.localeCompare(b.title));
        
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
        
        formattedBooks.sort((a, b) => a.title.localeCompare(b.title));
        setBooks(formattedBooks);
        setTotalItems(formattedBooks.length);
        setTotalPages(1);
      }

      setCategories(categoriesResponse || []);
    } catch (error) {
      showError(getErrorMessage(error), 'Error Loading Books');
      setBooks([]);
      setCategories([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books; // No search filtering, just category filtering handled by API

  const handleCategoryFilter = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
    <div className="book-browser">
      <div className="browser-header">
        <h2>Browse Library Books</h2>
        <p>Explore our collection of {books.length} books</p>
      </div>



      {/* Category Filter */}
      <div className="browser-controls">
        <div className="filter-section">
          <div className="filter-group">
            <label htmlFor="categoryFilter" className="filter-label">Filter by Category:</label>
            <select
              id="categoryFilter"
              className="filter-select"
              value={filterCategory}
              onChange={handleCategoryFilter}
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
      </div>

      {/* Books Table */}
      <div className="books-table-container">
        {filteredBooks.length === 0 ? (
          <div className="no-books">
            <div className="no-books-content">
              <h3>No books found</h3>
              <p>
                {filterCategory
                  ? 'No books found in this category.'
                  : 'The library collection is currently empty.'}
              </p>
            </div>
          </div>
        ) : (
          <table className="books-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="book-title-cell">
                      <strong>{book.title}</strong>
                      {book.stock === 0 && <span className="out-of-stock-badge">OUT OF STOCK</span>}
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
                    <span className={`stock-display ${book.stock === 0 ? 'out-of-stock' : book.stock < 5 ? 'low-stock' : 'in-stock'}`}>
                      {book.stock}
                      {book.stock === 0 && ' (Unavailable)'}
                      {book.stock > 0 && book.stock < 5 && ' (Limited)'}
                      {book.stock >= 5 && ' (Available)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          showPageSizeSelector={false}
        />
      )}
      
      {totalItems > 0 && (
        <div className="books-summary">
          <p>
            Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} books
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </p>
        </div>
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

export default BookBrowser;