import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, LocateFixed, MapPin, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { apiMessage, dateBadge, eventPhotoUrl, timeOnly, toneClass } from '../eventUtils';
import '../events.css';

const EMPTY = { search: '', city: '', event_category_id: '', language_id: '', date: '' };

export default function Events() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || 'fr';

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [draft, setDraft] = useState(EMPTY); // ce que la personne tape
  const [filters, setFilters] = useState(EMPTY); // ce qui est appliqué (bouton Rechercher / Entrée)
  const [page, setPage] = useState(1);

  const [geo, setGeo] = useState(null); // position de l'utilisateur (non enregistrée)
  const [radius, setRadius] = useState(10);
  const [geoMessage, setGeoMessage] = useState('');

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Listes pour les filtres
  useEffect(() => {
    api.get('/event-categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get('/languages').then((res) => setLanguages(res.data)).catch(() => {});
  }, []);

  // Chargement des événements
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { page, per_page: 8 };
    if (filters.search) params.search = filters.search;
    if (filters.city) params.city = filters.city;
    if (filters.event_category_id) params.event_category_id = filters.event_category_id;
    if (filters.language_id) params.language_id = filters.language_id;
    if (filters.date) {
      params.date_from = filters.date;
      params.date_to = filters.date;
    }
    if (geo) {
      params.lat = geo.lat;
      params.lng = geo.lng;
      params.radius = radius;
    }

    api
      .get('/events', { params })
      .then((res) => {
        if (!cancelled) setResult(res.data);
      })
      .catch((e) => {
        if (!cancelled) {
          setResult(null);
          setError(apiMessage(e, t('events.loadError', 'Impossible de charger les événements.')));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, geo, radius, page]);

  const setField = (name, value) => setDraft((d) => ({ ...d, [name]: value }));

  const submit = (e) => {
    e.preventDefault();
    setFilters(draft);
    setPage(1);
  };

  const locate = () => {
    setGeoMessage('');
    if (geo) {
      setGeo(null);
      setPage(1);
      return;
    }
    if (!navigator.geolocation) {
      setGeoMessage(t('events.geoUnavailable', "La géolocalisation n'est pas disponible sur ce navigateur."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPage(1);
      },
      () =>
        setGeoMessage(
          t('events.geoDenied', "Impossible d'obtenir ta position. Autorise la localisation dans le navigateur.")
        )
    );
  };

  const resetAll = () => {
    setDraft(EMPTY);
    setFilters(EMPTY);
    setGeo(null);
    setGeoMessage('');
    setPage(1);
  };

  const events = result?.data || [];
  const total = result?.total ?? 0;

  return (
    <div className="ev">
      <section className="ev-hero">
        <div className="ev-hero-inner">
          <div className="ev-eyebrow">{t('events.eyebrow', 'Rencontres')}</div>
          <h1>
            {t('events.heroA', 'Découvre les')} <span>{t('events.heroB', 'événements')}</span>{' '}
            {t('events.heroC', 'de la communauté africaine')}
          </h1>
          <p>{t('events.lead', 'Fêtes, rencontres, cultes, sport : retrouve ta communauté près de chez toi.')}</p>
          <a className="ev-btn ev-btn-orange" href="#ev-list">
            {t('events.explore', 'Explorer les événements')} <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <div className="ev-wrap ev-wrap-wide">
        <form className="ev-search" onSubmit={submit} role="search">
          <div className="ev-search-input">
            <Search size={18} />
            <input
              type="search"
              aria-label={t('events.searchPlaceholder', 'Rechercher un événement…')}
              placeholder={t('events.searchPlaceholder', 'Rechercher un événement…')}
              value={draft.search}
              onChange={(e) => setField('search', e.target.value)}
            />
          </div>

          <input
            className="ev-city"
            aria-label={t('events.cityPlaceholder', 'Ville')}
            placeholder={t('events.cityPlaceholder', 'Ville')}
            value={draft.city}
            onChange={(e) => setField('city', e.target.value)}
          />

          <select
            aria-label={t('events.language', 'Langue')}
            value={draft.language_id}
            onChange={(e) => setField('language_id', e.target.value)}
          >
            <option value="">{t('events.allLanguages', 'Toutes les langues')}</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            aria-label={t('events.category', 'Catégorie')}
            value={draft.event_category_id}
            onChange={(e) => setField('event_category_id', e.target.value)}
          >
            <option value="">{t('events.allCategories', 'Toutes les catégories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className="ev-date"
            type="date"
            aria-label={t('events.date', 'Date')}
            value={draft.date}
            onChange={(e) => setField('date', e.target.value)}
          />

          <button type="submit" className="ev-btn ev-btn-green">
            <Search size={17} /> {t('events.searchBtn', 'Rechercher')}
          </button>

          <button
            type="button"
            className={`ev-btn ${geo ? 'ev-btn-plum' : 'ev-btn-outline'} ev-near`}
            onClick={locate}
            aria-pressed={!!geo}
          >
            <LocateFixed size={17} />{' '}
            {geo ? t('events.nearMeOn', 'Autour de moi : activé') : t('events.nearMe', 'Autour de moi')}
          </button>
        </form>

        {(geo || geoMessage) && (
          <div className="ev-geo-row">
            {geo && (
              <label className="ev-radius-inline">
                {t('events.radius', 'Rayon de recherche')}
                <select
                  value={radius}
                  onChange={(e) => {
                    setRadius(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  {[5, 10, 25, 50, 100].map((r) => (
                    <option key={r} value={r}>
                      {r} km
                    </option>
                  ))}
                </select>
              </label>
            )}
            {geoMessage && <p className="ev-alert ev-alert-error">{geoMessage}</p>}
          </div>
        )}

        <div className="ev-title-row" id="ev-list">
          <h2>{t('events.upcoming', 'Événements à venir')}</h2>
          <button type="button" className="ev-viewall" onClick={resetAll}>
            {t('events.viewAll', 'Voir tous')} <ArrowRight size={16} />
          </button>
        </div>

        {error && <p className="ev-alert ev-alert-error">{error}</p>}

        {!error && (
          <p className="ev-count">
            {loading ? t('events.searching', 'Recherche en cours…') : t('events.count', { count: total })}
          </p>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="ev-empty">{t('events.empty', 'Aucun événement. Essaie une autre recherche.')}</div>
        )}

        <div className="ev-grid">
          {events.map((ev) => {
            const badge = dateBadge(ev.starts_at, locale);
            const photo = eventPhotoUrl(ev.photo_path);
            const full = ev.places_left === 0;
            const registered = ev.registered_count ?? ev.registrations_count ?? ev.attendees_count;
            return (
              <article key={ev.id} className="ev-card">
                <Link
                  to={`/events/${ev.id}`}
                  className={`ev-card-img ${photo ? '' : toneClass(ev)}`}
                  style={photo ? { backgroundImage: `url(${photo})` } : undefined}
                  aria-label={ev.title}
                >
                  {badge && (
                    <div className="ev-badge">
                      <small>{badge.weekday}</small>
                      <b>{badge.day}</b>
                      <small>{badge.month}</small>
                    </div>
                  )}
                </Link>
                <div className="ev-card-body">
                  <h3>
                    <Link to={`/events/${ev.id}`}>{ev.title}</Link>
                  </h3>
                  <p className="ev-meta">
                    <MapPin size={15} />
                    <span>{ev.city}</span>
                  </p>
                  <p className="ev-meta">
                    <Clock size={15} />
                    <span>
                      {timeOnly(ev.starts_at)}
                      {ev.distance_km != null ? ` · ${Number(ev.distance_km).toFixed(1)} km` : ''}
                    </span>
                  </p>
                  <div className="ev-card-foot">
                    {registered != null ? (
                      <span className="ev-registered">
                        <Users size={15} /> {t('events.registered', { count: registered })}
                      </span>
                    ) : (
                      <span className={`ev-places ${full ? 'is-full' : ''}`}>
                        {full
                          ? t('events.full', 'Complet')
                          : t('events.placesLeft', { n: ev.places_left, defaultValue: '{{n}} place(s) restante(s)' })}
                      </span>
                    )}
                    <Link className="ev-btn ev-btn-orange ev-btn-sm" to={`/events/${ev.id}`}>
                      {full ? t('events.see', 'Voir') : t('events.register', "S'inscrire")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {result && result.last_page > 1 && (
          <div className="ev-pagination">
            <button className="ev-btn ev-btn-outline ev-btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span>
              {page} / {result.last_page}
            </span>
            <button
              className="ev-btn ev-btn-outline ev-btn-sm"
              disabled={page >= result.last_page}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}