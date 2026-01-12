import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authLogin(login, password);

    if (result.success) {
      navigate('/products');
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <Link to="/" className="btn-close">×</Link>
        <h1>Welcome Back</h1>
        <p>Sign in to continue shopping</p>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="login">Email or Username</label>
          <input
            type="text"
            id="login"
            placeholder="Enter email or username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-login">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="login-footer">
          <p>New customer? <Link to="/signup">Create an account</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
