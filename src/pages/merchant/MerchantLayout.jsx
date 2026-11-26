import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Bell,
  Images,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PlusCircle,
  Settings,
  Star,
  Store,
  Undo2,
} from 'lucide-react';
import api from '../../api';
import '../../merchant-dashboard.css';

// Menu de l'espace commerçant (maquette « Espace Commerçant »).
// Un élément sans `to` n'a pas encore de page : il est affiché grisé avec « Bientôt ».
const ITEMS = [
  { key: 'dashboard', to: '/merchant', end: true, icon: LayoutDashboard },
  { key: 'business', icon: Store },
  { key: 'add', to: '/merchant/new', icon: PlusCircle },
  { key: 'photos', icon: Images },
  { key: 'reviews', icon: Star },
  { key: 'messages', to: '/messages', icon: MessageCircle },
  { key: 'stats', icon: BarChart3 },
  { key: 'notifications', icon: Bell },
  { key: 'settings', to: '/profile', icon: Settings },
];

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Route parente de /merchant : menu à gauche, puis la page choisie dans <Outlet />.
// Pendant qu'elle est affichée, la navbar et le pied de page du site sont masqués (classe is-merchant).
export default function MerchantLayout() {
  const { t } = useTranslation();
  const name = readUser()?.name || '';

  useEffect(() => {
    document.body.classList.add('is-merchant');
    return () => document.body.classList.remove('is-merchant');
  }, []);

  // ATTENTION : à aligner sur le bouton « Déconnexion » de Navbar.jsx
  // (clés du localStorage et adresse de connexion à vérifier).
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      /* on déconnecte quand même côté navigateur */
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.assign('/login');
  };

  return (
    <div className="mlay">
      <aside className="mlay-side" aria-label={t('merchant.nav.menu')}>
        <Link to="/" className="mlay-brand">
          afro<em>ponte</em>
        </Link>

        <div className="mlay-me">
          <span className="mlay-me__avatar" aria-hidden="true">
            {name.charAt(0).toUpperCase() || '?'}
          </span>
          <div>
            <strong>{name}</strong>
            <span>{t('merchant.nav.role')}</span>
          </div>
        </div>

        <nav className="mlay-nav">
          {ITEMS.map(({ key, to, end, icon: Icon }) =>
            to ? (
              <NavLink
                key={key}
                to={to}
                end={end}
                className={({ isActive }) => `mlay-item${isActive ? ' is-active' : ''}`}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{t(`merchant.nav.${key}`)}</span>
              </NavLink>
            ) : (
              <span key={key} className="mlay-item is-soon" aria-disabled="true">
                <Icon size={18} aria-hidden="true" />
                <span>{t(`merchant.nav.${key}`)}</span>
                <em>{t('merchant.nav.soon')}</em>
              </span>
            ),
          )}
        </nav>

        <div className="mlay-foot">
          <Link to="/" className="mlay-item">
            <Undo2 size={18} aria-hidden="true" />
            <span>{t('merchant.nav.backSite')}</span>
          </Link>
          <button type="button" className="mlay-item" onClick={logout}>
            <LogOut size={18} aria-hidden="true" />
            <span>{t('merchant.nav.logout')}</span>
          </button>
        </div>
      </aside>

      <main className="mlay-main">
        <Outlet />
      </main>
    </div>
  );
}
