import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import api from '../api';

// Formulaire d'avis (ligne 16) : POST /businesses/{id}/reviews
// <ReviewForm businessId={business.id} onSubmitted={reload} />
export default function ReviewForm({ businessId, onSent, onSubmitted }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  if (!localStorage.getItem('token')) {
    return (
      <div className="panel review-form">
        <h3>{t('review.title')}</h3>
        <p className="muted">{t('review.loginRequired')}</p>
        <Link to="/login" className="btn btn-primary">{t('review.login')}</Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="panel review-form">
        <p className="alert-success" role="status">{t('review.sent')}</p>
      </div>
    );
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (rating < 1) {
      setError(t('review.chooseRating'));
      return;
    }
    setBusy(true);
    try {
      await api.post(`/businesses/${businessId}/reviews`, {
        rating,
        comment: comment.trim() || null,
      });
      setSent(true);
      onSent?.();
      onSubmitted?.(); // la fiche se recharge (BusinessDetail passe onSubmitted={reload})
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError(t('review.already'));
      else if (status === 403) setError(t('review.own'));
      else if (status === 401) setError(t('review.loginRequired'));
      else setError(err.response?.data?.message || t('review.error'));
    } finally {
      setBusy(false);
    }
  }

  const shown = hover || rating;
  return (
    <form className="panel review-form" onSubmit={submit} noValidate>
      <h3>{t('review.title')}</h3>

      <div className="field">
        <span id="rating-label">{t('review.rating')}</span>
        <div className="star-picker" role="radiogroup" aria-labelledby="rating-label" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={t('review.ratingValue', { n })}
              className={n <= shown ? 'on' : ''}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              <Star size={26} fill={n <= shown ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span>{t('review.comment')}</span>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('review.commentPlaceholder')}
        />
      </label>

      {error && <p className="alert-error" role="alert">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>{t('review.submit')}</button>
    </form>
  );
}