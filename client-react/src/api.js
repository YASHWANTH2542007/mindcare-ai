import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

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
