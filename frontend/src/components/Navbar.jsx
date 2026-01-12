import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount, fetchCartCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Ensure cart count is updated when checking navbar
    useEffect(() => {
        if (user) {
            fetchCartCount();
        }
    }, [user, fetchCartCount]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setDropdownOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                {location.pathname !== '/' && (
                    <button onClick={() => navigate(-1)} className="nav-back-btn" aria-label="Go back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                )}
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <circle cx="15.5" cy="8.5" r="1.5"></circle>
                            <circle cx="8.5" cy="15.5" r="1.5"></circle>
                            <circle cx="15.5" cy="15.5" r="1.5"></circle>
                            <line x1="8.5" y1="10" x2="8.5" y2="14"></line>
                            <line x1="15.5" y1="10" x2="15.5" y2="14"></line>
                            <line x1="10" y1="8.5" x2="14" y2="8.5"></line>
                            <line x1="10" y1="15.5" x2="14" y2="15.5"></line>
                        </svg>
                    </span>
                    <span className="brand-bold">Invera</span>
                    <span className="brand-regular">Tech</span>
                </Link>
            </div>

            <div className="navbar-center">
                <Link to="/products" className="nav-link">All Products</Link>
                <Link to="/products?category=mobile-accessories" className="nav-link">Mobile Accessories</Link>
                <Link to="/products?category=laptop-accessories" className="nav-link">Laptop Accessories</Link>
                <Link to="/products?category=audio-devices" className="nav-link">Audio Devices</Link>
                <Link to="/products?category=smart-wearables" className="nav-link">Smart Wearables</Link>
            </div>

            <div className="navbar-actions">
                <div className="nav-cart-wrapper">
                    <Link to="/cart" className="nav-cart-btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <span>Cart</span>
                    </Link>
                    {cartCount > 0 && (
                        <span className="nav-cart-badge">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </div>

                {user ? (
                    <div className="profile-menu" ref={dropdownRef}>
                        <button
                            className="profile-trigger"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                            <div className="avatar-placeholder">
                                {user.username ? user.username[0].toUpperCase() : 'U'}
                            </div>
                            <span className="dropdown-icon">▼</span>
                        </button>

                        {dropdownOpen && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.username}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                                </div>

                                <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                    My Orders
                                </Link>

                                {user.is_admin && (
                                    <Link to="/admin/products" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                        </svg>
                                        Admin Panel
                                    </Link>
                                )}

                                <button onClick={handleLogout} className="dropdown-item logout">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="login-link">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
