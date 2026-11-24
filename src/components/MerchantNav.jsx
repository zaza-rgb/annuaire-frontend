import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../merchant.css';

// Petit menu commun à toutes les pages de l'espace commerçant
export default function MerchantNav() {
  const { t } = useTranslation();
  const cls = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <nav className="m-tabs" aria-label={t('nav.merchant')}>
      <NavLink to="/merchant" end className={cls}>
        {t('merchant.nav.dashboard')}
      </NavLink>
      <NavLink to="/merchant/new" className={cls}>
        {t('merchant.nav.add')}
      </NavLink>
      <NavLink to="/messages" className={cls}>
        {t('merchant.nav.messages')}
      </NavLink>
    </nav>
  );
}
