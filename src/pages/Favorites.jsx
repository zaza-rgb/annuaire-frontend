import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star } from 'lucide-react';
import api from '../api';
import { storageUrl, formatRating } from '../utils';
import FavoriteButton from '../components/FavoriteButton.jsx';

const PER_PAGE = 9;

// Page Mes favoris (/favorites), ligne 15 : GET /favorites?page=&per_page=
export default function Favorites() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [last, setLast] = useState(1);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState('loading'); // loading | ready | error

  const load = useCallback(async (p) => {
    setState('loading');
    try {
      const { data: r } = await api.get('/favorites', { params: { page: p, per_page: PER_PAGE } });
      const list = r.data ?? r;
      if (list.length === 0 && p > 1) {
        setPage(p - 1); // dernière fiche de la page retirée
        return;
      }
      setItems(list);
      setLast(r.last_page ?? r.meta?.last_page ?? 1);
      setTotal(r.total ?? r.meta?.total ?? list.length);
      setState('ready');
    } catch {
      setState('error');
    }
  }, []);

  // i18n.language : les noms de catégories reviennent dans la langue active
  useEffect(() => { load(page); }, [page, load, i18n.language]);

  return (
    <main className="page">
      <header className="fav-head">
        <h1>{t('favorites.title')}</h1>
        {state === 'ready' && total > 0 && <p className="muted">{t('favorites.count', { count: total })}</p>}
      </header>

      {state === 'loading' && <p className="muted" role="status">…</p>}
      {state === 'error' && <p className="alert alert-error" role="alert">{t('favorites.loadError')}</p>}

      {state === 'ready' && items.length === 0 && (
        <div className="panel fav-empty">
          <h2>{t('favorites.emptyTitle')}</h2>
          <p className="muted">{t('favorites.emptyText')}</p>
          <Link to="/businesses" className="btn btn-primary">{t('favorites.explore')}</Link>
        </div>
      )}

      {state === 'ready' && items.length > 0 && (
        <>
          <ul className="fav-grid">
            {items.map((b) => {
              const photo = b.photos?.[0]?.file_path;
              return (
                <li key={b.id} className="fav-card">
                  <Link to={`/businesses/${b.id}`} className="fav-photo" aria-label={b.name}>
                    {photo ? <img src={storageUrl(photo)} alt="" loading="lazy" /> : <span aria-hidden="true">{b.name?.[0]}</span>}
                  </Link>
                  <div className="fav-body">
                    <h2><Link to={`/businesses/${b.id}`}>{b.name}</Link></h2>
                    {b.category?.name && <p className="muted">{b.category.name}</p>}
                    <p className="fav-meta">
                      {b.city && <span><MapPin size={14} aria-hidden="true" /> {b.city}</span>}
                      {b.reviews_count > 0 && (
                        <span><Star size={14} fill="currentColor" aria-hidden="true" /> {formatRating(b.average_rating)} ({b.reviews_count})</span>
                      )}
                    </p>
                  </div>
                  <FavoriteButton businessId={b.id} className="fav-card-heart" />
                </li>
              );
            })}
          </ul>

          {last > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('favorites.prev')}</button>
              <span>{t('favorites.page', { current: page, last })}</span>
              <button className="btn btn-outline" disabled={page >= last} onClick={() => setPage(page + 1)}>{t('favorites.next')}</button>
            </nav>
          )}
        </>
      )}
    </main>
  );
}
