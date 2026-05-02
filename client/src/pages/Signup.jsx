import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupCall } from '../api/auth';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0); // 0 to 4
  const navigate = useNavigate();

  useEffect(() => {
    // Basic password strength logic
    let s = 0;
    if (password.length > 5) s++;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) s++;
    setStrength(s);
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signupCall({ name, email, password, role });
      navigate('/login');
    } catch (err) {
      const errs = err.response?.data?.errors;
      if (errs && errs.length > 0) {
        setError(errs.map((e) => e.msg).join(', '));
      } else {
        setError(err.response?.data?.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthClass = () => {
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  };

  return (
    <div className="auth-split-container page-enter">
      {/* Left Panel: Visuals */}
      <div className="auth-visual-panel" style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)' }}>
        <div className="mesh-blob" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)' }}></div>
        <div className="auth-content">
          <div className="auth-logo-large">
            <div className="auth-logo-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>TaskFlow</span>
          </div>
          
          <h1>Join 10,000+ teams building the future.</h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginTop: '16px' }}>
            Experience the next generation of project management. Built for speed, designed for clarity.
          </p>

          <div className="feature-list" style={{ marginTop: '64px' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>1</div>
                   <span style={{ fontWeight: 600 }}>Create your workspace in seconds</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>2</div>
                   <span style={{ fontWeight: 600 }}>Invite your team members</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>3</div>
                   <span style={{ fontWeight: 600 }}>Track progress with real-time data</span>
                </div>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '64px' }}>
            <div className="avatar-stack">
              <div className="stack-avatar" style={{ backgroundColor: '#ec4899' }}>JD</div>
              <div className="stack-avatar" style={{ backgroundColor: '#6366f1' }}>AS</div>
              <div className="stack-avatar" style={{ backgroundColor: '#10b981' }}>MK</div>
              <div className="stack-avatar" style={{ backgroundColor: '#f59e0b' }}>+8</div>
            </div>
            <span className="social-proof-text" style={{ marginTop: '0', marginLeft: '12px' }}>Joined by the world's best engineering teams.</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1>Create your account</h1>
          <p className="auth-subtitle">Get started with your 14-day free trial</p>

          {error && <div className="badge badge-danger" style={{ width: '100%', padding: '12px', marginBottom: '24px', borderRadius: '8px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
               <div className="form-group-with-icon" style={{ marginBottom: 0 }}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    className="input-field"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
               </div>
               <div className="form-group-with-icon" style={{ marginBottom: 0 }}>
                  <label>Role</label>
                  <div className="role-pill-selector">
                    <div 
                      className={`role-pill member ${role === 'member' ? 'active' : ''}`}
                      onClick={() => setRole('member')}
                    >
                      <span className="pill-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </span>
                      <span className="pill-label">Member</span>
                    </div>
                    <div 
                      className={`role-pill admin ${role === 'admin' ? 'active' : ''}`}
                      onClick={() => setRole('admin')}
                    >
                      <span className="pill-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </span>
                      <span className="pill-label">Admin</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="form-group-with-icon">
              <label htmlFor="email">Work Email</label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input
                  id="email"
                  className="input-field input-field-icon"
                  type="email"
                  placeholder="Enter your work email"
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
                  type="password"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="strength-meter">
                <div className={`strength-segment ${strength >= 1 ? `active ${getStrengthClass()}` : ''}`}></div>
                <div className={`strength-segment ${strength >= 2 ? `active ${getStrengthClass()}` : ''}`}></div>
                <div className={`strength-segment ${strength >= 3 ? `active ${getStrengthClass()}` : ''}`}></div>
                <div className={`strength-segment ${strength >= 4 ? `active ${getStrengthClass()}` : ''}`}></div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '8px' }}>
                Use 8+ characters with a mix of letters and numbers.
              </p>
            </div>

            <button type="submit" className="btn-primary-gradient" style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #6366f1)' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Workspace →'}
            </button>

            <p className="auth-footer-text">
              Already have an account? <Link to="/login">Sign in</Link>
            </p>

            <div className="auth-divider">or continue with</div>

            <button type="button" className="btn-social" onClick={() => {
               setError('Google Sign-In is currently in maintenance. Please use the form above.');
               setTimeout(() => setError(''), 5000);
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
