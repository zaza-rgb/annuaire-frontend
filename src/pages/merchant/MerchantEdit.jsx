import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { storageUrl } from '../../utils';
import MerchantNav from '../../components/MerchantNav.jsx';
import '../../merchant.css';

const DAYS = [1, 2, 3, 4, 5, 6, 7]; // 1 = lundi … 7 = dimanche (comme l'API)
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO = 4 * 1024 * 1024;

const hhmm = (v) => (v ? String(v).slice(0, 5) : '');
const emptyHours = () => Object.fromEntries(DAYS.map((d) => [d, []]));

function hoursFromList(list) {
  const out = emptyHours();
  (list || []).forEach((h) => {
    const n = Number(h.day_of_week);
    const d = n === 0 ? 7 : n;
    if (out[d]) out[d].push({ opens_at: hhmm(h.opens_at), closes_at: hhmm(h.closes_at) });
  });
  return out;
}

// Premier message d'erreur d'une réponse 422 de Laravel
function firstError(err) {
  const errors = err.response?.data?.errors;
  if (!errors) return null;
  const first = Object.values(errors)[0];
  return Array.isArray(first) ? first[0] : String(first);
}

// Page « Modifier ma fiche » (lignes 21, 22 et 17 de la checklist).
// La fiche vient de GET /my-businesses (GET /businesses/{id} refuse les fiches non validées).
export default function MerchantEdit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const justCreated = Boolean(location.state?.created);

  const [business, setBusiness] = useState(null);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);

  const [info, setInfo] = useState({ description: '', pricing: '', phone: '', country_id: '' });
  const [languageIds, setLanguageIds] = useState([]);
  const [infoState, setInfoState] = useState({ busy: false, ok: '', err: '' });

  const [hours, setHours] = useState(emptyHours());
  const [hoursState, setHoursState] = useState({ busy: false, ok: '', err: '' });

  const [photos, setPhotos] = useState([]);
  const [photoState, setPhotoState] = useState({ busy: false, ok: '', err: '' });

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/my-businesses', { params: { per_page: 100 } }), api.get('/countries'), api.get('/languages')])
      .then(([mine, c, l]) => {
        if (!alive) return;
        const b = (mine.data.data || []).find((x) => String(x.id) === String(id));
        if (!b) {
          setError(t('merchant.edit.notFound'));
          return;
        }
        setBusiness(b);
        setCountries(c.data);
        setLanguages(l.data);
        setInfo({
          description: b.description || '',
          pricing: b.pricing || '',
          phone: b.phone || '',
          country_id: b.country_id || '',
        });
        setLanguageIds((b.languages || []).map((x) => x.id));
        setHours(hoursFromList(b.opening_hours || b.openingHours));
      })
      .catch((e) => {
        if (alive) setError(e.response?.status === 403 ? t('merchant.edit.forbidden') : t('merchant.edit.loadError'));
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Les photos publiées ne sont lisibles que sur une fiche validée
  const loadPhotos = () =>
    api
      .get(`/businesses/${id}`)
      .then((res) => setPhotos(res.data.photos || []))
      .catch(() => {});

  useEffect(() => {
    if (business?.status === 'approved') loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.status, id]);

  // ---------- Informations et langues (PUT /businesses/{id}) ----------
  const saveInfo = async (e) => {
    e.preventDefault();
    setInfoState({ busy: true, ok: '', err: '' });
    const payload = {
      description: info.description,
      pricing: info.pricing,
      phone: info.phone,
      language_ids: languageIds,
    };
    if (info.country_id) payload.country_id = Number(info.country_id);

    try {
      const { data } = await api.put(`/businesses/${id}`, payload);
      setBusiness((b) => ({ ...b, ...data }));
      setInfoState({ busy: false, ok: t('merchant.edit.saved'), err: '' });
    } catch (err) {
      const msg = err.response?.status === 422 ? firstError(err) : null;
      setInfoState({ busy: false, ok: '', err: msg || t('merchant.edit.saveError') });
    }
  };

  const toggleLanguage = (langId) =>
    setLanguageIds((ids) => (ids.includes(langId) ? ids.filter((x) => x !== langId) : [...ids, langId]));

  // ---------- Horaires (PUT /businesses/{id}/opening-hours) ----------
  const addSlot = (d) =>
    setHours((h) => ({ ...h, [d]: [...h[d], { opens_at: '09:00', closes_at: '18:00' }] }));
  const removeSlot = (d, k) => setHours((h) => ({ ...h, [d]: h[d].filter((_, i) => i !== k) }));
  const editSlot = (d, k, field, value) =>
    setHours((h) => ({ ...h, [d]: h[d].map((s, i) => (i === k ? { ...s, [field]: value } : s)) }));

  const hoursProblem = () => {
    for (const d of DAYS) {
      const slots = hours[d];
      for (const s of slots) {
        if (!s.opens_at || !s.closes_at) return t('merchant.edit.hoursIncomplete');
        if (s.opens_at >= s.closes_at) return t('merchant.edit.hoursOrder');
      }
      const sorted = [...slots].sort((a, b) => a.opens_at.localeCompare(b.opens_at));
      for (let k = 1; k < sorted.length; k++) {
        if (sorted[k].opens_at < sorted[k - 1].closes_at) return t('merchant.edit.hoursOverlap');
      }
    }
    return '';
  };

  const saveHours = async () => {
    const problem = hoursProblem();
    if (problem) {
      setHoursState({ busy: false, ok: '', err: problem });
      return;
    }
    setHoursState({ busy: true, ok: '', err: '' });

    const list = DAYS.flatMap((d) => hours[d].map((s) => ({ day_of_week: d, ...s })));
    try {
      const { data } = await api.put(`/businesses/${id}/opening-hours`, { hours: list });
      setHours(hoursFromList(data));
      setHoursState({ busy: false, ok: t('merchant.edit.hoursSaved'), err: '' });
    } catch (err) {
      const msg = err.response?.status === 422 ? firstError(err) : null;
      setHoursState({ busy: false, ok: '', err: msg || t('merchant.edit.saveError') });
    }
  };

  // ---------- Photos (POST /businesses/{id}/photos, multipart) ----------
  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de renvoyer le même fichier
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhotoState({ busy: false, ok: '', err: t('merchant.edit.photoType') });
      return;
    }
    if (file.size > MAX_PHOTO) {
      setPhotoState({ busy: false, ok: '', err: t('merchant.edit.photoTooBig') });
      return;
    }

    setPhotoState({ busy: true, ok: '', err: '' });
    const body = new FormData();
    body.append('photo', file);
    try {
      await api.post(`/businesses/${id}/photos`, body);
      setPhotoState({ busy: false, ok: t('merchant.edit.uploaded'), err: '' });
    } catch (err) {
      const msg = err.response?.status === 422 ? firstError(err) : null;
      setPhotoState({ busy: false, ok: '', err: msg || t('merchant.edit.photoError') });
    }
  };

  if (error) {
    return (
      <div className="page">
        <MerchantNav />
        <p className="alert alert-error">{error}</p>
        <Link to="/merchant" className="btn btn-light">
          {t('merchant.edit.back')}
        </Link>
      </div>
    );
  }
  if (!business) {
    return (
      <div className="page">
        <MerchantNav />
        <p>{t('merchant.dashboard.loading')}</p>
      </div>
    );
  }

  const approved = business.status === 'approved';
  const Msg = ({ s }) => (
    <>
      {s.ok && <p className="m-ok">{s.ok}</p>}
      {s.err && <p className="alert alert-error">{s.err}</p>}
    </>
  );

  return (
    <div className="page">
      <MerchantNav />

      <div className="m-head">
        <div>
          <div className="eyebrow">{t('merchant.edit.eyebrow')}</div>
          <h1>{business.name}</h1>
          <p className="m-muted">
            {[business.category?.name, business.address, business.city].filter(Boolean).join(', ')}{' '}
            <span className={`m-badge m-badge-${business.status}`}>{t(`merchant.status.${business.status}`)}</span>
          </p>
        </div>
        <div className="m-card-actions">
          <Link to="/merchant" className="btn btn-light">
            {t('merchant.edit.back')}
          </Link>
          {approved && (
            <>
              <Link to={`/merchant/${id}/reviews`} className="btn btn-light">
                {t('merchant.dashboard.reviews')}
              </Link>
              <Link to={`/businesses/${id}`} className="btn btn-ghost">
                {t('merchant.edit.viewPublic')}
              </Link>
            </>
          )}
        </div>
      </div>

      {justCreated && <p className="m-ok">{t('merchant.edit.created')}</p>}
      {business.status === 'pending' && !justCreated && <p className="m-note">{t('merchant.dashboard.pendingNote')}</p>}

      {/* Informations et langues */}
      <form className="panel" onSubmit={saveInfo}>
        <h3>{t('merchant.edit.infoTitle')}</h3>
        <p className="m-muted">{t('merchant.edit.fixedNote')}</p>

        <div className="field">
          <label htmlFor="description">{t('merchant.form.description')}</label>
          <textarea
            id="description"
            rows={5}
            value={info.description}
            onChange={(e) => setInfo({ ...info, description: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="pricing">{t('merchant.form.pricing')}</label>
          <textarea
            id="pricing"
            rows={3}
            placeholder={t('merchant.form.pricingPlaceholder')}
            value={info.pricing}
            onChange={(e) => setInfo({ ...info, pricing: e.target.value })}
          />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="phone">{t('merchant.form.phone')}</label>
            <input
              id="phone"
              maxLength={20}
              placeholder="+55 …"
              value={info.phone}
              onChange={(e) => setInfo({ ...info, phone: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="country_id">{t('merchant.form.country')}</label>
            <select
              id="country_id"
              value={info.country_id}
              onChange={(e) => setInfo({ ...info, country_id: e.target.value })}
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="m-langs">
          <legend>{t('merchant.edit.languagesTitle')}</legend>
          {languages.map((l) => (
            <label key={l.id} className="m-check">
              <input type="checkbox" checked={languageIds.includes(l.id)} onChange={() => toggleLanguage(l.id)} />
              {l.name}
            </label>
          ))}
        </fieldset>

        <Msg s={infoState} />
        <button type="submit" className="btn btn-primary" disabled={infoState.busy}>
          {infoState.busy ? t('merchant.edit.saving') : t('merchant.edit.save')}
        </button>
      </form>

      {/* Horaires */}
      <section className="panel">
        <h3>{t('merchant.edit.hoursTitle')}</h3>
        <p className="m-muted">{t('merchant.edit.hoursHint')}</p>

        {DAYS.map((d, i) => (
          <div className="m-hours-row" key={d}>
            <div className="m-hours-day">{t(`days.${DAY_KEYS[i]}`)}</div>
            <div className="m-hours-slots">
              {hours[d].length === 0 && <span className="m-muted">{t('merchant.edit.closed')}</span>}
              {hours[d].map((s, k) => (
                <div className="m-slot" key={k}>
                  <input
                    type="time"
                    aria-label={t('merchant.edit.opens')}
                    value={s.opens_at}
                    onChange={(e) => editSlot(d, k, 'opens_at', e.target.value)}
                  />
                  <span>–</span>
                  <input
                    type="time"
                    aria-label={t('merchant.edit.closes')}
                    value={s.closes_at}
                    onChange={(e) => editSlot(d, k, 'closes_at', e.target.value)}
                  />
                  <button type="button" className="btn btn-ghost" onClick={() => removeSlot(d, k)}>
                    {t('merchant.edit.removeSlot')}
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-light" onClick={() => addSlot(d)}>
                {t('merchant.edit.addSlot')}
              </button>
            </div>
          </div>
        ))}

        <Msg s={hoursState} />
        <button type="button" className="btn btn-primary" onClick={saveHours} disabled={hoursState.busy}>
          {hoursState.busy ? t('merchant.edit.saving') : t('merchant.edit.saveHours')}
        </button>
      </section>

      {/* Photos */}
      <section className="panel">
        <h3>{t('merchant.edit.photosTitle')}</h3>
        {!approved ? (
          <p className="m-muted">{t('merchant.edit.photosLocked')}</p>
        ) : (
          <>
            <p className="m-muted">{t('merchant.edit.photosHint')}</p>
            {photos.length === 0 ? (
              <p className="m-muted">{t('merchant.edit.noPhotos')}</p>
            ) : (
              <div className="photo-grid">
                {photos.map((p) => (
                  <img key={p.id} src={storageUrl(p.file_path)} alt={t('detail.photoAlt', { name: business.name })} />
                ))}
              </div>
            )}
            <Msg s={photoState} />
            <label className={`btn btn-primary m-upload ${photoState.busy ? 'disabled' : ''}`}>
              {photoState.busy ? t('merchant.edit.uploading') : t('merchant.edit.upload')}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPhoto}
                disabled={photoState.busy}
                hidden
              />
            </label>
          </>
        )}
      </section>
    </div>
  );
}
