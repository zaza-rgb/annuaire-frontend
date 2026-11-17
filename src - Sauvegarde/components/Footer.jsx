import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div>
        <div className="brand" style={{ color: '#fff' }}>
          <span className="brandmark">A</span>
          <span>
            afro<em>ponte</em>
          </span>
        </div>
        <p>{t('footer.tagline')}</p>
      </div>
      <div className="footer-links">
        <Link to="/">{t('nav.home')}</Link>
        <Link to="/businesses">{t('nav.explore')}</Link>
        <Link to="/register">{t('footer.listBusiness')}</Link>
        <Link to="/login">{t('footer.login')}</Link>
      </div>
    </footer>
  );
}