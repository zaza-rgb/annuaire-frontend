import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Clock, LocateFixed, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { apiMessage, dateBadge, eventPhotoUrl, timeOnly, toneClass } from '../eventUtils';
import '../events.css';

export default function Events() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || 'fr';

  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [filters, setFilters] = useState({
    city: '',
    event_category_id: '',
    language_id: '',
    date_from: '',
    date_to: '',
  });
  const [cityInput, setCityInput] = useState('');
  const [geo, setGeo] = useState(null); // position de l'utilisateur (non enregistrée)
  const [radius, setRadius] = useState(10);
  const [geoMessage, setGeoMessage] = useState('');
  const [page, setPage] = useState(1);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Listes pour les filtres
  useEffect(() => {
    api.get('/event-categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get('/languages').then((res) => setLanguages(res.data)).catch(() => {});
  }, []);

  // Ville : recherche partielle, on attend la fin de la frappe
  // (la liste /cities ne couvre pas les événements : champ texte libre)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.city === cityInput ? f : { ...f, city: cityInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [cityInput]);

  // Chargement des événements
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { page, per_page: 9 };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params[key] = value;
    });
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

  const setFilter = (name, value) => {
    setFilters((f) => ({ ...f, [name]: value }));
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

      <div className="ev-wrap">
        <div className="ev-filters">
          <div className="ev-field">
            <label htmlFor="ev-city">{t('events.city', 'Ville')}</label>
            <input
              id="ev-city"
              placeholder={t('events.cityPlaceholder', 'Ex. São Paulo')}
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
          </div>
          <div className="ev-field">
            <label htmlFor="ev-category">{t('events.category', 'Catégorie')}</label>
            <select
              id="ev-category"
              value={filters.event_category_id}
              onChange={(e) => setFilter('event_category_id', e.target.value)}
            >
              <option value="">{t('events.allCategories', 'Toutes les catégories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ev-field">
            <label htmlFor="ev-language">{t('events.language', 'Langue')}</label>
            <select
              id="ev-language"
              value={filters.language_id}
              onChange={(e) => setFilter('language_id', e.target.value)}
            >
              <option value="">{t('events.allLanguages', 'Toutes les langues')}</option>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
          <div className="ev-field">
            <label htmlFor="ev-from">{t('events.dateFrom', 'À partir du')}</label>
            <input
              id="ev-from"
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilter('date_from', e.target.value)}
            />
          </div>
          <div className="ev-field">
            <label htmlFor="ev-to">{t('events.dateTo', "Jusqu'au")}</label>
            <input
              id="ev-to"
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilter('date_to', e.target.value)}
            />
          </div>
          <button className={`ev-btn ${geo ? 'ev-btn-plum' : 'ev-btn-outline'}`} onClick={locate}>
            <LocateFixed size={17} /> {geo ? t('events.nearMeOn', 'Autour de moi : activé') : t('events.nearMe', 'Autour de moi')}
          </button>
        </div>

        {geo && (
          <div className="ev-field ev-radius" style={{ maxWidth: 260 }}>
            <label htmlFor="ev-radius">{t('events.radius', 'Rayon de recherche')}</label>
            <select
              id="ev-radius"
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
          </div>
        )}
        {geoMessage && <p className="ev-alert ev-alert-error">{geoMessage}</p>}

        <div className="ev-title-row" id="ev-list">
          <h2>{t('events.upcoming', 'Événements à venir')}</h2>
        </div>

        {error && <p className="ev-alert ev-alert-error">{error}</p>}

        {!error && (
          <p className="ev-count">
            {loading
              ? t('events.searching', 'Recherche en cours…')
              : t('events.count', { total, defaultValue: '{{total}} événement(s) trouvé(s)' })}
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
            return (
              <article key={ev.id} className="ev-card">
                <div
                  className={`ev-card-img ${photo ? '' : toneClass(ev)}`}
                  style={photo ? { backgroundImage: `url(${photo})` } : undefined}
                >
                  {badge && (
                    <div className="ev-badge">
                      <small>{badge.weekday}</small>
                      <b>{badge.day}</b>
                      <small>{badge.month}</small>
                    </div>
                  )}
                  {ev.category?.name && <span className="ev-cat">{ev.category.name}</span>}
                </div>
                <div className="ev-card-body">
                  <h3>
                    <Link to={`/events/${ev.id}`}>{ev.title}</Link>
                  </h3>
                  <p className="ev-meta">
                    <MapPin size={15} />
                    <span>
                      {ev.city}
                      {ev.address ? ` · ${ev.address}` : ''}
                    </span>
                  </p>
                  <p className="ev-meta">
                    <Clock size={15} />
                    <span>
                      {timeOnly(ev.starts_at)}
                      {ev.distance_km != null ? ` · ${Number(ev.distance_km).toFixed(1)} km` : ''}
                    </span>
                  </p>
                  <div className="ev-card-foot">
                    <span className={`ev-places ${full ? 'is-full' : ''}`}>
                      {full
                        ? t('events.full', 'Complet')
                        : t('events.placesLeft', { n: ev.places_left, defaultValue: '{{n}} place(s) restante(s)' })}
                    </span>
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
