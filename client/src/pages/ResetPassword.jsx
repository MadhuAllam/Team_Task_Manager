import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-container page-enter" style={{ justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div className="auth-form-panel" style={{ flex: 'none', width: '100%', maxWidth: '480px', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', height: 'fit-content', marginTop: '10vh' }}>
        <div className="auth-form-container">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="auth-logo-icon" style={{ margin: '0 auto 24px', width: '64px', height: '64px', fontSize: '32px' }}>🔒</div>
            <h1>Set New Password</h1>
            <p className="auth-subtitle">Create a secure password for your account</p>
          </div>

          {message && <div className="badge badge-success" style={{ width: '100%', padding: '16px', marginBottom: '24px', borderRadius: '12px' }}>{message}. Redirecting...</div>}
          {error && <div className="badge badge-danger" style={{ width: '100%', padding: '16px', marginBottom: '24px', borderRadius: '12px' }}>{error}</div>}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group-with-icon">
                <label htmlFor="password">New Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </span>
                  <input
                    id="password"
                    className="input-field input-field-icon"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="form-group-with-icon">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  </span>
                  <input
                    id="confirmPassword"
                    className="input-field input-field-icon"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary-gradient" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="auth-footer-text">
            Back to <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
