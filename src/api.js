import axios from 'axios';
import i18n from './i18n';

const api = axios.create({
  baseURL: 'https://annuaire-backend.wasmer.app/api/v1',
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Accept-Language'] = i18n.resolvedLanguage || 'fr';
  return config;
});

export default api;