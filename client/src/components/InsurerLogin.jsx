import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insurerLogin, insurerSignup } from '../services/api';

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
    <div className="login-container">
      <h2>{isSignup ? 'Insurer Signup' : 'Insurer Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {isSignup && (
          <input
            type="text"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />
        )}
        <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Switch to Login' : 'Switch to Signup'}
      </button>
    </div>
  );
}

export default InsurerLogin;