import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Function to decode JWT token (simplified version)
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedUser = decodeToken(token);
      setUser(decodedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-emerald-900 p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <span className="text-white text-xl font-bold">HealthClaims</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              {/* Role-specific dashboard link */}
              <span className="text-white text-sm">
                Welcome, {user.fullName || user.companyName || 'User'} 
                ({user.role === 'insurer' ? 'Insurer' : 'Doctor'})
              </span>
              <a
                href={user.role === 'insurer' ? '/insurer/dashboard' : '/doctor/dashboard'}
                className="text-white hover:text-emerald-200 transition-colors"
              >
                Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="text-white hover:text-emerald-200 transition-colors bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/insurer/login"
                className="text-white transition-colors bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-lg"
              >
                Insurer Login
              </a>
              <a
                href="/doctor/login"
                className="text-white transition-colors bg-emerald-600 hover:bg-emerald-800 px-4 py-2 rounded-lg"
              >
                Doctor Login
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
