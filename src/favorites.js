// Cache partagé des favoris : évite un appel par bouton cœur.
// Après connexion ou déconnexion, appeler resetFavorites() (voir INTEGRATION.md).
import { useEffect, useReducer } from 'react';
import api from './api';

let ids = null;
let loading = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

export const getFavoriteIds = () => ids;
export const subscribeFavorites = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function resetFavorites() {
  ids = null;
  emit();
}

export async function loadFavoriteIds() {
  if (!localStorage.getItem('token')) return new Set(); // visiteur : rien à charger, rien à mémoriser
  if (ids) return ids;
  if (!loading) {
    loading = api
      .get('/favorites', { params: { per_page: 100 } })
      .then((res) => {
        const list = res.data.data ?? res.data;
        ids = new Set(list.map((b) => b.id));
      })
      .catch(() => {
        ids = new Set();
      })
      .finally(() => {
        loading = null;
        emit();
      });
  }
  await loading;
  return ids;
}

export async function addFavorite(businessId) {
  await api.post(`/businesses/${businessId}/favorite`); // 201 ou 200 : idempotent
  ids = new Set(ids || []).add(businessId);
  emit();
}

export async function removeFavorite(businessId) {
  await api.delete(`/businesses/${businessId}/favorite`); // 204
  const next = new Set(ids || []);
  next.delete(businessId);
  ids = next;
  emit();
}

export function useIsFavorite(businessId) {
  const [, rerender] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    const off = subscribeFavorites(rerender);
    loadFavoriteIds();
    return off;
  }, []);
  return getFavoriteIds()?.has(businessId) ?? false;
}
