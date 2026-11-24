import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import api from '../api';

// Bouton « Envoyer un message » sur la fiche (ligne 27) : POST /businesses/{id}/conversations
// <ContactButton business={business} />
export default function ContactButton({ business, className = 'btn btn-green' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  let me = null;
  try { me = JSON.parse(localStorage.getItem('user')); } catch { /* ignoré */ }
  const noOwner = business.owner_id === null;
  const isOwn = !!me && business.owner_id === me.id;
  const hint = noOwner ? t('messages.contactNoOwner') : isOwn ? t('messages.contactOwn') : '';

  async function open() {
    setError('');
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/businesses/${business.id}/conversations`);
      const id = res.data.id ?? res.data.data?.id;
      navigate(`/messages/${id}`);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 422 ? t('messages.contactNoOwner') : status === 403 ? t('messages.contactOwn') : t('messages.loadError'));
      setBusy(false);
    }
  }

  return (
    <span className="contact-wrap">
      <button type="button" className={className} onClick={open} disabled={busy || !!hint} title={hint}>
        <MessageCircle size={18} aria-hidden="true" /> {t('messages.contact')}
      </button>
      {(hint || error) && <small className="muted contact-hint">{error || hint}</small>}
    </span>
  );
}
