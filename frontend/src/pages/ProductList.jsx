import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import apiClient from '../api/client';
import Navbar from '../components/Navbar';
import './ProductList.css';

// Category mapping for filtering - using precise, non-overlapping keywords
const CATEGORY_KEYWORDS = {
  'mobile-accessories': ['phone case', 'phone charger', 'phone stand', 'phone holder', 'screen protector', 'power bank', 'phone cable', 'phone mount', 'phone grip', 'mobile charger', 'mobile case', 'tablet stand', 'tablet', 'ipad', 'wireless charging', 'charging pad'],
  'laptop-accessories': ['laptop stand', 'laptop bag', 'laptop sleeve', 'laptop cooling', 'usb hub', 'usb-c hub', 'docking station', 'laptop charger', 'monitor stand', 'desk organizer', 'keyboard', 'webcam', 'mouse pad', 'gaming mouse', 'cable management', 'gaming chair', 'ergonomic chair', 'desk lamp', 'external ssd', 'ssd', 'external drive', 'multiport'],
  'audio-devices': ['headphone', 'earphone', 'speaker', 'earbuds', 'headset', 'soundbar', 'airpods', 'audio'],
  'smart-wearables': ['smartwatch', 'smart watch', 'fitness band', 'fitness tracker', 'smart band', 'apple watch', 'galaxy watch'],
};

const CATEGORY_LABELS = {
  'mobile-accessories': 'Mobile Accessories',
  'laptop-accessories': 'Laptop Accessories',
  'audio-devices': 'Audio Devices',
  'smart-wearables': 'Smart Wearables',
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();
  const { cartCount, showToast, fetchCartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasFetchedCart = useRef(false);

  const category = searchParams.get('category');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Only fetch cart count once when user is available
    if (user && !hasFetchedCart.current) {
      hasFetchedCart.current = true;
      fetchCartCount();
    }
    // Reset when user logs out
    if (!user) {
      hasFetchedCart.current = false;
    }
  }, [user, fetchCartCount]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products/');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on category
  const filteredProducts = useMemo(() => {
    if (!category || !CATEGORY_KEYWORDS[category]) {
      return products;
    }
    const keywords = CATEGORY_KEYWORDS[category];
    return products.filter((product) => {
      const searchText = `${product.name} ${product.description}`.toLowerCase();
      return keywords.some((keyword) => searchText.includes(keyword.toLowerCase()));
    });
  }, [products, category]);

  const addToCart = async (productId, productName) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await apiClient.post('/cart/items/', {
        product_id: productId,
        quantity: 1,
      });
      fetchCartCount();
      showToast(`${productName} added to cart!`, 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add to cart', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const pageTitle = category && CATEGORY_LABELS[category] ? CATEGORY_LABELS[category] : 'All Products';

  return (
    <>
      <Navbar />
      <div className="product-list-container">
        <div className="header">
          <h1>{pageTitle}</h1>
          {category && filteredProducts.length === 0 && (
            <p className="no-products-message">No products found in this category.</p>
          )}
        </div>

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              {product.image_url ? (
                <div className="product-image">
                  <img src={product.image_url} alt={product.name} />
                  {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                    <span className="stock-badge low">Only {product.stock_quantity} left</span>
                  )}
                </div>
              ) : (
                <div className="product-image placeholder">
                  <span>No Image</span>
                </div>
              )}

              <div className="product-info">
                <div className="product-header-row">
                  <h3>{product.name}</h3>
                  <span className="price">${product.price}</span>
                </div>
                <p className="product-description">{product.description}</p>

                <div className="product-actions">
                  <button
                    onClick={() => addToCart(product.id, product.name)}
                    disabled={product.stock_quantity === 0 || !product.is_active}
                    className="btn-add-to-cart-icon"
                    title="Add to Cart"
                  >
                    {product.stock_quantity === 0 ? (
                      <span style={{ fontSize: '0.8rem' }}>Out of Stock</span>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                          <line x1="3" y1="6" x2="21" y2="6"></line>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProductList;
