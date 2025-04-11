import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";

function Navbar() {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Function to decode JWT token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1B4965] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleNavigate("/")}
              className="flex items-center"
              aria-label="Go to homepage"
            >
              <img src={logo} alt="TrueCare AI Logo" className="h-12 w-12" />
              <span className="text-white text-2xl font-bold tracking-tight ml-2 hover:text-[#00d382] transition-colors">
                TrueCare AI
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white text-sm font-medium">
                  Welcome, {user.role === "insurer" ? "Insurer" : "Doctor"}
                </span>
                <button
                  onClick={() =>
                    handleNavigate(
                      user.role === "insurer"
                        ? "/insurer/dashboard"
                        : "/doctor/dashboard"
                    )
                  }
                  className="text-white bg-[#2A5A7A] hover:bg-[#3B6B8A] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Go to dashboard"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-white bg-[#1A3C54] hover:bg-[#2B4D65] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Log out"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate("/insurer/login")}
                  className="text-white bg-[#2A5A7A] hover:bg-[#3B6B8A] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Insurer login"
                >
                  Insurer Login
                </button>
                <button
                  onClick={() => handleNavigate("/doctor/login")}
                  className="text-white bg-[#1A3C54] hover:bg-[#2B4D65] px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  aria-label="Doctor login"
                >
                  Doctor Login
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex thickeningitems-center">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-[#00d382] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d382]"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#1B4965] px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {user ? (
            <>
              <div className="text-white text-sm font-medium px-3 py-2">
                Welcome, {user.fullName || user.companyName || "User"} (
                {user.role === "insurer" ? "Insurer" : "Doctor"})
              </div>
              <button
                onClick={() =>
                  handleNavigate(
                    user.role === "insurer"
                      ? "/insurer/dashboard"
                      : "/doctor/dashboard"
                  )
                }
                className="w-full text-white bg-[#2A5A7A] hover:bg-[#3B6B8A] block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Go to dashboard"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-white bg-[#1A3C54] hover:bg-[#2B4D65] block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Log out"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate("/insurer/login")}
                className="w-full text-white bg-[#2A5A7A] hover:bg-[#3B6B8A] block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Insurer login"
              >
                Insurer Login
              </button>
              <button
                onClick={() => handleNavigate("/doctor/login")}
                className="w-full text-white bg-[#1A3C54] hover:bg-[#2B4D65] block px-3 py-2 rounded-md text-base font-medium transition-colors"
                aria-label="Doctor login"
              >
                Doctor Login
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
