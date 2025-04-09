import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const insurerLogin = (credentials) => API.post('/insurer/login', credentials);
export const insurerSignup = (data) => API.post('/insurer/signup', data);
export const doctorLogin = (credentials) => API.post('/doctor/login', credentials);
export const doctorSignup = (data) => API.post('/doctor/signup', data);
export const addClient = (clientData) => API.post('/insurer/clients', clientData);
export const updateClient = (clientId, clientData) => API.put(`/insurer/clients/${clientId}`, clientData);
export const getInsurerDashboard = () => API.get('/insurer/dashboard');
export const getClientMedicalDocs = (clientId) => API.get(`/insurer/clients/${clientId}/medical-documents`);
export const createMedicalBulletin = (bulletinData) => API.post('/doctor/medical-bulletin', bulletinData);