import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, House } from 'lucide-react';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="page narrow-620 notfound">
      <div className="panel big">
        <div className="eyebrow">404</div>
        <h2>{t('notFound.title')}</h2>
        <p>{t('notFound.text')}</p>
        <div className="chips">
          <Link to="/" className="btn btn-primary">
            <House size={16} /> {t('nav.home')}
          </Link>
          <Link to="/businesses" className="btn btn-outline">
            <Compass size={16} /> {t('nav.explore')}
          </Link>
        </div>
      </div>
    </div>
  );
}