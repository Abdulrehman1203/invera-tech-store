import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import './AdminProducts.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        is_active: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { user } = useAuth();
    const { showToast } = useCart();
    const navigate = useNavigate();

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/products/');
            setProducts(response.data);
        } catch (err) {
            setError('Failed to load products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!user?.is_admin) {
            navigate('/products');
            return;
        }
        fetchProducts();
    }, [user, navigate, fetchProducts]);

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            stock_quantity: '',
            is_active: true,
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock_quantity: product.stock_quantity,
            is_active: product.is_active,
        });
        setImagePreview(product.image_url);
        setShowForm(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock_quantity', formData.stock_quantity);
            data.append('is_active', formData.is_active);

            if (imageFile) {
                data.append('image', imageFile);
            }

            if (editingProduct) {
                await apiClient.patch(`/admin/products/${editingProduct.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Product updated successfully', 'success');
            } else {
                await apiClient.post('/admin/products/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Product created successfully', 'success');
            }

            resetForm();
            fetchProducts();
        } catch (err) {
            showToast(err.response?.data?.detail || 'Failed to save product', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await apiClient.delete(`/admin/products/${productId}/`);
            showToast('Product deleted successfully', 'success');
            fetchProducts();
        } catch (err) {
            showToast('Failed to delete product', 'error');
        }
    };

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <>
            <Navbar />
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Admin Panel</h1>
                    <div className="admin-actions">
                        <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Product
                        </button>
                        <button onClick={() => navigate('/admin/orders')} className="admin-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            Orders
                        </button>
                        {user?.is_superuser && (
                            <button onClick={() => navigate('/admin/users')} className="admin-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                Users
                            </button>
                        )}
                        <button onClick={() => navigate('/products')} className="admin-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View Store
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="modal-overlay" onClick={() => resetForm()}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                                <button className="modal-close" onClick={resetForm}>×</button>
                            </div>
                            <form onSubmit={handleSubmit} className="product-form">
                                <div className="form-group">
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="Enter product name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        required
                                        placeholder="Enter product description"
                                        rows={3}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Stock Quantity</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.stock_quantity}
                                            onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                                            required
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Product Image</label>
                                    <div className="image-upload">
                                        {imagePreview && (
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            id="image-input"
                                        />
                                        <label htmlFor="image-input" className="upload-label">
                                            {imagePreview ? 'Change Image' : 'Choose Image'}
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        Active (visible in store)
                                    </label>
                                </div>

                                <div className="form-actions">
                                    <button type="button" onClick={resetForm} className="btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting} className="btn-primary">
                                        {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="product-thumb" />
                                        ) : (
                                            <div className="no-image">No Image</div>
                                        )}
                                    </td>
                                    <td>{product.name}</td>
                                    <td>${product.price}</td>
                                    <td>{product.stock_quantity}</td>
                                    <td>
                                        <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(product)} className="btn-edit">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(product.id)} className="btn-delete">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Closing Navbar wrapper */}
        </>
    );
};

export default AdminProducts;
