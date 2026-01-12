import { createContext, useState, useContext, useRef, useCallback } from 'react';
import apiClient from '../api/client';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const fetchingRef = useRef(false);
    const toastTimeoutRef = useRef(null);

    const fetchCartCount = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setCartCount(0);
            return;
        }

        // Prevent multiple simultaneous fetches
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            const response = await apiClient.get('/cart/');
            const uniqueItems = response.data.items?.length || 0;
            setCartCount(uniqueItems);
        } catch (err) {
            // Silently fail - don't log errors for cart count
            setCartCount(0);
        } finally {
            fetchingRef.current = false;
        }
    }, []);

    const updateCartCount = useCallback((count) => {
        setCartCount(count);
    }, []);

    const showToast = useCallback((message, type = 'success') => {
        // Clear any existing timeout
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast({ show: true, message, type });

        toastTimeoutRef.current = setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 3000);
    }, []);

    const hideToast = useCallback(() => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setToast({ show: false, message: '', type: 'success' });
    }, []);

    return (
        <CartContext.Provider
            value={{
                cartCount,
                updateCartCount,
                fetchCartCount,
                toast,
                showToast,
                hideToast,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
