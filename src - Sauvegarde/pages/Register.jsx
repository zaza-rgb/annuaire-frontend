import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    language_id: '',
    account_type: 'user',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/languages')
      .then((res) => {
        setLanguages(res.data);
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, language_id: res.data[0].id }));
        }
      })
      .catch(() => setMessage("Impossible de charger les langues. Vérifie que l'API tourne."));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/businesses');
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        setMessage('Une erreur est survenue. Réessaie.');
      }
    } finally {
      setLoading(false);
    }
  };

  const err = (field) =>
    errors[field] ? <p className="field-error">{errors[field][0]}</p> : null;

  return (
    <div className="page narrow-620">
      <div className="panel big">
        <div className="eyebrow">Faire partie du réseau</div>
        <h2>Créer votre espace.</h2>

        {message && <p className="alert alert-error">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Nom</label>
            <input id="name" name="name" placeholder="Votre nom" value={form.name} onChange={handleChange} />
            {err('name')}
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={handleChange}
              />
              {err('email')}
            </div>
            <div className="field">
              <label htmlFor="phone">Téléphone (facultatif)</label>
              <input id="phone" name="phone" placeholder="+55 …" value={form.phone} onChange={handleChange} />
              {err('phone')}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
              />
              {err('password')}
            </div>
            <div className="field">
              <label htmlFor="password_confirmation">Confirmer le mot de passe</label>
              <input
                id="password_confirmation"
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="language_id">Langue préférée</label>
              <select id="language_id" name="language_id" value={form.language_id} onChange={handleChange}>
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {err('language_id')}
            </div>
            <div className="field">
              <label htmlFor="account_type">Je suis</label>
              <select id="account_type" name="account_type" value={form.account_type} onChange={handleChange}>
                <option value="user">Un particulier</option>
                <option value="merchant">Un commerçant</option>
              </select>
              {err('account_type')}
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Envoi...' : "Créer mon compte"}
          </button>
        </form>

        <p className="auth-foot">
          Déjà inscrit(e) ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
