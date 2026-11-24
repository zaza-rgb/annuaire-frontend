import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeCheck, Flag, Globe, Image as ImageIcon, Languages, LayoutDashboard, Star, Store, Tags, Users } from 'lucide-react';


const ITEMS = [
  { to: '/admin', end: true, icon: LayoutDashboard, key: 'dashboard' },
  { to: '/admin/businesses', icon: Store, key: 'businesses' },
  { to: '/admin/reviews', icon: Star, key: 'reviews' },
  { to: '/admin/photos', icon: ImageIcon, key: 'photos' },
  { to: '/admin/reports', icon: Flag, key: 'reports' },
  { to: '/admin/claims', icon: BadgeCheck, key: 'claims' },
  { to: '/admin/users', icon: Users, key: 'users' },
  { to: '/admin/categories', icon: Tags, key: 'categories' },
  { to: '/admin/countries', icon: Globe, key: 'countries' },
  { to: '/admin/languages', icon: Languages, key: 'languages' },
];

// Cadre de l'espace administrateur : barre latérale + page courante.
// Route : <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
export default function AdminLayout() {
  const { t } = useTranslation();

  // Active le style pleine largeur de admin-theme.css, uniquement dans l'espace admin
  useEffect(() => {
    document.body.classList.add('is-admin');
    return () => document.body.classList.remove('is-admin');
  }, []);

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <p className="admin-side-title">{t('admin.title')}</p>
        <nav aria-label={t('admin.title')}>
          {ITEMS.map(({ to, end, icon: Icon, key }) => (
            <NavLink key={key} to={to} end={end} className={({ isActive }) => `admin-link${isActive ? ' active' : ''}`}>
              <Icon size={18} aria-hidden="true" /> {t(`admin.nav.${key}`)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
