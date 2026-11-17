import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { formatRating, stars, storageUrl } from '../utils';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// day_of_week : 1 = lundi … 7 = dimanche (ou 0 = dimanche si la base utilise 0 à 6)
function dayIndex(value, sundayIsZero) {
  const n = Number(value);
  if (sundayIsZero) return n === 0 ? 6 : n - 1;
  return n - 1;
}

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

export default function BusinessDetail() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setBusiness(null);
    setError('');
    api
      .get(`/businesses/${id}`)
      .then((res) => setBusiness(res.data))
      .catch((e) =>
        setError(e.response?.status === 404 ? "Cette fiche est introuvable." : 'Impossible de charger la fiche.')
      );
  }, [id]);

  if (error) {
    return (
      <div className="page">
        <p className="alert alert-error">{error}</p>
        <Link to="/businesses" className="btn btn-light">
          ← Retour à l'annuaire
        </Link>
      </div>
    );
  }
  if (!business) {
    return (
      <div className="page">
        <p>Chargement…</p>
      </div>
    );
  }

  const b = business;
  const hours = b.opening_hours || b.openingHours || [];
  const sundayIsZero = hours.some((h) => Number(h.day_of_week) === 0);
  const byDay = DAYS.map((label, i) => ({
    label,
    slots: hours
      .filter((h) => dayIndex(h.day_of_week, sundayIsZero) === i)
      .map((h) => `${hhmm(h.opens_at)}–${hhmm(h.closes_at)}`),
  }));
  const reviews = b.reviews || [];
  const photos = b.photos || [];
  const languages = (b.languages || []).map((l) => l.name).join(', ');
  const hasRating = b.average_rating !== null && b.average_rating !== undefined;

  return (
    <div className="page">
      <Link to="/businesses" className="btn btn-light">
        ← Retour à l'annuaire
      </Link>

      <section className="detail-hero">
        <div>
          <div className="eyebrow">
            {[b.category?.name, b.city].filter(Boolean).join(' · ')}
          </div>
          <h1 className="detail-title">{b.name}</h1>
          <div className="rating-line">
            {hasRating ? (
              <>
                ★ {formatRating(b.average_rating)}{' '}
                <span>({b.reviews_count} avis)</span>
              </>
            ) : (
              <span>Pas encore d'avis</span>
            )}
          </div>
          {b.description && <p>{b.description}</p>}
          <div className="hero-actions">
            {b.phone && (
              <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="btn btn-primary">
                Appeler
              </a>
            )}
          </div>
        </div>
        <div className="hero-art short">
          <div className="art-sun" />
          <div className="art-note">
            <strong>{b.country?.name || 'Afrique & diaspora'}</strong>
            Une adresse à découvrir
          </div>
        </div>
      </section>

      <div className="form-grid">
        <section className="panel">
          <h3>Coordonnées</h3>
          <p>
            📍 {[b.address, b.city].filter(Boolean).join(', ')}
            {b.phone && (
              <>
                <br />☎ {b.phone}
              </>
            )}
            {b.country?.name && (
              <>
                <br />🌍 Pays d'origine : {b.country.name}
              </>
            )}
            {languages && (
              <>
                <br />💬 Langues : {languages}
              </>
            )}
          </p>
        </section>

        <section className="panel">
          <h3>Horaires</h3>
          {hours.length === 0 ? (
            <p>Horaires non renseignés.</p>
          ) : (
            <table className="hours">
              <tbody>
                {byDay.map((d) => (
                  <tr key={d.label}>
                    <td>{d.label}</td>
                    <td>{d.slots.length ? d.slots.join(', ') : 'Fermé'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {photos.length > 0 && (
        <section className="panel">
          <h3>Photos</h3>
          <div className="photo-grid">
            {photos.map((p) => (
              <img key={p.id} src={storageUrl(p.file_path)} alt={`Photo de ${b.name}`} />
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h3>La communauté en parle</h3>
        {reviews.length === 0 && <p>Aucun avis pour le moment.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="review">
            <div className="rating">{stars(r.rating)}</div>
            {r.comment && <p>« {r.comment} »</p>}
            <small>
              {r.user?.name || 'Un membre'}
              {r.created_at && ` · ${new Date(r.created_at).toLocaleDateString('fr-FR')}`}
            </small>
          </div>
        ))}
      </section>
    </div>
  );
}
