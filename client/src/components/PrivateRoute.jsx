import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to={`/${role}/login`} />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== role) {
      return <Navigate to={`/${decoded.role}/login`} />;
    }
    return children;
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to={`/${role}/login`} />;
  }
};

export default PrivateRoute;