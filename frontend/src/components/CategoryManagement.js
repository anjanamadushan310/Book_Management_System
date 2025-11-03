import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import usePopup from '../hooks/usePopup';
import Popup from './Popup';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { popup, showError, showSuccess, hidePopup } = usePopup();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCategories();
      setCategories(response);
    } catch (error) {
      showError(getErrorMessage(error), 'Error Loading Categories');
    } finally {
      setLoading(false);
    }
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

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      showError('Category name is required', 'Validation Error');
      return;
    }

    if (trimmedName.length < 2) {
      showError('Category name at least 2 character', 'Validation Error');
      return;
    }

    try {
      if (editingCategory) {
        await apiService.updateCategory(editingCategory.id, formData);
        showSuccess('Category updated successfully!', 'Success');
      } else {
        await apiService.createCategory(formData);
        showSuccess('Category created successfully!', 'Success');
      }

      resetForm();
      loadCategories();
    } catch (error) {
      showError(getErrorMessage(error), 'Operation Failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name
    });
    setShowForm(true);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This may affect books in this category.`)) {
      try {
        await apiService.deleteCategory(category.id);
        showSuccess('Category deleted successfully!', 'Success');
        loadCategories();
      } catch (error) {
        showError(getErrorMessage(error), 'Delete Failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: ''
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="category-management">
      <div className="management-header">
        <h2>Category Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add New Category
        </button>
      </div>



      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-modal">
          <div className="modal-overlay" onClick={resetForm}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="close-btn" onClick={resetForm}>Close</button>
            </div>
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                  maxLength="50"
                />
                <small className="form-help">
                  Enter a unique name for this category (max 50 characters)
                </small>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="categories-table-container">
        {categories.length === 0 ? (
          <div className="empty-state">
            <h3>No Categories Found</h3>
            <p>Start by adding your first book category!</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add First Category
            </button>
          </div>
        ) : (
          <table className="table categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="category-cell">
                      <strong>{category.name}</strong>
                    </div>
                  </td>
                  <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                  <td>
                    {category.updatedAt !== category.createdAt 
                      ? new Date(category.updatedAt).toLocaleDateString()
                      : '-'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(category)}
                        title="Edit category"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(category)}
                        title="Delete category"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {categories.length > 0 && (
        <div className="table-footer">
          <p>Total: {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}</p>
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

export default CategoryManagement;