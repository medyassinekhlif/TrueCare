import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorLogin, doctorSignup } from '../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import slide1 from '../assets/6.png';
import slide2 from '../assets/3.png';
import logo from '../assets/logo.png';
import { IoCheckmarkDone, IoArrowBack } from 'react-icons/io5';
import { Toaster, toast } from 'sonner';

function DoctorAuth() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    speciality: '',
    phoneNumber: '',
    npiNumber: '',
    nationalIdOrPassport: null,
    medicalLicense: null,
    proofOfPractice: null,
    taxIdOrBusinessRegistration: null,
    image: null,
  });
  const [dragging, setDragging] = useState({});
  const navigate = useNavigate();

  const handleFileChange = (e, name) => {
    const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }
    if (file && !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      toast.error('File must be JPEG, PNG, or PDF.');
      return;
    }
    setFormData({ ...formData, [name]: file });
  };

  const handleDragOver = (e, name) => {
    e.preventDefault();
    setDragging({ ...dragging, [name]: true });
  };

  const handleDragLeave = (e, name) => {
    e.preventDefault();
    setDragging({ ...dragging, [name]: false });
  };

  const handleDrop = (e, name) => {
    e.preventDefault();
    setDragging({ ...dragging, [name]: false });
    handleFileChange(e, name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        if (
          !formData.name ||
          !formData.speciality ||
          !formData.phoneNumber ||
          !formData.npiNumber ||
          !formData.nationalIdOrPassport ||
          !formData.medicalLicense ||
          !formData.proofOfPractice ||
          !formData.taxIdOrBusinessRegistration ||
          !formData.image
        ) {
          toast.error('All fields are required.');
          return;
        }
        const data = new FormData();
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('name', formData.name);
        data.append('speciality', formData.speciality);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('npiNumber', formData.npiNumber);
        data.append('nationalIdOrPassport', formData.nationalIdOrPassport);
        data.append('medicalLicense', formData.medicalLicense);
        data.append('proofOfPractice', formData.proofOfPractice);
        data.append('taxIdOrBusinessRegistration', formData.taxIdOrBusinessRegistration);
        data.append('image', formData.image);
  
        // Log FormData contents for debugging
        for (let [key, value] of data.entries()) {
          console.log(key, value);
        }
  
        await doctorSignup(data);
        toast.success('Account created successfully! Please log in.');
        setIsSignup(false);
        setFormData({
          email: '',
          password: '',
          name: '',
          speciality: '',
          phoneNumber: '',
          npiNumber: '',
          nationalIdOrPassport: null,
          medicalLicense: null,
          proofOfPractice: null,
          taxIdOrBusinessRegistration: null,
          image: null,
        });
      } else {
        const { data } = await doctorLogin({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        toast.success('Logged in successfully!');
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    }
  };

  const renderFileInput = (Args) => {
    const { name, label } = Args;
    return (
      <div
        className={`relative w-full px-4 py-2 border rounded-lg ${
          dragging[name] ? 'border-blue-500 bg-gray-50' : 'border-gray-300'
        } flex items-center`}
        onDragOver={(e) => handleDragOver(e, name)}
        onDragLeave={(e) => handleDragLeave(e, name)}
        onDrop={(e) => handleDrop(e, name)}
      >
        <input
          type="file"
          name={name}
          accept="image/jpeg,image/png,application/pdf"
          onChange={(e) => handleFileChange(e, name)}
          className="opacity-0 absolute w-full h-full cursor-pointer"
          required
        />
        <span className="text-gray-600 truncate">
          {formData[name] ? formData[name].name : `${label}`}
        </span>
        {formData[name] && <IoCheckmarkDone className="w-5 h-5 text-green-800 ml-auto" />}
      </div>
    );
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
          <h1 className="text-xl font-bold text-center text-gray-900">
            {isSignup ? 'Sign Up' : 'Sign In'}
          </h1>
          <p className="text-center text-sm text-gray-600">
            Hi <span className="text-indigo-500 font-bold">Doctor</span>! {isSignup ? 'Sign up to manage your patients efficiently.' : "You're just a step away from managing patients faster."}
          </p>
          <form onSubmit={handleSubmit} className="space-y-3 p-1" encType="multipart/form-data">
            <div className={`${isSignup ? 'grid sm:grid-cols-2 gap-3' : 'flex flex-col gap-3'}`}>
              {isSignup && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Speciality"
                    value={formData.speciality}
                    onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </>
              )}
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
              {isSignup && (
                <>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="NPI Number"
                    value={formData.npiNumber}
                    onChange={(e) => setFormData({ ...formData, npiNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {renderFileInput({ name: 'nationalIdOrPassport', label: 'National ID or Passport' })}
                  {renderFileInput({ name: 'medicalLicense', label: 'Medical License' })}
                  {renderFileInput({ name: 'proofOfPractice', label: 'Proof of Practice' })}
                  {renderFileInput({ name: 'taxIdOrBusinessRegistration', label: 'Tax ID or Business Registration' })}
                </>
              )}
            </div>
            {isSignup && (
              <div className="col-span-2">
                {renderFileInput({ name: 'image', label: 'Profile Image' })}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-800 text-white py-1.5 rounded-lg font-semibold transition duration-200"
            >
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 font-medium hover:underline"
            >
              {isSignup ? 'Login here' : 'Sign up here'}
            </button>
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
      <img
        src={slide1}
        alt="Slide 1"
        className="max-w-[600px] h-auto rounded-lg mb-4"
      />
      <h2 className="text-lg text-gray-800 mb-2">We trust you</h2>
      <p className="text-sm text-gray-600">
        Many trust you in what you are doing. We believe in you.
      </p>
    </SwiperSlide>
    <SwiperSlide className="flex flex-col justify-center items-center text-center p-6">
      <img
        src={slide2}
        alt="Slide 2"
        className="max-w-[600px] h-auto rounded-lg mb-4"
      />
      <h2 className="text-lg text-gray-800 mb-2">Manage your data</h2>
      <p className="text-sm text-gray-600">
        Manage your data and view your history easily.
      </p>
    </SwiperSlide>
  </Swiper>
</div>

    </div>
  );
}

export default DoctorAuth;