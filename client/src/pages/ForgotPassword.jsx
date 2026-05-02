import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container page-enter" style={{ justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div className="auth-form-panel" style={{ flex: 'none', width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', height: 'fit-content', marginTop: '10vh' }}>
        <div className="auth-form-container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="auth-logo-icon" style={{ margin: '0 auto 24px', width: '64px', height: '64px', fontSize: '32px' }}>🔐</div>
            <h1>Forgot Password</h1>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>
          </div>

          {message && <div className="badge badge-success" style={{ width: '100%', padding: '16px', marginBottom: '24px', borderRadius: '12px' }}>{message}</div>}
          {error && <div className="badge badge-danger" style={{ width: '100%', padding: '16px', marginBottom: '24px', borderRadius: '12px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-with-icon">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input
                  id="email"
                  className="input-field input-field-icon"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-gradient" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <p className="auth-footer-text">
              Remembered your password? <Link to="/login">Sign in →</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
