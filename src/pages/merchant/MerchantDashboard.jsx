import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronRight,
  CircleCheck,
  Clock,
  MessageCircle,
  Plus,
  Star,
  Store,
  UserRound,
} from 'lucide-react';
import api from '../../api';
import { formatRating } from '../../utils';
import '../../merchant.css';


const FILTERS = ['all', 'pending', 'approved', 'rejected'];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Tableau de bord du commerçant : GET /my-businesses (ligne 24 de la checklist).
// On charge toutes les fiches d'un coup (100 au maximum) pour filtrer et compter sans autre appel.
// Le menu à gauche vient de MerchantLayout (route parente).
// Visites, consultations et courbe d'activité : à venir avec l'API Statistiques (phase 7.7).
export default function MerchantDashboard() {
  const { t } = useTranslation();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const firstName = (readUser()?.name || '').split(' ')[0] || t('merchant.dash.fallbackName');

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

  // Chiffres calculés à partir des fiches déjà chargées (aucune autre API)
  const stats = useMemo(() => {
    const list = items || [];
    const reviews = list.reduce((sum, b) => sum + (b.reviews_count || 0), 0);
    const weighted = list.reduce(
      (sum, b) => sum + (b.reviews_count ? Number(b.average_rating || 0) * b.reviews_count : 0),
      0,
    );
    return {
      total: list.length,
      approved: list.filter((b) => b.status === 'approved').length,
      pending: list.filter((b) => b.status === 'pending').length,
      rejected: list.filter((b) => b.status === 'rejected').length,
      reviews,
      average: reviews > 0 ? weighted / reviews : null,
    };
  }, [items]);

  const cards = [
    { key: 'total', tone: 'green', icon: Store, value: stats.total },
    { key: 'approved', tone: 'leaf', icon: CircleCheck, value: stats.approved },
    { key: 'pending', tone: 'orange', icon: Clock, value: stats.pending },
    { key: 'reviews', tone: 'plum', icon: MessageCircle, value: stats.reviews },
    {
      key: 'average',
      tone: 'gold',
      icon: Star,
      value: stats.average === null ? '—' : formatRating(stats.average),
    },
  ];

  const bars = [
    { status: 'approved', value: stats.approved },
    { status: 'pending', value: stats.pending },
    { status: 'rejected', value: stats.rejected },
  ];

  return (
    <div className="dsh">
      {/* Bannière d'accueil */}
      <section className="dsh-hero">
        <div className="dsh-hero__text">
          <h1>{t('merchant.dash.hello', { name: firstName })}</h1>
          <p>{t('merchant.dash.heroText')}</p>
          <Link to="/merchant/new" className="dsh-hero__btn">
            <Plus size={16} aria-hidden="true" /> {t('merchant.dashboard.add')}
          </Link>
        </div>
      </section>

      {error && <p className="alert alert-error">{error}</p>}
      {!items && !error && <p>{t('merchant.dashboard.loading')}</p>}

      {items && items.length === 0 && (
        <section className="dsh-panel dsh-empty">
          <h2>{t('merchant.dashboard.emptyTitle')}</h2>
          <p>{t('merchant.dashboard.emptyText')}</p>
          <Link to="/merchant/new" className="btn btn-primary">
            {t('merchant.dashboard.add')}
          </Link>
        </section>
      )}

      {items && items.length > 0 && (
        <>
          {/* Cartes de chiffres */}
          <section className="dsh-stats" aria-label={t('merchant.dash.overviewTitle')}>
            {cards.map(({ key, tone, icon: Icon, value }) => (
              <article key={key} className="dsh-stat">
                <span className={`dsh-stat__icon dsh-tone-${tone}`}>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <strong className="dsh-stat__value">{value}</strong>
                <p className="dsh-stat__label">{t(`merchant.dash.${key}`)}</p>
              </article>
            ))}
          </section>

          <div className="dsh-grid">
            {/* Liste des établissements */}
            <section className="dsh-panel">
              <h2 className="dsh-panel__title">{t('merchant.dash.listTitle')}</h2>

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

              {shown.length === 0 && (
                <p className="m-muted">{t('merchant.dashboard.emptyFilter')}</p>
              )}

              <div className="dsh-list">
                {shown.map((b) => {
                  const hasRating = b.average_rating !== null && b.average_rating !== undefined;
                  return (
                    <article key={b.id} className="dsh-biz">
                      <div className="dsh-biz__logo" aria-hidden="true">
                        {b.name?.charAt(0).toUpperCase()}
                      </div>

                      <div className="dsh-biz__body">
                        <div className="dsh-biz__top">
                          <h3>{b.name}</h3>
                          <span className={`m-badge m-badge-${b.status}`}>
                            {t(`merchant.status.${b.status}`)}
                          </span>
                        </div>
                        <p className="m-muted">
                          {[b.category?.name, b.city].filter(Boolean).join(', ')}
                        </p>
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
                        {b.status === 'pending' && (
                          <p className="m-note">{t('merchant.dashboard.pendingNote')}</p>
                        )}
                        {b.status === 'rejected' && (
                          <p className="m-note m-note-bad">{t('merchant.dashboard.rejectedNote')}</p>
                        )}
                      </div>

                      <div className="dsh-biz__actions">
                        <Link to={`/merchant/${b.id}/edit`} className="btn btn-primary">
                          {t('merchant.dashboard.edit')}
                        </Link>
                        {b.status === 'approved' && (
                          <Link to={`/businesses/${b.id}`} className="btn btn-ghost">
                            {t('merchant.dashboard.view')}
                          </Link>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* Colonne de droite : répartition + accès rapide */}
            <aside className="dsh-side">
              <section className="dsh-panel">
                <h2 className="dsh-panel__title">{t('merchant.dash.overviewTitle')}</h2>
                <ul className="dsh-bars">
                  {bars.map(({ status, value }) => (
                    <li key={status}>
                      <div className="dsh-bars__row">
                        <span>{t(`merchant.status.${status}`)}</span>
                        <strong>{value}</strong>
                      </div>
                      <div className="dsh-bars__track">
                        <span
                          className={`dsh-bars__fill dsh-bars__fill--${status}`}
                          style={{ width: `${stats.total ? (value / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="dsh-panel">
                <h2 className="dsh-panel__title">{t('merchant.dash.quickTitle')}</h2>
                <nav className="dsh-quick">
                  <Link to="/merchant/new">
                    <Plus size={18} aria-hidden="true" /> {t('merchant.dashboard.add')}
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                  <Link to="/messages">
                    <MessageCircle size={18} aria-hidden="true" /> {t('merchant.dash.messages')}
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                  <Link to="/profile">
                    <UserRound size={18} aria-hidden="true" /> {t('nav.profile')}
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </nav>
              </section>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
