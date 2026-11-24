import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUp,
  AtSign,
  Compass,
  House,
  Info,
  LogIn,
  Mail,
  MapPin,
  MessageCircle,
  Scissors,
  Shirt,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import Logo from './Logo.jsx';
import { SITE } from '../siteConfig.js';

const UNIVERS_LINKS = [
  { icon: UtensilsCrossed, key: 'restaurants', q: 'restaurant' },
  { icon: Store, key: 'shops', q: 'boutique' },
  { icon: Scissors, key: 'beauty', q: 'coiffure' },
  { icon: Shirt, key: 'craft', q: 'couture' },
];

function BrazilFlag() {
  return (
    <svg className="footer-flag" viewBox="0 0 28 20" role="img" aria-label="Brasil">
      <rect width="28" height="20" fill="#229e45" />
      <polygon points="14,2 26,10 14,18 2,10" fill="#f8d90f" />
      <circle cx="14" cy="10" r="4.2" fill="#2b3b8f" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const { t } = useTranslation();
  const whatsappUrl = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}` : '';
  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Marque */}
        <div className="footer-brand">
          <div className="brand">
            <Logo />
            <span>
              afro<em>ponte</em>
            </span>
          </div>
          <p>
            {t('footer.tagline')} {t('footer.bridge')}
          </p>
          <span className="footer-pill">
            <MapPin size={14} /> {t('footer.categories')}
          </span>
          <div className="footer-social">
            {SITE.instagram && (
              <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <InstagramIcon />
              </a>
            )}
            {SITE.facebook && (
              <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FacebookIcon />
              </a>
            )}
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <MessageCircle size={18} />
              </a>
            )}
            <BrazilFlag />
          </div>
        </div>

        {/* Explorer */}
        <nav className="footer-links footer-col" aria-label={t('footer.colExplore')}>
          <h4>{t('footer.colExplore')}</h4>
          <Link to="/">
            <House size={15} /> {t('nav.home')}
          </Link>
          <Link to="/businesses">
            <Compass size={15} /> {t('nav.explore')}
          </Link>
          {UNIVERS_LINKS.map(({ icon: Icon, key, q }) => (
            <Link key={key} to={`/businesses?q=${encodeURIComponent(q)}`}>
              <Icon size={15} /> {t(`univers.${key}.title`)}
            </Link>
          ))}
        </nav>

        {/* Commerçants */}
        <nav className="footer-links footer-col" aria-label={t('footer.colMerchants')}>
          <h4>{t('footer.colMerchants')}</h4>
          <Link to="/register">
            <Store size={15} /> {t('footer.listBusiness')}
          </Link>
          <Link to="/login">
            <LogIn size={15} /> {t('footer.login')}
          </Link>
        </nav>

        {/* Le site */}
        <nav className="footer-links footer-col" aria-label={t('footer.colSite')}>
          <h4>{t('footer.colSite')}</h4>
          <Link to="/about">
            <Info size={15} /> {t('footer.about')}
          </Link>
          <Link to="/contact">
            <Mail size={15} /> {t('footer.contact')}
          </Link>
          {SITE.email && (
            <a href={`mailto:${SITE.email}`}>
              <AtSign size={15} /> {SITE.email}
            </a>
          )}
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={15} /> {t('footer.whatsapp')}
            </a>
          )}
        </nav>
      </div>

      <div className="footer-bottom">
        <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
        <nav className="footer-legal" aria-label="Legal">
          <Link to="/legal">{t('footer.legal')}</Link>
          <Link to="/privacy">{t('footer.privacy')}</Link>
          <Link to="/terms">{t('footer.terms')}</Link>
        </nav>
        <button type="button" className="footer-top" onClick={toTop}>
          {t('footer.backToTop')} <ArrowUp size={14} />
        </button>
      </div>
    </footer>
  );
}
