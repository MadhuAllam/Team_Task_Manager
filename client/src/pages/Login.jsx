import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginCall } from '../api/auth';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginCall(email, password);
      login(data.token, { _id: data._id, name: data.name, email: data.email, role: data.role });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError('Google Sign-In is currently in maintenance. Please use your email and password.');
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="auth-split-container page-enter">
      {/* Left Panel: Visuals */}
      <div className="auth-visual-panel">
        <div className="mesh-blob"></div>
        <div className="auth-content">
          <div className="auth-logo-large">
            <div className="auth-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>TaskFlow</span>
          </div>
          
          <h1>The ultimate space for team collaboration.</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.7)', marginTop: '16px' }}>
            Streamline your workflow, track progress, and hit your goals faster with TaskFlow.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <div className="feature-text">
                <h4>Lightning Fast</h4>
                <p>Real-time updates and seamless performance for your entire team.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <div className="feature-text">
                <h4>Secure & Private</h4>
                <p>Enterprise-grade security to keep your project data safe and sound.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <div className="feature-text">
                <h4>Insightful Analytics</h4>
                <p>Track team productivity with beautiful, built-in dashboards.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your workspace to continue</p>

          {error && <div className="badge badge-danger" style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-with-icon">
              <label htmlFor="email">Email Address</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
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

            <div className="form-group-with-icon">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input
                  id="password"
                  className="input-field input-field-icon"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="auth-links">
              <Link to="/forgot-password" size="sm" className="forgot-link">Forgot password?</Link>
            </div>

            <button type="submit" className="btn-primary-gradient" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-divider">or continue with</div>

            <button type="button" className="btn-social" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>

            <p className="auth-footer-text">
              Don't have an account? <Link to="/signup">Create one →</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
