import { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to="/" className="navbar-brand">
          <div className="brand-square">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span>TaskFlow</span>
        </Link>
        
        <div className="nav-pills">
          <NavLink to="/" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`} end>
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}>
            Projects
          </NavLink>
        </div>
      </div>

      <div className="navbar-right">
        <NotificationBell />
        
        <div className="user-profile">
          <div className="avatar-circle">
            {getInitials(user.name)}
          </div>
          <span className="user-name-label">{user.name}</span>
          
          <button className="btn-logout-ghost" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
