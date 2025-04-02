import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorLogin, doctorSignup } from '../services/api';

function DoctorLogin() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    specialty: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = isSignup 
        ? await doctorSignup(formData) 
        : await doctorLogin(formData);
      if (!isSignup) {
        localStorage.setItem('token', data.token);
        navigate('/doctor/dashboard');
      } else {
        setIsSignup(false);
      }
    } catch (error) {
      console.error(error.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isSignup ? 'Doctor Signup' : 'Doctor Login'}</h2>
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
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <input
              type="text"
              placeholder="Specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            />
          </>
        )}
        <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Switch to Login' : 'Switch to Signup'}
      </button>
    </div>
  );
}

export default DoctorLogin;