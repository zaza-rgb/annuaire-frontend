import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

// Props :
//   review    : l'avis (id, merchant_reply)
//   ownerId   : owner_id du commerce (le bouton n'apparaît que pour ce propriétaire)
//   onReplied : (facultatif) appelé avec l'avis mis à jour après l'envoi
//
// Ce composant n'affiche PAS la réponse déjà publiée : BusinessDetail le fait déjà
// (review.merchant_reply). Il ne gère que le bouton et le formulaire.
export default function ReviewReply({ review, ownerId, onReplied }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(review?.merchant_reply || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch {
    user = null;
  }

  // Visible seulement pour le propriétaire du commerce
  if (!user || !ownerId || Number(user.id) !== Number(ownerId)) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!reply.trim()) {
      setError(t('reviewReply.errorEmpty'));
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.patch(`/reviews/${review.id}/reply`, {
        reply: reply.trim(),
      });
      setOpen(false);
      if (onReplied) onReplied(data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) setError(t('reviewReply.errorForbidden'));
      else if (status === 404) setError(t('reviewReply.errorNotFound'));
      else if (status === 422) setError(t('reviewReply.errorInvalid'));
      else setError(t('reviewReply.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => setOpen(true)}
      >
        {review.merchant_reply
          ? t('reviewReply.edit')
          : t('reviewReply.reply')}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="field">
      <textarea
        rows={3}
        maxLength={2000}
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder={t('reviewReply.placeholder')}
      />
      {error && <div className="alert-error">{error}</div>}
      <div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t('reviewReply.sending') : t('reviewReply.send')}
        </button>{' '}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setOpen(false)}
        >
          {t('reviewReply.cancel')}
        </button>
      </div>
    </form>
  );
}
