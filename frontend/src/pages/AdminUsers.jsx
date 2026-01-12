import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [accessDenied, setAccessDenied] = useState(false);
    const [updating, setUpdating] = useState(null);

    const { user } = useAuth();
    const { showToast } = useCart();
    const navigate = useNavigate();

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users/');
            setUsers(response.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setAccessDenied(true);
            } else {
                setError('Failed to load users');
            }
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
        fetchUsers();
    }, [user, navigate, fetchUsers]);

    const updateUserRole = async (userId, field, value) => {
        setUpdating(userId);
        try {
            await apiClient.patch(`/admin/users/${userId}/`, {
                [field]: value
            });

            setUsers(users.map(u =>
                u.id === userId ? { ...u, [field]: value } : u
            ));

            showToast(`User role updated successfully`, 'success');
        } catch (err) {
            const errorMsg = err.response?.data?.detail ||
                err.response?.data?.non_field_errors?.[0] ||
                'Failed to update user role';
            showToast(errorMsg, 'error');
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    if (accessDenied) {
        return (
            <>
                <Navbar />
                <div className="access-denied-container">
                    <div className="access-denied">
                        <span className="access-denied-icon">🔒</span>
                        <h2>Access Denied</h2>
                        <p>Only administrators can access user management.</p>
                        <button onClick={() => navigate('/admin/products')} className="btn-secondary">
                            ← Back to Admin Panel
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <>
            <Navbar />
            <div className="admin-users-container">
                <div className="admin-users-header">
                    <h1>User Management</h1>
                    <button onClick={() => navigate('/admin/products')} className="btn-secondary">
                        ← Back to Products
                    </button>
                </div>

                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Joined</th>
                                <th>Staff</th>
                                <th>Admin</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className={u.id === user?.id ? 'current-user' : ''}>
                                    <td>
                                        <span className="username">{u.username}</span>
                                        {u.id === user?.id && <span className="you-badge">You</span>}
                                    </td>
                                    <td>{u.email}</td>
                                    <td>{formatDate(u.date_joined)}</td>
                                    <td>
                                        <button
                                            className={`toggle-btn ${u.is_staff ? 'active' : ''}`}
                                            onClick={() => updateUserRole(u.id, 'is_staff', !u.is_staff)}
                                            disabled={updating === u.id || u.id === user?.id}
                                        >
                                            {u.is_staff ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    Staff
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                    No
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className={`toggle-btn ${u.is_superuser ? 'active admin' : ''}`}
                                            onClick={() => updateUserRole(u.id, 'is_superuser', !u.is_superuser)}
                                            disabled={updating === u.id || u.id === user?.id}
                                        >
                                            {u.is_superuser ? (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    Admin
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                                    </svg>
                                                    No
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${u.is_active ? 'active' : 'inactive'}`}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="users-info">
                    <p>
                        <strong>Staff:</strong> Can access the admin panel and manage products.
                    </p>
                    <p>
                        <strong>Admin (Superuser):</strong> Has full access to all features including user management.
                    </p>
                </div>
            </div>
        </>
    );
};

export default AdminUsers;
