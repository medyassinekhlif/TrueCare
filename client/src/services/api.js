import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Insurer Endpoints
export const insurerLogin = (credentials) =>
  API.post("/insurer/login", credentials);
export const insurerSignup = (data) =>
  API.post("/insurer/signup", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const addClient = (clientData) =>
  API.post("/insurer/clients", clientData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getInsurerDashboard = ({
  search = "",
  page = 1,
  limit = 10,
} = {}) => API.get("/insurer/dashboard", { params: { search, page, limit } });
export const updateDashboard = (data) => API.post("/insurer/dashboard", data);
export const getClient = (clientId) => API.get(`/insurer/client/${clientId}`);
export const updateClient = (clientId, clientData) =>
  API.put(`/insurer/clients/${clientId}`, clientData);
export const getMedicalBulletin = (medicalBulletinId) =>
  API.get(`/insurer/medical-bulletin/${medicalBulletinId}`);
export const estimateReimbursement = (data) =>
  API.post("/insurer/estimate", data);
export const getEstimationByBulletin = (medicalBulletinId) =>
  API.get(`/insurer/estimation/bulletin/${medicalBulletinId}`);
export const getClientMedicalDocs = (clientId) =>
  API.get(`/insurer/clients/${clientId}/medical-documents`);
export const getEstimations = (clientId) =>
  API.get(`/insurer/estimations/${clientId}`);

// Doctor Endpoints
export const doctorLogin = (credentials) =>
  API.post("/doctor/login", credentials);
export const doctorSignup = (data) =>
  API.post("/doctor/signup", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getDoctorProfile = () => API.get("/doctor/profile");
export const updateDoctorProfile = (profileData) =>
  API.put("/doctor/profile", profileData);
export const createMedicalBulletin = (bulletinData) =>
  API.post("/doctor/medical-bulletin", bulletinData);
export const getMedicalBulletinsByDoctor = ({
  search = "",
  page = 1,
  limit = 10,
} = {}) =>
  API.get("/doctor/medical-bulletins", {
    params: { search, page, limit },
  });

// Client Endpoints
export const loginClient = (credentials) =>
  API.post("/client/login", credentials);
export const getMedicalBulletins = ({
  search = "",
  sortField = "createdAt",
  sortOrder = "desc",
  page = 1,
  limit = 10,
} = {}) =>
  API.get("/client/medical-bulletins", {
    params: { search, sortField, sortOrder, page, limit },
  });
export const getInsuranceDetails = () => API.get("/client/insurance-details");
export const getMedicalBulletinDetails = (bulletinId) =>
  API.get(`/client/bulletins/${bulletinId}`);
