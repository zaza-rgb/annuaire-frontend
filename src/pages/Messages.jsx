import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';

const unwrap = (res) => res.data?.data ?? res.data ?? [];

export default function Messages() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      setConversations(unwrap(await api.get('/conversations')));
    } catch {
      setError(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const list = unwrap(await api.get(`/conversations/${id}/messages`));
      setMessages([...list].reverse()); // l'API renvoie du plus récent au plus ancien
      if (list.some((m) => m.user_id !== me?.id && !m.read_at)) {
        await api.patch(`/conversations/${id}/read`);
        loadConversations();
      }
    } catch {
      setError(t('messages.loadError'));
    }
  }, [id, me?.id, loadConversations, t]);

  useEffect(() => {
    loadConversations();
    const timer = setInterval(loadConversations, 15000);
    return () => clearInterval(timer);
  }, [loadConversations]);

  useEffect(() => {
    setMessages([]);
    loadMessages();
    if (!id) return;
    const timer = setInterval(loadMessages, 5000);
    return () => clearInterval(timer);
  }, [id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const otherName = (c) =>
    c.customer?.id === me?.id ? c.business?.name : c.customer?.name ?? c.user?.name;

  const send = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    setError('');
    try {
      await api.post(`/conversations/${id}/messages`, { content });
      setText('');
      await loadMessages();
      loadConversations();
    } catch (err) {
      setError(err.response?.status === 422 ? t('messages.tooLong') : t('messages.sendError'));
    }
  };

  const active = conversations.find((c) => String(c.id) === String(id));

  return (
    <div className="page messages-page">
      <h1>{t('messages.title')}</h1>
      {error && <p className="alert-error">{error}</p>}

      <div className={`messages-layout ${id ? 'has-active' : ''}`}>
        <aside className="conv-list panel">
          {loading && <p>{t('messages.loading')}</p>}
          {!loading && conversations.length === 0 && <p className="muted">{t('messages.empty')}</p>}
          {conversations.map((c) => (
            <Link
              key={c.id}
              to={`/messages/${c.id}`}
              className={`conv-item ${String(c.id) === String(id) ? 'active' : ''}`}
            >
              <div className="conv-top">
                <strong>{otherName(c)}</strong>
                {c.unread_count > 0 && <span className="badge-unread">{c.unread_count}</span>}
              </div>
              <small className="muted">{c.business?.name}</small>
              <p className="conv-last">{c.last_message?.content}</p>
            </Link>
          ))}
        </aside>

        <section className="chat panel">
          {!id ? (
            <p className="muted">{t('messages.select')}</p>
          ) : (
            <>
              <header className="chat-head">
                <Link to="/messages" className="chat-back">← {t('messages.back')}</Link>
                <strong>{active ? otherName(active) : ''}</strong>
              </header>
              <div className="chat-body">
                {messages.map((m) => (
                  <div key={m.id} className={`bubble ${m.user_id === me?.id ? 'mine' : 'theirs'}`}>
                    <p>{m.content}</p>
                    <small>{new Date(m.created_at).toLocaleString(i18n.language)}</small>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form className="chat-form" onSubmit={send}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={2000}
                  placeholder={t('messages.placeholder')}
                />
                <button className="btn btn-primary" type="submit">{t('messages.send')}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}