import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const ROLES = { user: 'Particulier', merchant: 'Commerçant', admin: 'Administrateur' };
const STATUS = {
  active: ['Actif', ''],
  pending: ['En attente', 'wait'],
  suspended: ['Suspendu', 'off'],
};

export default function Profile() {
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
          setMessage('Impossible de charger le profil.');
        }
      });

    api.get('/languages').then((res) => setLanguages(res.data)).catch(() => {});
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
      setSuccess('Profil enregistré.');
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setMessage("Impossible d'enregistrer. Réessaie.");
      }
    } finally {
      setSaving(false);
    }
  };

  const err = (field) =>
    errors[field] ? <p className="field-error">{errors[field][0]}</p> : null;

  const [statusLabel, statusClass] = STATUS[user?.status] || [user?.status, ''];

  return (
    <div className="page narrow-620">
      <div className="eyebrow">Paramètres</div>
      <h2>Mon profil</h2>

      {message && <p className="alert alert-error">{message}</p>}
      {!user && !message && <p>Chargement…</p>}

      {user && (
        <>
          <div className="panel big">
            <div className="profile-head">
              <div className="avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h2>{user.name}</h2>
                <p>{ROLES[user.role] || user.role}</p>
              </div>
            </div>

            {success && <p className="alert alert-success">{success}</p>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Nom</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                {err('name')}
              </div>

              <div className="form-grid">
                <div className="field">
                  <label htmlFor="phone">Téléphone</label>
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
                  <label htmlFor="language_id">Langue préférée</label>
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
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </form>
          </div>

          <div className="panel">
            <h3>Informations du compte</h3>
            <p className="lead">Ces informations ne se modifient pas ici.</p>
            <div className="info-grid">
              <div className="info-item">
                <small>E-mail</small>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <small>Type de compte</small>
                <span>{ROLES[user.role] || user.role}</span>
              </div>
              <div className="info-item">
                <small>Statut</small>
                <span className={`status ${statusClass}`}>{statusLabel}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
