import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api';

const PER_PAGE = 15;

// Gestion des comptes (maquette 36, ligne 38) : GET /admin/users, PATCH /admin/users/{id}/status
export default function AdminUsers() {
  const { t, i18n } = useTranslation();
  const me = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [last, setLast] = useState(1);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState('loading');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const seenRoles = useRef(new Set(['admin', 'merchant']));

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedQ(q.trim()); setPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setState('loading');
    try {
      const params = { page, per_page: PER_PAGE };
      if (debouncedQ) params.q = debouncedQ;
      if (status) params.status = status;
      if (role) params.role = role;
      const { data: r } = await api.get('/admin/users', { params });
      const list = r.data ?? r;
      if (list.length === 0 && page > 1) { setPage(page - 1); return; }
      list.forEach((u) => seenRoles.current.add(u.role));
      setItems(list);
      setLast(r.last_page ?? r.meta?.last_page ?? 1);
      setTotal(r.total ?? r.meta?.total ?? list.length);
      setState('ready');
    } catch {
      setState('error');
    }
  }, [page, debouncedQ, status, role]);

  useEffect(() => { load(); }, [load]);

  async function toggle(u) {
    const next = u.status === 'suspended' ? 'active' : 'suspended';
    if (next === 'suspended' && !window.confirm(t('admin.users.confirmSuspend'))) return;
    setBusyId(u.id);
    setError('');
    try {
      await api.patch(`/admin/users/${u.id}/status`, { status: next });
      await load(true);
    } catch (e) {
      setError(e.response?.data?.message || t('admin.actionError'));
    } finally {
      setBusyId(null);
    }
  }

  const roleLabel = (r) => t(`admin.roles.${r}`, { defaultValue: r });

  return (
    <>
      <div className="admin-head">
        <h1 className="admin-h1">{t('admin.users.title')}</h1>
        {state === 'ready' && <p className="muted">{t('admin.users.count', { count: total })}</p>}
      </div>

      <div className="admin-filters">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.users.search')} aria-label={t('admin.users.search')} />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label={t('admin.users.role')}>
          <option value="">{t('admin.users.role')} : {t('admin.users.all')}</option>
          {[...seenRoles.current].map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label={t('admin.queue.filter')}>
          <option value="">{t('admin.queue.filter')} : {t('admin.users.all')}</option>
          <option value="active">{t('admin.status.active')}</option>
          <option value="suspended">{t('admin.status.suspended')}</option>
        </select>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}
      {state === 'loading' && <p className="muted" role="status">…</p>}
      {state === 'error' && <p className="alert alert-error" role="alert">{t('admin.queue.loadError')}</p>}
      {state === 'ready' && items.length === 0 && <div className="panel empty">{t('admin.queue.empty')}</div>}

      {state === 'ready' && items.length > 0 && (
        <div className="admin-table-wrap panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('admin.users.name')}</th>
                <th>{t('admin.users.email')}</th>
                <th>{t('admin.users.role')}</th>
                <th>{t('admin.queue.filter')}</th>
                <th>{t('admin.users.created')}</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => {
                const isMe = me && u.id === me.id;
                const locked = isMe || u.role === 'admin';
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabel(u.role)}</td>
                    <td><span className={chip2(u.status)}>{t(`admin.status.${u.status}`, { defaultValue: u.status })}</span></td>
                    <td>{u.created_at ? new Date(u.created_at).toLocaleDateString(i18n.language) : ''}</td>
                    <td className="admin-cell-action">
                      {locked ? (
                        <span className="muted">{isMe ? t('admin.users.self') : t('admin.users.locked')}</span>
                      ) : (
                        <button type="button" className={`btn ${u.status === 'suspended' ? 'btn-green' : 'btn-outline'}`} disabled={busyId === u.id} onClick={() => toggle(u)}>
                          {u.status === 'suspended' ? t('admin.users.reactivate') : t('admin.users.suspend')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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

function chip2(s) {
  return s === 'suspended' ? 'status off' : 'status';
}
