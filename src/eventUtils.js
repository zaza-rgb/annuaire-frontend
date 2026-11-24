import api from './api';

// Aides pour les pages Événements.

// Les dates des événements arrivent au format « AAAA-MM-JJ HH:MM:SS », sans fuseau :
// c'est l'heure locale du lieu. On l'affiche telle quelle, sans conversion de fuseau.
export function formatEventDate(value) {
  if (!value) return '';
  const [datePart, timePart = ''] = String(value).split(/[T ]/);
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return String(value);
  return `${d}/${m}/${y}${timePart ? ' ' + timePart.slice(0, 5) : ''}`;
}

// Heure seule : « 18:00 »
export function timeOnly(value) {
  const part = String(value || '').split(/[T ]/)[1];
  return part ? part.slice(0, 5) : '';
}

// Pastille de date des cartes : { weekday: 'sam', day: 24, month: 'mai' }
// Calculée en UTC pour que le jour affiché soit toujours celui de la chaîne reçue.
export function dateBadge(value, locale = 'fr') {
  const [datePart] = String(value || '').split(/[T ]/);
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  const part = (opts) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(dt).replace('.', '');
  return { weekday: part({ weekday: 'short' }), day: d, month: part({ month: 'short' }) };
}

// Message d'erreur lisible : première erreur de validation (422), sinon le message de l'API.
export function apiMessage(error, fallback) {
  const data = error?.response?.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return data?.message || fallback;
}

// Adresse d'une photo d'événement (photo_path est vide tant que l'API n'envoie pas de photos).
export function eventPhotoUrl(path) {
  if (!path) return null;
  const base = String(api.defaults.baseURL || '').replace(/\/api(\/v1)?\/?$/, '');
  return `${base}/storage/${path}`;
}

// Fond de remplacement quand l'événement n'a pas de photo : une des 5 teintes selon la catégorie.
export function toneClass(event) {
  return `ev-tone-${(event?.category?.id ?? event?.id ?? 0) % 5}`;
}
