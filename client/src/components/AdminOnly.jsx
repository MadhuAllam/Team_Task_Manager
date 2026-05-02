import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AdminOnly = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user && user.role === 'admin') {
    return children;
  }
  return null;
};

export default AdminOnly;
