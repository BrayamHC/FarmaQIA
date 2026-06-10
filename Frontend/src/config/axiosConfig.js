import axios from 'axios';

const ES_MOVIL = import.meta.env.VITE_APP_MOBILE_CLIENTE === 'true';
const API_MOBILE_URL = import.meta.env.VITE_API_ADMIN_MOBILE_URL;
const API_WEB_URL = import.meta.env.VITE_API_URL || '/api-admin';

function getBaseUrl() {
  if (ES_MOVIL) {
    return API_MOBILE_URL;
  }

  return API_WEB_URL;
}

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmaq_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';

    const esLogin = requestUrl.includes('/auth/login');

    if (status === 401 && !esLogin) {
      localStorage.removeItem('farmaq_token');
      localStorage.removeItem('farmaq_usuario');

      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  },
);

export default api;
