import axios from 'axios';

// NOTE: no default Content-Type here. Axios sets application/json automatically
// for plain-object bodies, but a hardcoded JSON default makes axios serialize
// FormData uploads to JSON (formDataToJSON), which silently destroys the file.
const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('lhp_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lhp_admin_token');
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
