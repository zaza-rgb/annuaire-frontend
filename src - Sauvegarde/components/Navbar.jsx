import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api';
import LanguageSwitcher from './LanguageSwitcher.jsx';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function Navbar() {
  const { t } = useTranslation();
  useLocation(); // recalcule la barre à chaque changement de page
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = readUser();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '•';

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // le jeton est peut-être déjà invalide : on déconnecte quand même
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brandmark">A</span>
        <span>
          afro<em>ponte</em>
        </span>
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.home')}
        </NavLink>
        <NavLink to="/businesses" className={({ isActive }) => (isActive ? 'active' : '')}>
          {t('nav.explore')}
        </NavLink>
        {token && (
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            {t('nav.profile')}
          </NavLink>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active' : '')}>
            Administration
          </NavLink>
        )}
      </nav>

      <div className="top-actions">
        {token ? (
          <>
            <Link to="/profile" className="avatar" title={t('nav.profile')}>
              {initial}
            </Link>
            <button className="btn btn-outline" onClick={logout}>
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="btn btn-primary">
              {t('nav.signup')}
            </Link>
          </>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
}