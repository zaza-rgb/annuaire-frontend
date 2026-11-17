import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, House, LogIn, LogOut, Menu, UserPlus, UserRound, X } from 'lucide-react';
import api from '../api';
import Logo from './Logo.jsx';
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
  const headerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem('token');
  const user = readUser();
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '•';

  // Barre qui se resserre au défilement + fine ligne de progression de lecture
  useEffect(() => {
    const onScroll = () => {
      const el = headerRef.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      el.style.setProperty('--progress', progress.toFixed(3));
      el.classList.toggle('scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // le jeton est peut-être déjà invalide : on déconnecte quand même
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setOpen(false);
    navigate('/login');
  };

  const cls = ({ isActive }) => (isActive ? 'active' : '');
  const close = () => setOpen(false);

  return (
    <header className="navbar" ref={headerRef}>
      <Link to="/" className="brand" onClick={close}>
        <Logo />
        <span>
          afro<em>ponte</em>
        </span>
      </Link>

      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to="/" end className={cls} onClick={close}>
          <House size={16} /> {t('nav.home')}
        </NavLink>
        <NavLink to="/businesses" className={cls} onClick={close}>
          <Compass size={16} /> {t('nav.explore')}
        </NavLink>
        {token && (
              <>
                <NavLink to="/profile" className={cls} onClick={close}>
                  <UserRound size={16} /> {t('nav.profile')}
                </NavLink>
                <NavLink to="/messages" className={cls} onClick={close}>
                  <MessageCircle size={16} /> {t('nav.messages')}
                </NavLink>
              </>
            )}
        {user?.role === 'admin' && (
          <NavLink to="/admin" className={cls} onClick={close}>
            {t('nav.admin')}
          </NavLink>
        )}

        <div className="nav-actions-mobile">
          {token ? (
            <button className="btn btn-outline" onClick={logout}>
              <LogOut size={16} /> {t('nav.logout')}
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" onClick={close}>
                <LogIn size={16} /> {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={close}>
                <UserPlus size={16} /> {t('nav.signup')}
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="top-actions">
        {token ? (
          <>
            <Link to="/profile" className="avatar" title={t('nav.profile')}>
              {initial}
            </Link>
            <button className="btn btn-outline" onClick={logout}>
              <LogOut size={16} /> {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">
              <LogIn size={16} /> {t('nav.login')}
            </Link>
            <Link to="/register" className="btn btn-primary">
              <UserPlus size={16} /> {t('nav.signup')}
            </Link>
          </>
        )}
        <LanguageSwitcher />
        <button
          className="burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t('nav.menuClose') : t('nav.menuOpen')}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <span className="scroll-progress" aria-hidden="true" />
    </header>
  );
}