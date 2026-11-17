import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function ContactButton({ business }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const noOwner = !business.owner_id;
  const isOwner = me && business.owner_id === me.id;

  if (isOwner) return null;

  const open = async () => {
    if (!localStorage.getItem('token')) return navigate('/login');
    try {
      const res = await api.post(`/businesses/${business.id}/conversations`);
      navigate(`/messages/${(res.data?.data ?? res.data).id}`);
    } catch {
      setError(t('messages.openError'));
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={open} disabled={noOwner}>
        {t('messages.contact')}
      </button>
      {noOwner && <small className="muted">{t('messages.noOwner')}</small>}
      {error && <small className="alert-error">{error}</small>}
    </>
  );
}