import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Loading from './components/Loading';
import InsurerAuth from './pages/InsurerAuth';

import MedicalBulletinDetails from './pages/MedicalBulletinDetails'

import DoctorAuth from './pages/DoctorAuth';
import ClientAuth from './pages/ClientAuth';
import InsurerDashboard from './pages/InsurerDashboard';
import AddMedicalBulletin from './pages/AddMedicalBulletin'
import DoctorDashboard from './pages/DoctorDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ClientDetails from './pages/ClientDetails';
import ClientBulletinDetails from './pages/ClientBulletinDetails';

import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/Home';
import './index.css';

const Root = () => {
  const token = localStorage.getItem('token');
  let user = null;

  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      user = JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      localStorage.removeItem('token');
    }
  }

  if (user) {
    if (user.role === 'insurer') {
      return (
        <PrivateRoute role="insurer">
          <InsurerDashboard />
        </PrivateRoute>
      );
    } else if (user.role === 'doctor') {
      return (
        <PrivateRoute role="doctor">
          <DoctorDashboard />
        </PrivateRoute>
      );
    } else if (user.role === 'client') {
      return (
        <PrivateRoute role="client">
          <ClientDashboard />
        </PrivateRoute>
      );
    }
  }

  return <HomePage />;
};

function Layout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  const noNavbarPaths = ['/insurer/auth', '/doctor/auth', '/client/auth'];
  const hideNavbar = noNavbarPaths.includes(location.pathname);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); 

    return () => clearTimeout(timer);
  }, [location.pathname]); 

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <main className="flex-grow">
        <Routes>
          
          <Route path="/" element={<Root />} />
          <Route path="/insurer/auth" element={<InsurerAuth />} />
          <Route path="/medical-bulletin/:medicalBulletinId" element={<MedicalBulletinDetails />} />

          <Route path="/bulletin/:bulletinId" element={<ClientBulletinDetails />} />



          <Route path="/doctor/auth" element={<DoctorAuth />} />
          <Route path="/add-bulletin" element={<AddMedicalBulletin />} />
          <Route path="/client/auth" element={<ClientAuth />} />
          <Route
            path="/insurer/client/:clientId"
            element={
              <PrivateRoute role="insurer">
                <ClientDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;