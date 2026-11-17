import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatRating } from '../utils';

const PHOTO_STYLES = ['photo-food', 'photo-style', 'photo-market', 'photo-craft', 'photo-cafe'];

export default function BusinessCard({ business: b, categoryName }) {
  const { t } = useTranslation();
  const photoClass = PHOTO_STYLES[b.id % PHOTO_STYLES.length];
  const hasRating = b.average_rating !== null && b.average_rating !== undefined;

  return (
    <article className="business-card">
      <div className={`photo ${photoClass}`}>
        <span>{(categoryName || t('card.business')).toUpperCase()}</span>
      </div>
      <div className="card-body">
        <div className="card-top">
          <h3>{b.name}</h3>
          {hasRating && <span className="rating">★ {formatRating(b.average_rating)}</span>}
        </div>
        <div className="meta">
          {[categoryName, b.city].filter(Boolean).join(' · ')}
          {b.distance_km !== undefined && b.distance_km !== null && (
            <> · {t('card.distance', { km: formatRating(b.distance_km) })}</>
          )}
        </div>
        <div className="card-foot">
          <span>
            {b.reviews_count > 0
              ? t('card.reviews', { count: b.reviews_count })
              : t('card.noReviews')}
          </span>
          <Link to={`/businesses/${b.id}`} className="btn btn-light">
            {t('card.discover')} ↗
          </Link>
        </div>
      </div>
    </article>
  );
}