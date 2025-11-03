// Base API configuration
const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration - 401 Unauthorized (but not for login/register endpoints)
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        console.log('API call received 401 - token expired');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Trigger custom event for automatic redirect
        window.dispatchEvent(new CustomEvent('tokenExpired'));
        throw new Error('Token expired');
      }

      // Handle successful responses with no content (like DELETE operations)
      if (response.status === 204 || response.status === 200) {
        // Check if response has content before trying to parse JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          if (text.trim() === '') {
            return {}; // Return empty object for empty responses
          }
          return JSON.parse(text);
        } else {
          return {}; // Return empty object for non-JSON responses
        }
      }

      // For other status codes, try to parse JSON for error messages
      let data;
      try {
        const text = await response.text();
        data = text.trim() ? JSON.parse(text) : {};
      } catch (parseError) {
        data = { message: `HTTP error! status: ${response.status}` };
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Books endpoints
  async getBooks(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/books?${queryString}` : '/books';
    
    return this.request(endpoint);
  }

  async getBooksNoPagination(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/books/all/no-pagination?${queryString}` : '/books/all/no-pagination';
    
    return this.request(endpoint);
  }

  async getBook(id) {
    return this.request(`/books/${id}`);
  }

  async createBook(bookData) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(id, bookData) {
    return this.request(`/books/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(id) {
    return this.request(`/books/${id}`, {
      method: 'DELETE',
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/book-categories');
  }

  async getCategory(id) {
    return this.request(`/book-categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.request('/book-categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/book-categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/book-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Borrow endpoints
  async borrowBook(borrowData) {
    return this.request('/borrow/borrow', {
      method: 'POST',
      body: JSON.stringify(borrowData),
    });
  }

  async returnBook(returnData) {
    return this.request('/borrow/return', {
      method: 'POST',
      body: JSON.stringify(returnData),
    });
  }

  async getBorrowRecords(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/borrow?${queryString}` : '/borrow';
    
    return this.request(endpoint);
  }

  async getBorrowRecord(id) {
    return this.request(`/borrow/${id}`);
  }

  async getUserBorrowHistory(userId) {
    return this.request(`/borrow/user/${userId}`);
  }

  async getBookBorrowHistory(bookId) {
    return this.request(`/borrow/book/${bookId}`);
  }

  async getBorrowStatistics() {
    return this.request('/borrow/statistics');
  }

  async getOverdueBooks() {
    return this.request('/borrow/overdue');
  }

  // Users endpoints (for librarian use)
  async getUsersList() {
    return this.request('/auth/users');
  }

  // User-specific endpoints
  async getMyCurrentBooks() {
    return this.request('/borrow/my-books');
  }
}

export default new ApiService();