import { useEffect, useState } from 'react';
import api from '../api';
import BusinessCard from '../components/BusinessCard.jsx';
import BusinessMap from '../components/BusinessMap.jsx';

export default function Explore() {
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  // La recherche de la page d'accueil arrive par l'adresse : /businesses?q=...
  const initialQ = new URLSearchParams(window.location.search).get('q') || '';
  const [search, setSearch] = useState(initialQ);
  const [filters, setFilters] = useState({ q: initialQ, city: '', category_id: '', country_id: '' });
  const [geo, setGeo] = useState(null); // position de l'utilisateur (non enregistrée)
  const [radius, setRadius] = useState(10);
  const [geoMessage, setGeoMessage] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('list'); // 'list' ou 'map'

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    setError('');

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
        if (!cancelled) setError('Impossible de charger les commerces. Vérifie que l\'API tourne.');
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
      setGeoMessage("La géolocalisation n'est pas disponible sur ce navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setPage(1);
      },
      () => setGeoMessage("Impossible d'obtenir ta position. Autorise la localisation dans le navigateur.")
    );
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name;
  const businesses = result?.data || [];

  return (
    <div className="page">
      <div className="eyebrow">Le répertoire</div>
      <h2>Explorer les adresses</h2>
      <p className="lead">Des lieux indépendants, sélectionnés pour leur ancrage afro.</p>

      <div className="panel filters">
        <div className="form-grid three">
          <div className="field">
            <label htmlFor="q">Rechercher</label>
            <input
              id="q"
              placeholder="Nom, activité, quartier…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="city">Ville</label>
            <select id="city" value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
              <option value="">Toutes les villes</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="country">Pays d'origine</label>
            <select
              id="country"
              value={filters.country_id}
              onChange={(e) => setFilter('country_id', e.target.value)}
            >
              <option value="">Tous les pays</option>
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
            Tous
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
            ☰ Liste
          </button>
          <button
            className={`btn ${view === 'map' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setView('map')}
          >
            ⌖ Carte
          </button>
          <span className="sep" />
          <button className={`btn ${geo ? 'btn-clay' : 'btn-outline'}`} onClick={locate}>
            ⌖ {geo ? 'Autour de moi : activé' : 'Autour de moi'}
          </button>
          {geo && (
            <select
              aria-label="Rayon de recherche"
              className="radius"
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                setPage(1);
              }}
            >
              {[5, 10, 25, 50, 100].map((r) => (
                <option key={r} value={r}>
                  Dans un rayon de {r} km
                </option>
              ))}
            </select>
          )}
        </div>
        {geoMessage && <p className="field-error">{geoMessage}</p>}
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      {!error && (
        <p className="results-count">
          {loading
            ? 'Recherche en cours…'
            : `${result?.total ?? 0} adresse${(result?.total ?? 0) > 1 ? 's' : ''} trouvée${(result?.total ?? 0) > 1 ? 's' : ''}`}
        </p>
      )}

      {!loading && !error && businesses.length === 0 && (
        <div className="empty">Aucun résultat. Essayez une autre recherche.</div>
      )}

      {view === 'map' && !error && (
        <>
          <BusinessMap businesses={businesses} categoryName={categoryName} userPosition={geo} />
          {result && result.total > businesses.length && (
            <p className="results-count">
              Les {businesses.length} premiers commerces sont affichés. Affine ta recherche pour voir les autres.
            </p>
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
            ← Précédent
          </button>
          <span>
            Page {result.current_page} sur {result.last_page}
          </span>
          <button
            className="btn btn-outline"
            disabled={page >= result.last_page}
            onClick={() => setPage(page + 1)}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
