import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://jufra-backend.vercel.app/api',
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Inyectar fraternidadId activa si está seleccionada (para Multi-Tenant)
  const selectedFraternidadId = localStorage.getItem('selected_fraternidad_id');
  if (selectedFraternidadId && selectedFraternidadId !== 'all-peru' && selectedFraternidadId !== 'all' && !config.params?.fraternidadId) {
    config.params = {
      ...config.params,
      fraternidadId: selectedFraternidadId
    };
  }
  
  return config;
});

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'https://jufra-backend.vercel.app/api';
  const serverUrl = baseUrl.replace(/\/api\/?$/, '');
  return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
