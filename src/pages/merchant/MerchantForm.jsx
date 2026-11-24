import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import LocationPicker from '../../components/LocationPicker.jsx';
import MerchantNav from '../../components/MerchantNav.jsx';
import '../../merchant.css';

// Formulaire « Inscrire mon commerce » : POST /businesses (ligne 20 de la checklist).
// Le serveur fixe status = pending et owner_id. Les langues et les horaires se règlent ensuite
// sur la page de modification, car POST /businesses ne les accepte pas.
export default function MerchantForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    country_id: '',
    city: '',
    address: '',
    phone: '',
    description: '',
    pricing: '',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/countries')])
      .then(([c, p]) => {
        setCategories(c.data);
        setCountries(p.data);
      })
      .catch(() => setMessage(t('merchant.form.loadError')));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');
    setLoading(true);

    // On n'envoie que ce qui est rempli ; latitude et longitude vont ensemble
    const payload = {};
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null) payload[k] = typeof v === 'string' ? v.trim() : v;
    });
    if (payload.latitude === undefined || payload.longitude === undefined) {
      delete payload.latitude;
      delete payload.longitude;
    }

    try {
      const { data } = await api.post('/businesses', payload);
      navigate(`/merchant/${data.id}/edit`, { state: { created: true } });
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setMessage(t('merchant.form.error'));
      } else if (error.response?.status === 403) {
        setMessage(t('merchant.form.forbidden'));
      } else {
        setMessage(t('merchant.form.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const err = (field) => (errors[field] ? <p className="field-error">{errors[field][0]}</p> : null);

  return (
    <div className="page narrow-620">
      <MerchantNav />

      <div className="panel big">
        <div className="eyebrow">{t('merchant.form.eyebrow')}</div>
        <h2>{t('merchant.form.title')}</h2>
        <p className="m-muted">{t('merchant.form.intro')}</p>

        {message && <p className="alert alert-error">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">{t('merchant.form.name')}</label>
            <input id="name" name="name" maxLength={150} value={form.name} onChange={handleChange} />
            {err('name')}
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="category_id">{t('merchant.form.category')}</label>
              <select id="category_id" name="category_id" value={form.category_id} onChange={handleChange}>
                <option value="">{t('merchant.form.choose')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err('category_id')}
            </div>
            <div className="field">
              <label htmlFor="country_id">{t('merchant.form.country')}</label>
              <select id="country_id" name="country_id" value={form.country_id} onChange={handleChange}>
                <option value="">{t('merchant.form.choose')}</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {err('country_id')}
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="city">{t('merchant.form.city')}</label>
              <input id="city" name="city" maxLength={100} value={form.city} onChange={handleChange} />
              {err('city')}
            </div>
            <div className="field">
              <label htmlFor="phone">{t('merchant.form.phone')}</label>
              <input id="phone" name="phone" maxLength={20} placeholder="+55 …" value={form.phone} onChange={handleChange} />
              {err('phone')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="address">{t('merchant.form.address')}</label>
            <input id="address" name="address" maxLength={255} value={form.address} onChange={handleChange} />
            {err('address')}
          </div>

          <div className="field">
            <label htmlFor="description">{t('merchant.form.description')}</label>
            <textarea id="description" name="description" rows={4} value={form.description} onChange={handleChange} />
            {err('description')}
          </div>

          <div className="field">
            <label htmlFor="pricing">{t('merchant.form.pricing')}</label>
            <textarea
              id="pricing"
              name="pricing"
              rows={2}
              placeholder={t('merchant.form.pricingPlaceholder')}
              value={form.pricing}
              onChange={handleChange}
            />
            {err('pricing')}
          </div>

          <div className="field">
            <label>{t('merchant.form.mapTitle')}</label>
            <p className="m-muted">{t('merchant.form.mapHint')}</p>
            <LocationPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(la, ln) => setForm((f) => ({ ...f, latitude: la, longitude: ln }))}
            />
            {err('latitude')}
            {err('longitude')}
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? t('merchant.form.submitting') : t('merchant.form.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
