import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, Flag, Languages, Link2, Mail, MapPin, MessageCircle, Share2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../api';
import { apiMessage, dateBadge, eventPhotoUrl, formatEventDate, toneClass } from '../eventUtils';
import '../events.css';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || 'fr';
  const loggedIn = Boolean(localStorage.getItem('token'));

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text }
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState({ reason: '', message: '' });
  const [copied, setCopied] = useState(false);

  const loadEvent = useCallback(() => api.get(`/events/${id}`).then((res) => setEvent(res.data)), [id]);

  // Fiche de l'événement
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setFeedback(null);
    loadEvent()
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [loadEvent]);

  // Mon inscription éventuelle à cet événement
  useEffect(() => {
    setRegistration(null);
    if (!loggedIn) return;
    api
      .get('/my-registrations')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setRegistration(list.find((r) => String(r.event_id) === String(id)) || null);
      })
      .catch(() => {});
  }, [id, loggedIn]);

  const fail = (e, fallback) => setFeedback({ type: 'error', text: apiMessage(e, fallback) });

  const register = async () => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.post(`/events/${id}/registrations`);
      setRegistration(data);
      setFeedback({
        type: 'success',
        text: t('events.registeredOk', "Inscription confirmée. Garde ton code d'entrée."),
      });
      loadEvent().catch(() => {});
    } catch (e) {
      fail(e, t('events.registerError', "Impossible de t'inscrire."));
    } finally {
      setBusy(false);
    }
  };

  const unregister = async () => {
    if (!window.confirm(t('events.confirmUnregister', 'Te désinscrire de cet événement ?'))) return;
    setBusy(true);
    setFeedback(null);
    try {
      await api.delete(`/events/${id}/registrations`);
      setRegistration(null);
      setFeedback({ type: 'success', text: t('events.unregisteredOk', 'Inscription annulée.') });
      loadEvent().catch(() => {});
    } catch (e) {
      fail(e, t('events.unregisterError', 'Impossible de te désinscrire.'));
    } finally {
      setBusy(false);
    }
  };

  const contactOrganizer = async () => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const { data } = await api.post(`/events/${id}/conversations`);
      navigate(`/messages/${data.id}`);
    } catch (e) {
      fail(e, t('events.contactError', "Impossible d'écrire à l'organisateur."));
      setBusy(false);
    }
  };

  const sendReport = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const body = { reason: report.reason };
      if (report.message.trim() !== '') body.message = report.message;
      await api.post(`/events/${id}/reports`, body);
      setShowReport(false);
      setReport({ reason: '', message: '' });
      setFeedback({ type: 'success', text: t('events.reportOk', 'Merci, ton signalement a été envoyé.') });
    } catch (err) {
      fail(err, t('events.reportError', "Impossible d'envoyer le signalement."));
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* presse-papiers indisponible : on ignore */
    }
  };

  if (loading) {
    return (
      <div className="ev">
        <div className="ev-wrap">
          <p className="ev-count">{t('events.loading', 'Chargement…')}</p>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="ev">
        <div className="ev-wrap">
          <Link className="ev-back" to="/events">
            <ArrowLeft size={16} /> {t('events.backToList', 'Retour aux événements')}
          </Link>
          <div className="ev-empty">{t('events.notFound', 'Événement introuvable.')}</div>
        </div>
      </div>
    );
  }

  const full = event.places_left === 0;
  const badge = dateBadge(event.starts_at, locale);
  const photo = eventPhotoUrl(event.photo_path);
  const hasCoords = event.latitude != null && event.longitude != null;
  const mapUrl = hasCoords
    ? `https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=16/${event.latitude}/${event.longitude}`
    : null;
  const pageUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(event.title);
  const organizerName = event.organizer?.name || '';

  return (
    <div className="ev">
      <div className="ev-wrap">
        <Link className="ev-back" to="/events">
          <ArrowLeft size={16} /> {t('events.backToList', 'Retour aux événements')}
        </Link>

        <div className="ev-detail">
          {/* Colonne gauche : visuel, description, partage */}
          <div>
            <div
              className={`ev-banner ${photo ? '' : toneClass(event)}`}
              style={photo ? { backgroundImage: `url(${photo})` } : undefined}
            >
              {badge && (
                <div className="ev-badge">
                  <small>{badge.weekday}</small>
                  <b>{badge.day}</b>
                  <small>{badge.month}</small>
                </div>
              )}
            </div>

            {event.description && (
              <div className="ev-panel">
                <h3>{t('events.description', 'Description')}</h3>
                <p className="ev-desc">{event.description}</p>
              </div>
            )}

            <div className="ev-panel">
              <h3>{t('events.share', 'Partager cet événement')}</h3>
              <div className="ev-share">
                <a href={`https://wa.me/?text=${shareText}%20${pageUrl}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={16} /> WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 size={16} /> Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${pageUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 size={16} /> X
                </a>
                <button type="button" onClick={copyLink}>
                  {copied ? <Check size={16} /> : <Link2 size={16} />}{' '}
                  {copied ? t('events.copied', 'Lien copié') : t('events.copyLink', 'Copier le lien')}
                </button>
              </div>
            </div>
          </div>

          {/* Colonne droite : infos, inscription, organisateur */}
          <aside className="ev-side">
            {event.category?.name && <div className="ev-eyebrow">{event.category.name}</div>}
            <h1>{event.title}</h1>

            {feedback && (
              <p className={`ev-alert ${feedback.type === 'success' ? 'ev-alert-success' : 'ev-alert-error'}`}>
                {feedback.text}
              </p>
            )}

            <ul className="ev-info">
              <li>
                <span className="ico"><Calendar size={17} /></span>
                <span>
                  {formatEventDate(event.starts_at)}
                  <br />
                  <small>→ {formatEventDate(event.ends_at)}</small>
                </span>
              </li>
              <li>
                <span className="ico"><MapPin size={17} /></span>
                <span>
                  {event.address}, {event.city}{' '}
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                      ({t('events.seeOnMap', 'voir sur la carte')})
                    </a>
                  )}
                </span>
              </li>
              {event.languages?.length > 0 && (
                <li>
                  <span className="ico"><Languages size={17} /></span>
                  <span>{event.languages.map((l) => l.name).join(', ')}</span>
                </li>
              )}
              <li>
                <span className="ico"><Users size={17} /></span>
                <span>
                  {full
                    ? t('events.full', 'Complet')
                    : t('events.placesOf', {
                        left: event.places_left,
                        capacity: event.capacity,
                        defaultValue: '{{left}} restante(s) sur {{capacity}}',
                      })}
                </span>
              </li>
            </ul>

            {registration && (
              <div className="ev-panel">
                <h3>{t('events.yourCode', "Ton code d'entrée")}</h3>
                <div className="ev-code">{registration.entry_code}</div>
                <small>{t('events.codeHint', "Présente ce code à l'entrée.")}</small>
              </div>
            )}

            <div className="ev-actions">
              {registration ? (
                <button className="ev-btn ev-btn-outline ev-btn-block" disabled={busy} onClick={unregister}>
                  {t('events.unregister', 'Me désinscrire')}
                </button>
              ) : (
                <button className="ev-btn ev-btn-orange ev-btn-block" disabled={busy || full} onClick={register}>
                  {full ? t('events.full', 'Complet') : `${t('events.registerEvent', "S'inscrire à l'événement")}`}
                </button>
              )}
              <button className="ev-btn ev-btn-plum ev-btn-block" disabled={busy} onClick={contactOrganizer}>
                <Mail size={17} /> {t('events.contactOrganizer', "Contacter l'organisateur")}
              </button>
              <button
                className="ev-btn ev-btn-outline ev-btn-block"
                onClick={() => (loggedIn ? setShowReport((v) => !v) : navigate('/login'))}
              >
                <Flag size={17} /> {t('events.report', 'Signaler')}
              </button>
            </div>

            {showReport && (
              <form className="ev-panel" style={{ marginTop: 14 }} onSubmit={sendReport}>
                <div className="ev-field" style={{ marginBottom: 10 }}>
                  <label htmlFor="rp-reason">{t('events.reportReason', 'Motif')}</label>
                  <input
                    id="rp-reason"
                    maxLength={100}
                    required
                    value={report.reason}
                    onChange={(e) => setReport((r) => ({ ...r, reason: e.target.value }))}
                  />
                </div>
                <div className="ev-field" style={{ marginBottom: 12 }}>
                  <label htmlFor="rp-message">{t('events.reportMessage', 'Détails (facultatif)')}</label>
                  <textarea
                    id="rp-message"
                    maxLength={2000}
                    rows={4}
                    value={report.message}
                    onChange={(e) => setReport((r) => ({ ...r, message: e.target.value }))}
                  />
                </div>
                <button className="ev-btn ev-btn-plum" type="submit" disabled={busy}>
                  {t('events.reportSend', 'Envoyer le signalement')}
                </button>
              </form>
            )}

            {organizerName && (
              <div className="ev-org">
                <small>{t('events.organizedBy', 'Organisé par')}</small>
                <div className="ev-org-name">
                  <span className="ev-avatar">{organizerName.charAt(0).toUpperCase()}</span>
                  {organizerName}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
