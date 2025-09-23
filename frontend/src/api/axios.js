import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api/';

const api = axios.create({
  baseURL: API_URL,
});

// automatyczne dodawanie tokenu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

export default api;
