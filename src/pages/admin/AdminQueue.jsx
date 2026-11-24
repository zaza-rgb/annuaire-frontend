import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { stars, storageUrl } from '../../utils';

const PER_PAGE = 10;
const VALIDATE = [
  { status: 'approved', label: 'approve', cls: 'btn-green' },
  { status: 'rejected', label: 'reject', cls: 'btn-outline' },
];

// Une seule page pour cinq files de modération (maquettes 38, 39, 42, 43, 44).
const QUEUES = {
  businesses: { list: '/admin/businesses', patch: (id) => `/admin/businesses/${id}/status`, filters: ['pending', 'approved', 'rejected'], open: 'pending', actions: VALIDATE, reversible: true },
  reviews: { list: '/admin/reviews', patch: (id) => `/admin/reviews/${id}/status`, filters: ['pending', 'approved', 'rejected'], open: 'pending', actions: VALIDATE, reversible: true },
  photos: { list: '/admin/photos', patch: (id) => `/admin/photos/${id}/status`, filters: ['pending', 'approved', 'rejected'], open: 'pending', actions: VALIDATE, reversible: true },
  reports: {
    list: '/admin/reports', patch: (id) => `/admin/reports/${id}`, filters: ['open', 'resolved', 'dismissed'], open: 'open', reversible: false,
    actions: [{ status: 'resolved', label: 'resolve', cls: 'btn-green' }, { status: 'dismissed', label: 'dismiss', cls: 'btn-outline' }],
  },
  claims: {
    list: '/admin/claims', patch: (id) => `/admin/claims/${id}`, filters: ['pending', 'approved', 'rejected'], open: 'pending', reversible: false,
    actions: [{ status: 'approved', label: 'accept', cls: 'btn-green' }, { status: 'rejected', label: 'reject', cls: 'btn-outline' }],
  },
};

const chip = (s) => (['pending', 'open'].includes(s) ? 'status wait' : ['rejected', 'dismissed', 'suspended'].includes(s) ? 'status off' : 'status');
const who = (u) => (u ? `${u.name}${u.email ? ` (${u.email})` : ''}` : '—');

function Body({ kind, item, t }) {
  const biz = item.business?.name;
  switch (kind) {
    case 'businesses':
      return (
        <>
          <h3>{item.name}</h3>
          <p className="muted">{[item.category?.name, item.city, item.country?.name].filter(Boolean).join(' · ')}</p>
          {item.description && <p>{item.description}</p>}
          <p className="queue-meta">
            {t('admin.queue.proposer')} : {who(item.proposer)}
            {item.owner && ` · ${t('admin.queue.owner')} : ${who(item.owner)}`}
          </p>
        </>
      );
    case 'reviews':
      return (
        <>
          <div className="rating">{stars(item.rating)}</div>
          <p>{item.comment || <span className="muted">{t('admin.queue.noText')}</span>}</p>
          <p className="queue-meta">{t('admin.queue.on')} : {biz || '—'} · {t('admin.queue.by')} : {who(item.user)}</p>
        </>
      );
    case 'photos':
      return (
        <>
          <h3>{biz || '—'}</h3>
          <p className="queue-meta">{t('admin.queue.by')} : {who(item.user)}</p>
        </>
      );
    case 'reports':
      return (
        <>
          <h3>{biz || '—'}</h3>
          <p>{item.reason ?? item.message ?? item.description ?? item.comment ?? <span className="muted">{t('admin.queue.noText')}</span>}</p>
          <p className="queue-meta">{t('admin.queue.by')} : {who(item.user)}</p>
        </>
      );
    default: // claims
      return (
        <>
          <h3>{biz || '—'}</h3>
          {(item.message ?? item.comment) && <p>{item.message ?? item.comment}</p>}
          <p className="queue-meta">{t('admin.queue.by')} : {who(item.user)}</p>
        </>
      );
  }
}

// <AdminQueue key="reviews" kind="reviews" />  (la clé force une page neuve quand on change de file)
export default function AdminQueue({ kind }) {
  const cfg = QUEUES[kind];
  const { t, i18n } = useTranslation();
  const [status, setStatus] = useState(cfg.open);
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [last, setLast] = useState(1);
  const [state, setState] = useState('loading');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setState('loading');
    try {
      const { data: r } = await api.get(cfg.list, { params: { status, page, per_page: PER_PAGE } });
      const list = r.data ?? r;
      if (list.length === 0 && page > 1) { setPage(page - 1); return; }
      setItems(list);
      setLast(r.last_page ?? r.meta?.last_page ?? 1);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [cfg, status, page]);

  useEffect(() => { load(); }, [load]);

  async function act(item, next) {
    setBusyId(item.id);
    setError('');
    try {
      await api.patch(cfg.patch(item.id), { status: next });
      await load(true);
    } catch (e) {
      setError(e.response?.data?.message || t('admin.actionError'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-h1">{t(`admin.queue.title.${kind}`)}</h1>
        <label className="admin-filter">
          <span>{t('admin.queue.filter')}</span>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            {cfg.filters.map((s) => <option key={s} value={s}>{t(`admin.status.${s}`)}</option>)}
          </select>
        </label>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {state === 'loading' && <p className="muted" role="status">…</p>}
      {state === 'error' && <p className="alert alert-error" role="alert">{t('admin.queue.loadError')}</p>}
      {state === 'ready' && items.length === 0 && <div className="panel empty">{t('admin.queue.empty')}</div>}

      <ul className="queue">
        {state === 'ready' && items.map((item) => {
          const current = item.status ?? status;
          const actions = cfg.actions.filter((a) => (cfg.reversible ? a.status !== current : current === cfg.open));
          return (
            <li key={item.id} className="panel queue-item">
              {kind === 'photos' && item.file_path && (
                <img className="queue-photo" src={storageUrl(item.file_path)} alt={t('admin.queue.photoAlt', { name: item.business?.name || '' })} loading="lazy" />
              )}
              <div className="queue-body">
                <Body kind={kind} item={item} t={t} />
                <p className="queue-meta">
                  <span className={chip(current)}>{t(`admin.status.${current}`, { defaultValue: current })}</span>
                  {item.created_at && ` ${new Date(item.created_at).toLocaleDateString(i18n.language)}`}
                </p>
              </div>
              {actions.length > 0 && (
                <div className="queue-actions">
                  {actions.map((a) => (
                    <button key={a.status} type="button" className={`btn ${a.cls}`} disabled={busyId === item.id} onClick={() => act(item, a.status)}>
                      {t(`admin.queue.${a.label}`)}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {last > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{t('admin.prev')}</button>
          <span>{t('admin.page', { current: page, last })}</span>
          <button className="btn btn-outline" disabled={page >= last} onClick={() => setPage(page + 1)}>{t('admin.next')}</button>
        </nav>
      )}
    </>
  );
}
