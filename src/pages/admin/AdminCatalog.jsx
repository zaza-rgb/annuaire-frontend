import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../api';


// Gestion des catégories, pays et langues (lignes 39 à 41) : une seule page, choisie par la prop `kind`.
// Routes API : GET /{kind} (public, noms dans la langue demandée),
//              POST /admin/{kind}, PUT /admin/{kind}/{id}, DELETE /admin/{kind}/{id}.
//
// À CONFIRMER au premier test : la forme exacte du corps envoyé (fonction buildPayload ci-dessous).
// Hypothèse : { code, translations: { fr, en, pt } } pour catégories et pays, { code, name } pour les langues.

const LANGS = ['fr', 'en', 'pt'];

const CONFIG = {
  categories: { translated: true, upper: false },
  countries: { translated: true, upper: true },
  languages: { translated: false, upper: false },
};

const emptyForm = (translated) => ({
  id: null,
  code: '',
  originalCode: '',
  names: { fr: '', en: '', pt: '' },
  name: '',
  translated,
});

function buildPayload(kind, f) {
  const cfg = CONFIG[kind];
  const code = cfg.upper ? f.code.trim().toUpperCase() : f.code.trim().toLowerCase();
  const payload = {};
  // Sur une modification, on n'envoie le code que s'il a changé (fr, en, pt ne peuvent pas être renommées)
  if (!f.id || code !== f.originalCode) payload.code = code;
  if (cfg.translated) {
    payload.translations = { fr: f.names.fr.trim(), en: f.names.en.trim(), pt: f.names.pt.trim() };
  } else {
    payload.name = f.name.trim();
  }
  return payload;
}

function errorText(err, fallback) {
  const data = err?.response?.data;
  const first = data?.errors ? Object.values(data.errors).flat()[0] : null;
  return first || data?.message || fallback;
}

const unwrap = (res) => {
  const d = res.data?.data ?? res.data;
  return Array.isArray(d) ? d : [];
};

export default function AdminCatalog({ kind }) {
  const { t } = useTranslation();
  const cfg = CONFIG[kind];

  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      if (cfg.translated) {
        // La liste publique renvoie le nom dans la langue demandée : une requête par langue pour récupérer les trois traductions.
        const lists = await Promise.all(
          LANGS.map((lng) => api.get(`/${kind}`, { headers: { 'Accept-Language': lng }, params: { per_page: 100 } }).then(unwrap))
        );
        const map = new Map();
        lists.forEach((list, i) => {
          list.forEach((it) => {
            const row = map.get(it.id) || { id: it.id, code: it.code, names: {} };
            row.names[LANGS[i]] = it.name;
            map.set(it.id, row);
          });
        });
        setRows([...map.values()]);
      } else {
        const list = await api.get(`/${kind}`).then(unwrap);
        setRows(list.map((it) => ({ id: it.id, code: it.code, name: it.name })));
      }
    } catch {
      setError(t('admin.catalog.loadError'));
      setRows([]);
    }
  }, [kind, cfg.translated, t]);

  useEffect(() => {
    setRows(null);
    setForm(null);
    load();
  }, [load]);

  const startAdd = () => {
    setFormError('');
    setForm(emptyForm(cfg.translated));
  };

  const startEdit = (row) => {
    setFormError('');
    setForm({
      id: row.id,
      code: row.code,
      originalCode: row.code,
      names: { fr: row.names?.fr || '', en: row.names?.en || '', pt: row.names?.pt || '' },
      name: row.name || '',
      translated: cfg.translated,
    });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = buildPayload(kind, form);
      if (form.id) await api.put(`/admin/${kind}/${form.id}`, payload);
      else await api.post(`/admin/${kind}`, payload);
      setForm(null);
      await load();
    } catch (err) {
      setFormError(errorText(err, t('admin.catalog.error')));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    const name = cfg.translated ? row.names?.fr || row.code : row.name || row.code;
    if (!window.confirm(t('admin.catalog.confirm', { name }))) return;
    setError('');
    try {
      await api.delete(`/admin/${kind}/${row.id}`);
      await load();
    } catch (err) {
      // 409 : élément encore utilisé par une fiche, un compte ou une traduction
      setError(errorText(err, t('admin.catalog.error')));
    }
  };

  const setName = (lng, value) => setForm((f) => ({ ...f, names: { ...f.names, [lng]: value } }));

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-h1">{t(`admin.catalog.title.${kind}`)}</h1>
        {!form && (
          <button type="button" className="btn btn-primary" onClick={startAdd}>
            <Plus size={16} aria-hidden="true" /> {t('admin.catalog.add')}
          </button>
        )}
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      {form && (
        <form className="panel catalog-form" onSubmit={save}>
          <h2>{form.id ? t('admin.catalog.edit') : t('admin.catalog.add')}</h2>
          <div className="form-grid">
            <label className="field">
              <span>{t('admin.catalog.code')}</span>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                maxLength={cfg.upper || kind === 'languages' ? 2 : 50}
                required
              />
            </label>

            {cfg.translated ? (
              LANGS.map((lng) => (
                <label className="field" key={lng}>
                  <span>{t('admin.catalog.name')} ({lng.toUpperCase()})</span>
                  <input value={form.names[lng]} onChange={(e) => setName(lng, e.target.value)} required />
                </label>
              ))
            ) : (
              <label className="field">
                <span>{t('admin.catalog.name')}</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={50} required />
              </label>
            )}
          </div>

          {formError && <p className="alert alert-error" role="alert">{formError}</p>}

          <div className="catalog-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>{t('admin.catalog.save')}</button>
            <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>{t('admin.catalog.cancel')}</button>
          </div>
        </form>
      )}

      {rows === null ? (
        <p className="muted" role="status">…</p>
      ) : rows.length === 0 ? (
        <p className="panel catalog-empty">{t('admin.catalog.empty')}</p>
      ) : (
        <div className="panel admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.catalog.code')}</th>
                {cfg.translated ? LANGS.map((lng) => <th key={lng}>{lng.toUpperCase()}</th>) : <th>{t('admin.catalog.name')}</th>}
                <th aria-label="actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><code>{row.code}</code></td>
                  {cfg.translated ? LANGS.map((lng) => <td key={lng}>{row.names?.[lng] || '—'}</td>) : <td>{row.name}</td>}
                  <td className="catalog-row-actions">
                    <button type="button" className="btn btn-outline" onClick={() => startEdit(row)} aria-label={t('admin.catalog.edit')}>
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => remove(row)} aria-label={t('admin.catalog.delete')}>
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
