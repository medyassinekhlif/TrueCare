import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorLogin, doctorSignup } from '../services/api';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import slide1 from './../assets/6.png';
import slide2 from './../assets/6.png';
import slide3 from './../assets/6.png';

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
    <div className="min-h-screen flex">
      {/* Left: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-center text-gray-500">
            {isSignup
              ? 'Sign up to manage your patients efficiently.'
              : "You're just a step away from managing patients faster."}
          </p>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-3">
            <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-100 transition text-sm font-medium w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.04.69-2.36 1.05-3.71 1.05-2.88 0-5.32-1.94-6.19-4.55H1.39v2.84C3.29 20.47 7.35 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.81 13.76c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V6.69H1.39C.5 8.31 0 10.11 0 12s.5 3.69 1.39 5.31l4.42-3.55z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.95c1.62 0 3.07.56 4.21 1.66l3.17-3.17C17.46 1.78 14.97.95 12 .95 7.35.95 3.29 3.48 1.39 6.69l4.42 3.55c.87-2.61 3.31-4.29 6.19-4.29z"
                />
              </svg>
              Sign in with Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 px-4 hover:bg-gray-100 transition text-sm font-medium w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#0078D4"
                  d="M0 0v11.2h11.2V0H0zm12.8 0v11.2H24V0H12.8zM0 12.8V24h11.2V12.8H0zm12.8 0V24H24V12.8H12.8z"
                />
              </svg>
              Sign in with Microsoft
            </button>
          </div>

          <div className="relative text-center my-4">
            <span className="absolute inset-x-0 top-1/2 border-t border-gray-300 transform -translate-y-1/2"></span>
            <span className="bg-white px-4 text-gray-500 text-sm relative z-10">or</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {isSignup && (
              <>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <input
                  type="text"
                  placeholder="Specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </>
            )}
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold transition"
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-emerald-600 font-medium hover:underline"
            >
              {isSignup ? 'Login here' : 'Sign up here'}
            </button>
          </p>
        </div>
      </div>

      {/* Right: Swiper Image Slider */}
      <div className="hidden lg:flex w-1/2 bg-emerald-600 text-white items-center justify-center px-8">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="w-full h-full"
        >
          <SwiperSlide className="flex flex-col items-center justify-center text-center px-6">
            <img src={slide1} alt="Slide 1" className="w-3/4 mb-4 rounded-lg" />
            <h2 className="text-2xl font-bold">Streamline Your Workflow</h2>
            <p className="text-sm">AI-powered claim management made simple and fast.</p>
          </SwiperSlide>

          <SwiperSlide className="flex flex-col items-center justify-center text-center px-6">
            <img src={slide2} alt="Slide 2" className="w-3/4 mb-4 rounded-lg" />
            <h2 className="text-2xl font-bold">Faster Decision Making</h2>
            <p className="text-sm">Get real-time insights and make informed choices.</p>
          </SwiperSlide>

          <SwiperSlide className="flex flex-col items-center justify-center text-center px-6">
            <img src={slide3} alt="Slide 3" className="w-3/4 mb-4 rounded-lg" />
            <h2 className="text-2xl font-bold">Collaborate Smarter</h2>
            <p className="text-sm">Connect with clients and team efficiently and securely.</p>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

export default DoctorLogin;