import axios from 'axios';

// In dev, Vite proxies /api to localhost:5000. In production (Vercel),
// VITE_API_BASE_URL points to your Render backend, e.g.
// https://mindcare-backend.onrender.com/api
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({ baseURL });

// Attach the stored JWT to every outgoing request, if we have one.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mindcare_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Centralize the "session expired" case so every page doesn't need to check it.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mindcare_token');
      localStorage.removeItem('mindcare_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
