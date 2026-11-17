import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function Login() {
  const { t } = useTranslation();
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
        setMessage(t('common.error'));
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
        <div className="eyebrow">{t('auth.login.eyebrow')}</div>
        <h2>{t('auth.login.title')}</h2>
        <p className="lead">{t('auth.login.lead')}</p>

        {message && <p className="alert alert-error">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">{t('auth.login.email')}</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              value={form.email}
              onChange={handleChange}
            />
            {err('email')}
          </div>

          <div className="field">
            <label htmlFor="password">{t('auth.login.password')}</label>
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
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </button>
        </form>

        <p className="auth-foot">
          {t('auth.login.noAccount')} <Link to="/register">{t('auth.login.createAccount')}</Link>
        </p>
      </div>
    </div>
  );
}