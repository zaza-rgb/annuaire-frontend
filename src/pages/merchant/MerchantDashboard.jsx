import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { formatRating } from '../../utils';
import MerchantNav from '../../components/MerchantNav.jsx';
import '../../merchant.css';

const FILTERS = ['all', 'pending', 'approved', 'rejected'];

// Tableau de bord du commerçant : GET /my-businesses (ligne 24 de la checklist).
// On charge toutes les fiches d'un coup (100 au maximum) pour filtrer et compter sans autre appel.
export default function MerchantDashboard() {
  const { t } = useTranslation();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/my-businesses', { params: { per_page: 100 } })
      .then((res) => setItems(res.data.data || []))
      .catch(() => setError(t('merchant.dashboard.loadError')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = (status) =>
    status === 'all' ? (items || []).length : (items || []).filter((b) => b.status === status).length;

  const shown = (items || []).filter((b) => filter === 'all' || b.status === filter);

  return (
    <div className="page">
      <MerchantNav />

      <div className="m-head">
        <div>
          <h1>{t('merchant.dashboard.title')}</h1>
          <p className="m-muted">{t('merchant.dashboard.subtitle')}</p>
        </div>
        <Link to="/merchant/new" className="btn btn-primary">
          {t('merchant.dashboard.add')}
        </Link>
      </div>

      {error && <p className="alert alert-error">{error}</p>}
      {!items && !error && <p>{t('merchant.dashboard.loading')}</p>}

      {items && items.length === 0 && (
        <section className="panel m-empty">
          <h3>{t('merchant.dashboard.emptyTitle')}</h3>
          <p>{t('merchant.dashboard.emptyText')}</p>
          <Link to="/merchant/new" className="btn btn-primary">
            {t('merchant.dashboard.add')}
          </Link>
        </section>
      )}

      {items && items.length > 0 && (
        <>
          <div className="m-filters" role="tablist">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {t(`merchant.status.${f}`)} ({count(f)})
              </button>
            ))}
          </div>

          {shown.length === 0 && <p className="m-muted">{t('merchant.dashboard.emptyFilter')}</p>}

          <div className="m-cards">
            {shown.map((b) => {
              const hasRating = b.average_rating !== null && b.average_rating !== undefined;
              return (
                <article key={b.id} className="panel m-card">
                  <div className="m-card-top">
                    <h3>{b.name}</h3>
                    <span className={`m-badge m-badge-${b.status}`}>{t(`merchant.status.${b.status}`)}</span>
                  </div>
                  <p className="m-muted">{[b.category?.name, b.city].filter(Boolean).join(', ')}</p>

                  <p className="m-rating">
                    {hasRating ? (
                      <>
                        ★ {formatRating(b.average_rating)}{' '}
                        <span>({t('card.reviews', { count: b.reviews_count })})</span>
                      </>
                    ) : (
                      <span>{t('card.noReviews')}</span>
                    )}
                  </p>

                  {b.status === 'pending' && <p className="m-note">{t('merchant.dashboard.pendingNote')}</p>}
                  {b.status === 'rejected' && <p className="m-note m-note-bad">{t('merchant.dashboard.rejectedNote')}</p>}

                  <div className="m-card-actions">
                    <Link to={`/merchant/${b.id}/edit`} className="btn btn-primary">
                      {t('merchant.dashboard.edit')}
                    </Link>
                    {b.status === 'approved' && (
                      <>
                        <Link to={`/merchant/${b.id}/reviews`} className="btn btn-light">
                          {t('merchant.dashboard.reviews')}
                        </Link>
                        <Link to={`/businesses/${b.id}`} className="btn btn-ghost">
                          {t('merchant.dashboard.view')}
                        </Link>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
