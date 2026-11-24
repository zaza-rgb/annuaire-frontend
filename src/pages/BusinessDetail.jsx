import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { formatRating, stars, storageUrl } from '../utils';
import ContactButton from '../components/ContactButton.jsx';
import FavoriteButton from '../components/FavoriteButton.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import ReviewReply from '../components/ReviewReply.jsx';

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DATE_LOCALES = { fr: 'fr-FR', en: 'en-US', pt: 'pt-BR' };

// day_of_week : 1 = lundi … 7 = dimanche (ou 0 = dimanche si la base utilise 0 à 6)
function dayIndex(value, sundayIsZero) {
  const n = Number(value);
  if (sundayIsZero) return n === 0 ? 6 : n - 1;
  return n - 1;
}

const hhmm = (t) => (t ? String(t).slice(0, 5) : '');

export default function BusinessDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');

  // Recharge la fiche sans repasser par l'écran « chargement »
  // (utilisé après l'envoi d'un avis ou d'une réponse)
  const reload = () =>
    api
      .get(`/businesses/${id}`)
      .then((res) => setBusiness(res.data))
      .catch(() => {});

  useEffect(() => {
    setBusiness(null);
    setError('');
    api
      .get(`/businesses/${id}`)
      .then((res) => setBusiness(res.data))
      .catch((e) =>
        setError(e.response?.status === 404 ? t('detail.notFound') : t('detail.loadError'))
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (error) {
    return (
      <div className="page">
        <p className="alert alert-error">{error}</p>
        <Link to="/businesses" className="btn btn-light">
          {t('detail.back')}
        </Link>
      </div>
    );
  }
  if (!business) {
    return (
      <div className="page">
        <p>{t('detail.loading')}</p>
      </div>
    );
  }

  const b = business;
  const hours = b.opening_hours || b.openingHours || [];
  const sundayIsZero = hours.some((h) => Number(h.day_of_week) === 0);
  const byDay = DAY_KEYS.map((key, i) => ({
    key,
    slots: hours
      .filter((h) => dayIndex(h.day_of_week, sundayIsZero) === i)
      .map((h) => `${hhmm(h.opens_at)}–${hhmm(h.closes_at)}`),
  }));
  const reviews = b.reviews || [];
  const photos = b.photos || [];
  const languages = (b.languages || []).map((l) => l.name).join(', ');
  const hasRating = b.average_rating !== null && b.average_rating !== undefined;
  const dateLocale = DATE_LOCALES[i18n.resolvedLanguage] || 'fr-FR';

  return (
    <div className="page">
      <Link to="/businesses" className="btn btn-light">
        {t('detail.back')}
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
                <span>({t('card.reviews', { count: b.reviews_count })})</span>
              </>
            ) : (
              <span>{t('card.noReviews')}</span>
            )}
          </div>
          {b.description && <p>{b.description}</p>}
          <div className="hero-actions">
            {b.phone && (
              <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="btn btn-primary">
                {t('detail.call')}
              </a>
            )}
            <ContactButton business={b} />
            <FavoriteButton businessId={b.id} />
          </div>
        </div>
        <div className="hero-art short">
          <div className="art-sun" />
          <div className="art-note">
            <strong>{b.country?.name || t('detail.fallbackCountry')}</strong>
            {t('detail.artNote')}
          </div>
        </div>
      </section>

      <div className="form-grid">
        <section className="panel">
          <h3>{t('detail.contact')}</h3>
          <p>
            📍 {[b.address, b.city].filter(Boolean).join(', ')}
            {b.phone && (
              <>
                <br />☎ {b.phone}
              </>
            )}
            {b.country?.name && (
              <>
                <br />🌍 {t('detail.origin')} : {b.country.name}
              </>
            )}
            {languages && (
              <>
                <br />💬 {t('detail.languages')} : {languages}
              </>
            )}
          </p>
        </section>

        <section className="panel">
          <h3>{t('detail.hours')}</h3>
          {hours.length === 0 ? (
            <p>{t('detail.noHours')}</p>
          ) : (
            <table className="hours">
              <tbody>
                {byDay.map((d) => (
                  <tr key={d.key}>
                    <td>{t(`days.${d.key}`)}</td>
                    <td>{d.slots.length ? d.slots.join(', ') : t('detail.closed')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {photos.length > 0 && (
        <section className="panel">
          <h3>{t('detail.photos')}</h3>
          <div className="photo-grid">
            {photos.map((p) => (
              <img
                key={p.id}
                src={storageUrl(p.file_path)}
                alt={t('detail.photoAlt', { name: b.name })}
              />
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h3>{t('detail.community')}</h3>
        {reviews.length === 0 && <p>{t('detail.noReviews')}</p>}
        {reviews.map((r) => (
          <div key={r.id} className="review">
            <div className="rating">{stars(r.rating)}</div>
            {r.comment && <p>« {r.comment} »</p>}
            <small>
              {r.user?.name || t('detail.member')}
              {r.created_at && ` · ${new Date(r.created_at).toLocaleDateString(dateLocale)}`}
            </small>

            {r.merchant_reply && (
              <div className="review-reply" style={{ marginTop: 8, paddingLeft: 12, borderLeft: '3px solid var(--gold)' }}>
                <strong>{t('detail.ownerReply')}</strong>
                <p>{r.merchant_reply}</p>
              </div>
            )}

            <ReviewReply review={r} ownerId={b.owner_id} onReplied={reload} />
          </div>
        ))}
      </section>

      <ReviewForm businessId={b.id} onSubmitted={reload} />
    </div>
  );
}