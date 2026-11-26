import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Mail, Pencil, Phone, ShieldCheck } from 'lucide-react';
import api from '../api';
import '../profile-view.css';

const STATUS_CLASS = { active: '', pending: 'wait', suspended: 'off' };

// Page « Mon profil » : présentation. La modification se fait sur /profile/edit.
export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [message, setMessage] = useState('');
  const [saved] = useState(Boolean(location.state?.saved));

  // Message « Profil enregistré » affiché une seule fois après la modification
  useEffect(() => {
    if (location.state?.saved) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api
      .get('/me')
      .then((res) => setUser(res.data))
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          setMessage(t('profile.loadError'));
        }
      });
    api.get('/languages').then((res) => setLanguages(res.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const roleLabel = user ? t(`roles.${user.role}`, { defaultValue: user.role }) : '';
  const statusLabel = user ? t(`status.${user.status}`, { defaultValue: user.status }) : '';
  const statusClass = STATUS_CLASS[user?.status] || '';
  const languageName =
    languages.find((l) => Number(l.id) === Number(user?.language_id))?.name || '';
  const empty = t('profile.notProvided');

  return (
    <div className="page profile-view">
      {message && <p className="alert alert-error">{message}</p>}
      {!user && !message && <p>{t('profile.loading')}</p>}

      {user && (
        <>
          {saved && (
            <p className="alert alert-success">
              {t('profile.saved')}
            </p>
          )}

          <section className="pv-card">
            <div className="pv-banner" aria-hidden="true" />

            <div className="pv-head">
              <div className="pv-avatar">{user.name?.charAt(0).toUpperCase()}</div>

              <div className="pv-id">
                <h2 className="pv-name">{user.name}</h2>
                <p className="pv-meta">
                  <span className="pv-role">{roleLabel}</span>
                  <span className={`status ${statusClass}`}>{statusLabel}</span>
                </p>
              </div>

              <Link to="/profile/edit" className="btn btn-primary pv-edit">
                <Pencil size={16} /> {t('profile.edit')}
              </Link>
            </div>

            <div className="pv-grid">
              <div className="pv-item">
                <Mail size={18} aria-hidden="true" />
                <div>
                  <small>{t('profile.email')}</small>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="pv-item">
                <Phone size={18} aria-hidden="true" />
                <div>
                  <small>{t('profile.phone')}</small>
                  <span>{user.phone || empty}</span>
                </div>
              </div>
              <div className="pv-item">
                <Globe size={18} aria-hidden="true" />
                <div>
                  <small>{t('profile.language')}</small>
                  <span>{languageName || empty}</span>
                </div>
              </div>
              <div className="pv-item">
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <small>{t('profile.accountType')}</small>
                  <span>{roleLabel}</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
