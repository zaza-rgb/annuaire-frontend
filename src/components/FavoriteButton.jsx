import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { addFavorite, removeFavorite, useIsFavorite } from '../favorites';

// Bouton cœur : fiche (ligne 14) et cartes de résultats.
// <FavoriteButton businessId={business.id} />
export default function FavoriteButton({ businessId, className = '' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isFavorite = useIsFavorite(businessId);
  const [busy, setBusy] = useState(false);

  async function toggle(e) {
    e.preventDefault(); // le bouton peut se trouver dans un <Link>
    e.stopPropagation();
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      if (isFavorite) await removeFavorite(businessId);
      else await addFavorite(businessId);
    } catch {
      /* 404 : fiche non validée ou retirée, on ne change rien */
    } finally {
      setBusy(false);
    }
  }

  const label = isFavorite ? t('favorites.remove') : t('favorites.add');
  return (
    <button
      type="button"
      className={`fav-btn${isFavorite ? ' is-on' : ''} ${className}`.trim()}
      onClick={toggle}
      disabled={busy}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
    >
      <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
