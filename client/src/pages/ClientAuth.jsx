import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginClient } from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import slide1 from '../assets/2.png';
import slide2 from '../assets/3.png';
import slide3 from '../assets/6.png';
import logo from '../assets/logo.png';
import { IoArrowBack } from 'react-icons/io5';
import { Toaster, toast } from 'sonner';

function ClientAuth() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginClient(formData);
      localStorage.setItem('token', data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
     <div className="flex relative">
           <Toaster richColors position="top-right" />
           <a
             href="/"
             className="absolute mt-12 ml-12 flex items-center text-md tracking-tight text-blue-600 hover:text-blue-800 transition duration-200"
           >
             <IoArrowBack className="w-6 h-6 mr-2" />
             Back to Main
           </a>
           <div className="w-full lg:w-1/2 flex items-start justify-center bg-white min-h-screen">
             <div className="w-full max-w-lg space-y-4 overflow-y-auto overflow-x-hidden my-28">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Company logo" className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-center text-gray-900">Sign In</h1>
          <p className="text-center text-sm text-gray-600">
            Hi <span className="text-indigo-500 font-bold">Client</span>! You&apos;re just a step away from accessing your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 p-1">
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-800 text-white py-1.5 rounded-lg font-semibold transition duration-200"
            >
              Login
            </button>
          </form>
          <p className="text-center text-xs text-gray-600">
            Contact your insurer to set up your account.
          </p>
        </div>
      </div>
      <div className="hidden lg:flex w-1/2 bg-gray-100">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          className="h-full min-h-[200px]"
        >
          <SwiperSlide className="flex flex-col justify-center items-center text-center p-6">
            <img src={slide1} alt="Slide 1" className="max-w-[600px] h-auto rounded-lg mb-4" />
            <h2 className="text-lg text-gray-800 mb-2">Access Your Account</h2>
            <p className="text-sm text-gray-600">View your insurance details securely.</p>
          </SwiperSlide>
          <SwiperSlide className="flex flex-col justify-center items-center text-center p-6">
            <img src={slide2} alt="Slide 2" className="max-w-[600px] h-auto rounded-lg mb-4" />
            <h2 className="text-lg text-gray-800 mb-2">Stay Informed</h2>
            <p className="text-sm text-gray-600">Get updates on your claims and coverage.</p>
          </SwiperSlide>
          <SwiperSlide className="flex flex-col justify-center items-center text-center p-6">
            <img src={slide3} alt="Slide 3" className="max-w-[600px] h-auto rounded-lg mb-4" />
            <h2 className="text-lg text-gray-800 mb-2">Secure and Easy</h2>
            <p className="text-sm text-gray-600">Manage your account with ease and confidence.</p>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  );
}

export default ClientAuth;