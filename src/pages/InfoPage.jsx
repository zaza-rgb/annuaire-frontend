import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';
import { SITE } from '../siteConfig.js';

// Page de texte générique : /about, /contact, /privacy, /terms, /legal
// Les textes sont dans les fichiers de traduction (groupe « pages »).
export default function InfoPage({ slug }) {
  const { t } = useTranslation();
  const missing = t('pages.toComplete');
  const fill = (text) =>
    String(text)
      .split('{{owner}}').join(SITE.owner || missing)
      .split('{{email}}').join(SITE.email || missing);

  const raw = t(`pages.${slug}.sections`, { returnObjects: true });
  const sections = Array.isArray(raw) ? raw : [];
  const whatsappUrl = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}` : '';

  return (
    <div className="page info-page">
      <Link to="/" className="btn btn-outline info-back">
        <ArrowLeft size={15} /> {t('pages.backHome')}
      </Link>
      <div className="eyebrow">AfroPonte</div>
      <h1>{t(`pages.${slug}.title`)}</h1>
      <p className="info-intro">{fill(t(`pages.${slug}.intro`))}</p>

      {slug === 'contact' && (SITE.email || whatsappUrl) && (
        <div className="info-contact">
          {SITE.email && (
            <a className="btn btn-primary" href={`mailto:${SITE.email}`}>
              <Mail size={16} /> {t('pages.contactEmail')}
            </a>
          )}
          {whatsappUrl && (
            <a className="btn btn-green" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={16} /> {t('pages.contactWhatsapp')}
            </a>
          )}
        </div>
      )}

      {sections.map((s, i) => (
        <section key={i} className="panel info-section">
          <h2>{s.h}</h2>
          <p>{fill(s.p)}</p>
        </section>
      ))}

      {slug !== 'about' && slug !== 'contact' && (
        <p className="info-updated">{t('pages.updated', { date: SITE.updated })}</p>
      )}
    </div>
  );
}
