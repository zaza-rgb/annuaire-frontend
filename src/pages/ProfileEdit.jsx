import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import api from '../api';
import '../profile-view.css';

const STATUS_CLASS = { active: '', pending: 'wait', suspended: 'off' };
const SUPPORTED = ['fr', 'en', 'pt'];

// Page de modification du profil (/profile/edit).
// La présentation du profil est sur /profile (Profile.jsx).
export default function ProfileEdit() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', language_id: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/me')
      .then((res) => {
        setUser(res.data);
        setForm({
          name: res.data.name || '',
          phone: res.data.phone || '',
          language_id: res.data.language_id || '',
        });
      })
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.patch('/me', {
        name: form.name,
        phone: form.phone === '' ? null : form.phone,
        language_id: Number(form.language_id),
      });
      setUser(res.data);

      // La barre de navigation lit le nom dans le navigateur : on le met à jour aussi
      try {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data }));
      } catch {
        // sans stockage, le nom se mettra à jour à la prochaine connexion
      }

      // La langue préférée devient la langue de l'interface
      const chosen = languages.find((l) => Number(l.id) === Number(form.language_id));
      if (chosen && SUPPORTED.includes(chosen.code)) {
        i18n.changeLanguage(chosen.code);
      }

      // Retour à la page de présentation du profil, avec le message « Profil enregistré »
      navigate('/profile', { state: { saved: true } });
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setMessage(t('profile.saveError'));
      }
    } finally {
      setSaving(false);
    }
  };

  const err = (field) =>
    errors[field] ? <p className="field-error">{errors[field][0]}</p> : null;

  const roleLabel = user ? t(`roles.${user.role}`, { defaultValue: user.role }) : '';
  const statusLabel = user ? t(`status.${user.status}`, { defaultValue: user.status }) : '';
  const statusClass = STATUS_CLASS[user?.status] || '';

  return (
    <div className="page narrow-620">
      <Link to="/profile" className="pv-back">
        <ArrowLeft size={16} aria-hidden="true" /> {t('profile.back')}
      </Link>
      <div className="eyebrow">{t('profile.eyebrow')}</div>
      <h2>{t('profile.title')}</h2>

      {message && <p className="alert alert-error">{message}</p>}
      {!user && !message && <p>{t('profile.loading')}</p>}

      {user && (
        <>
          <div className="panel big">
            <div className="profile-head">
              <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{user.name}</h2>
                <p>{roleLabel}</p>
              </div>
            </div>

            {success && <p className="alert alert-success">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">{t('profile.name')}</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                {err('name')}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="phone">{t('profile.phone')}</label>
                  <input
                    id="phone"
                    name="phone"
                    placeholder="+55 …"
                    value={form.phone}
                    onChange={handleChange}
                  />
                  {err('phone')}
                </div>
                <div className="field">
                  <label htmlFor="language_id">{t('profile.language')}</label>
                  <select
                    id="language_id"
                    name="language_id"
                    value={form.language_id}
                    onChange={handleChange}
                  >
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  {err('language_id')}
                </div>
              </div>

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? t('profile.saving') : t('profile.save')}
              </button>{' '}
              <Link to="/profile" className="btn btn-outline">
                {t('profile.cancel')}
              </Link>
            </form>
          </div>

          <div className="panel">
            <h3>{t('profile.accountInfo')}</h3>
            <p className="lead">{t('profile.readonly')}</p>
            <div className="info-grid">
              <div className="info-item">
                <small>{t('profile.email')}</small>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <small>{t('profile.accountType')}</small>
                <span>{roleLabel}</span>
              </div>
              <div className="info-item">
                <small>{t('profile.status')}</small>
                <span className={`status ${statusClass}`}>{statusLabel}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
