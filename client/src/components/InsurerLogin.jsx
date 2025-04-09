import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insurerLogin, insurerSignup } from '../services/api';
import jumbotron from "../assets/6.png";

function InsurerLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = isSignup 
        ? await insurerSignup(formData) 
        : await insurerLogin(formData);
      if (!isSignup) {
        localStorage.setItem('token', data.token);
        navigate('/insurer/dashboard');
      } else {
        setIsSignup(false);
      }
    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-25 to-teal-50 p-2">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center justify-center gap-4">
        <div className="w-full lg:w-1/2 flex-shrink-0">
          <img
            className="pointer-events-none select-none w-full object-cover rounded-lg"
            src={jumbotron}
            alt="Insurer Sign-In Illustration"
          />
        </div>
        <div className="w-full max-w-md rounded-2xl p-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-700"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-700"
              />
            </div>
            {isSignup && (
              <div>
                <input
                  type="text"
                  placeholder="Company Name"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-700"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300"
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>
          <div className="mt-3 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
            >
              {isSignup ? 'Switch to Login' : 'Switch to Signup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsurerLogin;