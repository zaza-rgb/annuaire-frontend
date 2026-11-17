import api from './api';

// Adresse des fichiers envoyés (photos) : http://127.0.0.1:8000/storage/...
// Nécessite d'avoir lancé une fois : php artisan storage:link
export const storageUrl = (path) =>
  api.defaults.baseURL.replace(/\/api\/?$/, '') + '/storage/' + path;

export const formatRating = (value) => Number(value).toFixed(1).replace('.', ',');

export const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
