import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import BusinessCard from '../components/BusinessCard.jsx';
import BusinessMap from '../components/BusinessMap.jsx';

export default function Explore() {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ q: '', city: '', category_id: '', country_id: '' });
  const [geo, setGeo] = useState(null); // position de l'utilisateur (non enregistrée)
  const [radius, setRadius] = useState(10);
  const [geoMessage, setGeoMessage] = useState(''); // clé de traduction, vide si aucun message
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list'); // 'list' ou 'map'

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Listes pour les filtres
  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get('/countries').then((res) => setCountries(res.data)).catch(() => {});
    api.get('/cities').then((res) => setCities(res.data)).catch(() => {});
  }, []);

  // Recherche texte : on attend la fin de la frappe
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.q === search ? f : { ...f, q: search }));
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Chargement des commerces
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    const params = { page: view === 'map' ? 1 : page, per_page: view === 'map' ? 100 : 9 };
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') params[key] = value;
    });
    if (geo) {
      params.lat = geo.lat;
      params.lng = geo.lng;
      params.radius = radius;
    }

    api
      .get('/businesses', { params })
      .then((res) => {
        if (!cancelled) setResult(res.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, geo, radius, page, view]);

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
      setGeoMessage('explore.geoUnavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPage(1);
      },
      () => setGeoMessage('explore.geoDenied')
    );
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name;
  const businesses = result?.data || [];

  return (
    <div className="page">
      <div className="eyebrow">{t('explore.eyebrow')}</div>
      <h2>{t('explore.title')}</h2>
      <p className="lead">{t('explore.lead')}</p>

      <div className="panel filters">
        <div className="form-grid three">
          <div className="field">
            <label htmlFor="q">{t('explore.search')}</label>
            <input
              id="q"
              placeholder={t('explore.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="city">{t('explore.city')}</label>
            <select id="city" value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
              <option value="">{t('explore.allCities')}</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="country">{t('explore.country')}</label>
            <select
              id="country"
              value={filters.country_id}
              onChange={(e) => setFilter('country_id', e.target.value)}
            >
              <option value="">{t('explore.allCountries')}</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="chips">
          <button
            className={`btn ${filters.category_id === '' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setFilter('category_id', '')}
          >
            {t('explore.all')}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`btn ${String(filters.category_id) === String(c.id) ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setFilter('category_id', c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="chips near-me">
          <button
            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setView('list')}
          >
            ☰ {t('explore.viewList')}
          </button>
          <button
            className={`btn ${view === 'map' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setView('map')}
          >
            ⌖ {t('explore.viewMap')}
          </button>
          <span className="sep" />
          <button className={`btn ${geo ? 'btn-clay' : 'btn-outline'}`} onClick={locate}>
            ⌖ {geo ? t('explore.nearMeOn') : t('explore.nearMe')}
          </button>
          {geo && (
            <select
              aria-label={t('explore.radiusLabel')}
              className="radius"
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 25, 50, 100].map((r) => (
                <option key={r} value={r}>
                  {t('explore.radiusOption', { km: r })}
                </option>
              ))}
            </select>
          )}
        </div>
        {geoMessage && <p className="field-error">{t(geoMessage)}</p>}
      </div>

      {error && <p className="alert alert-error">{t('explore.loadError')}</p>}

      {!error && (
        <p className="results-count">
          {loading ? t('explore.searching') : t('explore.found', { count: result?.total ?? 0 })}
        </p>
      )}

      {!loading && !error && businesses.length === 0 && (
        <div className="empty">{t('explore.noResults')}</div>
      )}

      {view === 'map' && !error && (
        <>
          <BusinessMap businesses={businesses} categoryName={categoryName} userPosition={geo} />
          {result && result.total > businesses.length && (
            <p className="results-count">{t('explore.mapLimit', { n: businesses.length })}</p>
          )}
        </>
      )}

      {view === 'list' && (
        <div className="feature-grid">
          {businesses.map((b) => (
            <BusinessCard key={b.id} business={b} categoryName={categoryName(b.category_id)} />
          ))}
        </div>
      )}

      {view === 'list' && result && result.last_page > 1 && (
        <div className="pagination">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            {t('explore.previous')}
          </button>
          <span>{t('explore.page', { current: result.current_page, last: result.last_page })}</span>
          <button
            className="btn btn-outline"
            disabled={page >= result.last_page}
            onClick={() => setPage(page + 1)}
          >
            {t('explore.next')}
          </button>
        </div>
      )}
    </div>
  );
}