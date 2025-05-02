import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLogout } from "react-icons/ai";
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo.png';

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/');
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getHomePath = () => '/';

  const getRoleName = (role) => {
    if (role === 'insurer') return 'Insurer';
    if (role === 'doctor') return 'Doctor';
    if (role === 'client') return 'Client';
    return 'User';
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavigate(getHomePath())}
              className="flex items-center"
              aria-label="Go to homepage"
            >
              <img src={logo} alt="TrueCare AI Logo" className="h-12" />
              <span className="text-black text-slate-100 text-3xl font-bold tracking-tight ml-2 transition-colors">
                TrueCare
              </span>
            </button>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-slate-100 text-sm font-medium">
                  Welcome, {getRoleName(user.role)}
                </span>

                {user.role === 'doctor' && (
                  <button
                    onClick={() => handleNavigate('/add-bulletin')}
                    className="text-white bg-indigo-800 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    aria-label="Create Bulletin"
                  >
                    Create Bulletin
                  </button>
                )}

                <button
                  onClick={() => handleNavigate('/')}
                  className="text-white bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Go to dashboard"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Log out"
                >
                  <AiOutlineLogout />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/insurer/auth')}
                  className="text-white bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Insurer Auth"
                >
                  Insurer Auth
                </button>
                <button
                  onClick={() => handleNavigate('/doctor/auth')}
                  className="text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Doctor Auth"
                >
                  Doctor Auth
                </button>
                <button
                  onClick={() => handleNavigate('/client/auth')}
                  className="text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Client Auth"
                >
                  Client Auth
                </button>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-yellow-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-200 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <div className="text-black text-sm font-medium px-3 py-2">
                Welcome, {user.fullName || user.companyName || 'User'} ({getRoleName(user.role)})
              </div>

              {user.role === 'doctor' && (
                <button
                  onClick={() => handleNavigate('/add-bulletin')}
                  className="w-full text-white bg-indigo-700 hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  aria-label="Create Bulletin"
                >
                  Create Bulletin
                </button>
              )}

              <button
                onClick={() => handleNavigate('/')}
                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Go to dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 text-white bg-indigo-600 hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Log out"
              >
                <AiOutlineLogout />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate('/insurer/auth')}
                className="w-full text-white bg-indigo-700 hover:bg-indigo-800 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Insurer Auth"
              >
                Insurer Auth
              </button>
              <button
                onClick={() => handleNavigate('/doctor/auth')}
                className="w-full text-white bg-indigo-600 hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Doctor Auth"
              >
                Doctor Auth
              </button>
              <button
                onClick={() => handleNavigate('/client/auth')}
                className="w-full text-white bg-indigo-500 hover:bg-indigo-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Client Auth"
              >
                Client Auth
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;