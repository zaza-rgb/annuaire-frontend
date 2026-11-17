import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function Register() {
  const { t, i18n } = useTranslation();
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
        // On présélectionne la langue actuellement utilisée par l'interface
        const current = res.data.find((l) => l.code === i18n.resolvedLanguage) || res.data[0];
        if (current) {
          setForm((f) => ({ ...f, language_id: current.id }));
        }
      })
      .catch(() => setMessage(t('auth.register.languagesError')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setMessage(t('common.error'));
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
        <div className="eyebrow">{t('auth.register.eyebrow')}</div>
        <h2>{t('auth.register.title')}</h2>

        {message && <p className="alert alert-error">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">{t('auth.register.name')}</label>
            <input
              id="name"
              name="name"
              placeholder={t('auth.register.namePlaceholder')}
              value={form.name}
              onChange={handleChange}
            />
            {err('name')}
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="email">{t('auth.register.email')}</label>
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
              <label htmlFor="phone">{t('auth.register.phone')}</label>
              <input id="phone" name="phone" placeholder="+55 …" value={form.phone} onChange={handleChange} />
              {err('phone')}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="password">{t('auth.register.password')}</label>
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
              <label htmlFor="password_confirmation">{t('auth.register.confirm')}</label>
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
              <label htmlFor="language_id">{t('auth.register.language')}</label>
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
              <label htmlFor="account_type">{t('auth.register.accountType')}</label>
              <select id="account_type" name="account_type" value={form.account_type} onChange={handleChange}>
                <option value="user">{t('auth.register.typeUser')}</option>
                <option value="merchant">{t('auth.register.typeMerchant')}</option>
              </select>
              {err('account_type')}
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </button>
        </form>

        <p className="auth-foot">
          {t('auth.register.already')} <Link to="/login">{t('auth.register.login')}</Link>
        </p>
      </div>
    </div>
  );
}