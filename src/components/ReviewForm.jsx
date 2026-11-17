import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

// Props :
//   businessId  : id du commerce
//   onSubmitted : (facultatif) appelé après un envoi réussi
export default function ReviewForm({ businessId, onSubmitted }) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="panel">
        <p>
          <Link to="/login">{t('reviewForm.loginToReview')}</Link>
        </p>
      </div>
    );
  }

  if (success) {
    return <div className="alert-success">{t('reviewForm.success')}</div>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (rating < 1) {
      setError(t('reviewForm.errorRating'));
      return;
    }

    setLoading(true);
    try {
      await api.post(`/businesses/${businessId}/reviews`, {
        rating,
        comment: comment.trim() || null,
      });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError(t('reviewForm.errorAlready'));
      else if (status === 403) setError(t('reviewForm.errorOwn'));
      else if (status === 401) setError(t('reviewForm.errorLogin'));
      else if (status === 422) setError(t('reviewForm.errorInvalid'));
      else setError(t('reviewForm.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h3>{t('reviewForm.title')}</h3>

      <div className="field">
        <label>{t('reviewForm.rating')}</label>
        <div role="radiogroup" aria-label={t('reviewForm.rating')}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.8rem',
                lineHeight: 1,
                padding: '0 2px',
                color: n <= (hover || rating) ? 'var(--gold)' : 'var(--line)',
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="review-comment">{t('reviewForm.comment')}</label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={2000}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('reviewForm.commentPlaceholder')}
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? t('reviewForm.sending') : t('reviewForm.submit')}
      </button>
    </form>
  );
}
