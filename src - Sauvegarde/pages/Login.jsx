import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setLoading(true);

    try {
      const res = await api.post('/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/businesses');
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 403) {
        setMessage(error.response.data.message);
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
    <div className="page narrow-520">
      <div className="panel big">
        <div className="eyebrow">Heureux de vous retrouver</div>
        <h2>Entrer dans le cercle.</h2>
        <p className="lead">Connectez-vous pour retrouver vos favoris et vos échanges.</p>

        {message && <p className="alert alert-error">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Adresse e-mail</label>
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
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
            {err('password')}
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-foot">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}