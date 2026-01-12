import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'pending';
      case 'PAID':
        return 'paid';
      case 'SHIPPED':
        return 'shipped';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="empty-orders">
          <h2>No orders yet</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <button onClick={() => navigate('/products')} className="btn-secondary">
            Continue Shopping
          </button>
        </div>

        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-info-left">
                  <span className="order-id">#{order.id.slice(0, 8)}</span>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <span className={`order-status ${getStatusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items-section">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="item-name">{item.product.name}</td>
                        <td className="item-quantity">{item.quantity}</td>
                        <td className="item-price">
                          ${(parseFloat(item.price_at_purchase) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-card-footer">
                <span className="order-total-label">Order Total</span>
                <span className="order-total">${order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Orders;
