import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import './Cart.css';

const Cart = () => {
  // ... (state) ...
  // (Wait, I need to match the import part and the return part separately or use multi_replace?
  // Integrating Navbar requires modifying imports AND result.
  // I'll use separate replace calls or multi_replace.
  // I'll use multi_replace for pages.
  // I'll skip this tool call and use multi_replace in next turn for pages.
  // Or I can do it now.
  // Let's do it now properly.)

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { fetchCartCount, showToast } = useCart();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get('/cart/');
      setCart(response.data);
    } catch (err) {
      setError('Failed to load cart');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      return;
    }

    try {
      await apiClient.patch(`/cart/items/${itemId}/`, {
        quantity: newQuantity,
      });
      await fetchCart();
      fetchCartCount();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiClient.delete(`/cart/items/${itemId}/`);
      await fetchCart();
      fetchCartCount();
      showToast('Item removed from cart', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to remove item', 'error');
    }
  };

  const handleCheckout = async () => {
    try {
      await apiClient.post('/orders/checkout/');
      fetchCartCount();
      showToast('Order placed successfully!', 'success');
      navigate('/orders');
    } catch (err) {
      showToast(err.response?.data?.error || 'Checkout failed', 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="cart-container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2>Your cart is empty</h2>
            <p className="empty-cart-text">Looks like you haven't added anything to your cart yet.</p>
            <button onClick={() => navigate('/products')} className="btn-shop-now">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Start Shopping
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button onClick={() => navigate('/products')} className="btn-secondary">
            Continue Shopping
          </button>
        </div>

        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h3>{item.product.name}</h3>
                <p className="item-price">${item.product.price} each</p>
              </div>
              <div className="item-controls">
                <div className="quantity-controls">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="btn-quantity"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="btn-quantity"
                  >
                    +
                  </button>
                </div>
                <div className="item-total">
                  ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                </div>
                <button onClick={() => removeItem(item.id)} className="btn-remove">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="total">
            <h2>Total: ${typeof cart.total === 'number' ? cart.total.toFixed(2) : cart.total}</h2>
          </div>
          <button onClick={handleCheckout} className="btn-checkout">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default Cart;
