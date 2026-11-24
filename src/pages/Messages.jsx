import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send } from 'lucide-react';
import api from '../api';

const POLL_MS = 5000; // messages de la conversation ouverte
const LIST_MS = 15000; // liste des conversations

function readUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

// Nom de l'autre personne : le commerce pour le client, le client pour le propriétaire.
function peerOf(conv, me) {
  if (!conv) return { name: '', sub: '' };
  const isClient = me && conv.client?.id === me.id;
  return isClient
    ? { name: conv.business?.name ?? '', sub: conv.business?.city ?? '' }
    : { name: conv.client?.name ?? '', sub: conv.business?.name ?? '' };
}

// Pages Messagerie (/messages et /messages/:id), lignes 26 à 30.
export default function Messages() {
  const { id } = useParams();
  const activeId = id ? Number(id) : null;
  const { t, i18n } = useTranslation();
  const me = useMemo(readUser, []);
  const [convs, setConvs] = useState([]);
  const [listState, setListState] = useState('loading');
  const refetchedFor = useRef(null);

  const loadConvs = useCallback(async () => {
    try {
      const { data: r } = await api.get('/conversations', { params: { per_page: 50 } });
      setConvs(r.data ?? r);
      setListState('ready');
    } catch {
      setListState((s) => (s === 'ready' ? s : 'error'));
    }
  }, []);

  useEffect(() => {
    loadConvs();
    const timer = setInterval(loadConvs, LIST_MS);
    return () => clearInterval(timer);
  }, [loadConvs]);

  const active = convs.find((c) => c.id === activeId) ?? null;

  // Conversation tout juste créée : elle n'est pas encore dans la liste chargée.
  useEffect(() => {
    if (activeId && !active && listState === 'ready' && refetchedFor.current !== activeId) {
      refetchedFor.current = activeId;
      loadConvs();
    }
  }, [activeId, active, listState, loadConvs]);

  const time = (iso) => {
    const d = new Date(iso);
    const sameDay = d.toDateString() === new Date().toDateString();
    return sameDay
      ? d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' });
  };

  const peer = peerOf(active, me);

  return (
    <main className="page page-wide">
      <h1 className="msg-title">{t('messages.title')}</h1>
      <div className={`msg-layout${activeId ? ' has-active' : ''}`}>
        <aside className="msg-list" aria-label={t('messages.title')}>
          {listState === 'loading' && <p className="muted msg-pad" role="status">…</p>}
          {listState === 'error' && <p className="alert-error msg-pad" role="alert">{t('messages.loadError')}</p>}
          {listState === 'ready' && convs.length === 0 && (
            <div className="msg-pad">
              <h2>{t('messages.empty')}</h2>
              <p className="muted">{t('messages.emptyText')}</p>
              <Link to="/businesses" className="btn btn-primary">{t('favorites.explore')}</Link>
            </div>
          )}
          <ul>
            {convs.map((c) => {
              const p = peerOf(c, me);
              return (
                <li key={c.id}>
                  <Link to={`/messages/${c.id}`} className={`msg-item${c.id === activeId ? ' is-active' : ''}`} aria-current={c.id === activeId ? 'true' : undefined}>
                    <span className="msg-avatar" aria-hidden="true">{p.name?.[0]}</span>
                    <span className="msg-item-main">
                      <span className="msg-item-top">
                        <strong>{p.name}</strong>
                        {c.last_message?.created_at && <time dateTime={c.last_message.created_at}>{time(c.last_message.created_at)}</time>}
                      </span>
                      <span className="msg-item-preview">{c.last_message?.content ?? ''}</span>
                    </span>
                    {c.unread_count > 0 && (
                      <span className="msg-badge" aria-label={t('messages.unread', { count: c.unread_count })}>{c.unread_count}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="msg-pane">
          {activeId ? (
            <Thread key={activeId} id={activeId} me={me} peer={peer} onActivity={loadConvs} />
          ) : (
            <p className="muted msg-placeholder">{t('messages.select')}</p>
          )}
        </section>
      </div>
    </main>
  );
}

function Thread({ id, me, peer, onActivity }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState('loading');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const lastId = useRef(0);
  const box = useRef(null);

  useEffect(() => { lastId.current = messages.length ? messages[messages.length - 1].id : 0; }, [messages]);

  // Les messages arrivent du plus récent au plus ancien : on trie par id croissant.
  const merge = useCallback((incoming) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      incoming.forEach((m) => byId.set(m.id, m));
      return [...byId.values()].sort((a, b) => a.id - b.id);
    });
  }, []);

  const markRead = useCallback(async () => {
    try {
      const { data: r } = await api.patch(`/conversations/${id}/read`);
      if (r?.marked > 0) onActivity();
    } catch { /* sans gravité */ }
  }, [id, onActivity]);

  // Chargement initial
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: r } = await api.get(`/conversations/${id}/messages`, { params: { per_page: 50 } });
        if (cancelled) return;
        merge(r.data ?? r);
        setState('ready');
        markRead();
      } catch (err) {
        if (cancelled) return;
        if ([403, 404].includes(err.response?.status)) navigate('/messages', { replace: true });
        else setState('error');
      }
    })();
    return () => { cancelled = true; };
  }, [id, merge, markRead, navigate]);

  // Actualisation régulière : seulement les nouveaux messages (after_id)
  useEffect(() => {
    if (state !== 'ready') return undefined;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const { data: r } = await api.get(`/conversations/${id}/messages`, { params: { after_id: lastId.current } });
        const fresh = r.data ?? r;
        if (fresh.length) {
          merge(fresh);
          if (fresh.some((m) => m.user_id !== me?.id)) markRead();
        }
      } catch { /* on réessaiera */ }
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [state, id, me, merge, markRead]);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [messages.length]);

  async function send(e) {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setError('');
    try {
      const { data: r } = await api.post(`/conversations/${id}/messages`, { content });
      const msg = r.data ?? r;
      if (msg?.id) merge([msg]);
      setText('');
      onActivity();
    } catch {
      setError(t('messages.sendError'));
    } finally {
      setSending(false);
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) send(e);
  };

  const dayLabel = (iso) => new Date(iso).toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="thread">
      <header className="thread-head">
        <Link to="/messages" className="thread-back" aria-label={t('messages.back')}><ArrowLeft size={20} aria-hidden="true" /></Link>
        <span className="msg-avatar" aria-hidden="true">{peer.name?.[0]}</span>
        <div>
          <strong>{peer.name}</strong>
          {peer.sub && <small className="muted">{peer.sub}</small>}
        </div>
      </header>

      <div className="thread-body" ref={box}>
        {state === 'loading' && <p className="muted" role="status">…</p>}
        {state === 'error' && <p className="alert-error" role="alert">{t('messages.loadError')}</p>}
        {state === 'ready' && messages.length === 0 && <p className="muted msg-placeholder">{t('messages.noMessages')}</p>}
        {messages.map((m, i) => {
          const mine = m.user_id === me?.id;
          const newDay = i === 0 || new Date(messages[i - 1].created_at).toDateString() !== new Date(m.created_at).toDateString();
          return (
            <div key={m.id}>
              {newDay && <p className="thread-day">{dayLabel(m.created_at)}</p>}
              <div className={`bubble ${mine ? 'mine' : 'theirs'}`}>
                <p>{m.content}</p>
                <time dateTime={m.created_at}>{new Date(m.created_at).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</time>
              </div>
            </div>
          );
        })}
      </div>

      <form className="thread-form" onSubmit={send}>
        {error && <p className="alert-error" role="alert">{error}</p>}
        <div className="thread-input">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={t('messages.placeholder')}
            aria-label={t('messages.placeholder')}
            maxLength={2000}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
            <Send size={18} aria-hidden="true" /> {t('messages.send')}
          </button>
        </div>
      </form>
    </div>
  );
}
