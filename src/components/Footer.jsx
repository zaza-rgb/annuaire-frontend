
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, House, LogIn, MapPin, Store } from 'lucide-react';
import Logo from './Logo.jsx';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-inner">
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
        </div>

        <div className="footer-links">
          <Link to="/">
            <House size={15} /> {t('nav.home')}
          </Link>
          <Link to="/businesses">
            <Compass size={15} /> {t('nav.explore')}
          </Link>
          <Link to="/register">
            <Store size={15} /> {t('footer.listBusiness')}
          </Link>
          <Link to="/login">
            <LogIn size={15} /> {t('footer.login')}
          </Link>
        </div>
      </div>
      <div className="footer-bottom">{t('footer.copyright', { year: new Date().getFullYear() })}</div>
    </footer>
  );
}