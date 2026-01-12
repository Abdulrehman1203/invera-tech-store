import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import './AdminOrders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiClient.get('/admin/orders/');
            setOrders(response.data);
        } catch (err) {
            if (err.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else {
                setError('Failed to load orders');
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
        fetchOrders();
    }, [fetchOrders, user, navigate]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await apiClient.patch(`/admin/orders/${orderId}/`, { status: newStatus });
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error('Failed to update order status:', err);
            setError('Failed to update order status');
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING': return 'pending';
            case 'PAID': return 'paid';
            case 'SHIPPED': return 'shipped';
            case 'CANCELLED': return 'cancelled';
            default: return 'pending';
        }
    };

    if (loading) {
        return <div className="loading">Loading orders...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="admin-orders-container">
                <div className="admin-orders-header">
                    <h1>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }}>
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        Order Management
                    </h1>
                    <div className="admin-actions">
                        <button onClick={() => navigate('/admin/products')} className="btn-secondary">
                            Manage Products
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <h2>No orders yet</h2>
                        <p>When customers place orders, they will appear here.</p>
                    </div>
                ) : (
                    <div className="orders-table-container">
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="order-id">#{order.id.slice(0, 8)}</td>
                                        <td className="customer-info">
                                            <span className="customer-name">{order.user.username}</span>
                                            <span className="customer-email">{order.user.email}</span>
                                        </td>
                                        <td className="order-items">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="item-row">
                                                    {item.quantity}x {item.product.name}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="order-total">${order.total_amount}</td>
                                        <td className="order-date">
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PAID">Paid</option>
                                                <option value="SHIPPED">Shipped</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="orders-summary">
                    <div className="summary-card">
                        <span className="summary-label">Total Orders</span>
                        <span className="summary-value">{orders.length}</span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Pending</span>
                        <span className="summary-value pending">
                            {orders.filter(o => o.status === 'PENDING').length}
                        </span>
                    </div>
                    <div className="summary-card">
                        <span className="summary-label">Shipped</span>
                        <span className="summary-value shipped">
                            {orders.filter(o => o.status === 'SHIPPED').length}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminOrders;
