import { useCart } from '../context/CartContext';
import './Toast.css';

const Toast = () => {
    const { toast, hideToast } = useCart();

    if (!toast.show) return null;

    return (
        <div className="toast-container">
            <div className={`toast ${toast.type}`}>
                <span className="toast-icon">
                    {toast.type === 'success' ? '✓' : '✕'}
                </span>
                <span className="toast-message">{toast.message}</span>
                <button className="toast-close" onClick={hideToast}>
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;
