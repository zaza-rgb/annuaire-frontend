import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Reveal from '../components/Reveal.jsx';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function Home({ ready = true }) {
  const { t } = useTranslation();
  // Le texte n'apparaît qu'après l'intro du logo
  const a = (n) => (ready ? `anim anim-${n}` : 'anim-hidden');
  const user = readUser();
  const connected = !!localStorage.getItem('token');

  return (
    <div className="page">
      <section className="hero-bg">
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
        >
          <source src="/raizes_video_background_3.mp4" type="video/mp4" />
        </video>

        <div className="hero-inner">
          <div className={`eyebrow ${a(1)}`}>{t('home.eyebrow')}</div>
          <h1 className={a(2)}>
            {t('home.titleLine')} <span>{t('home.titleAccent')}</span>
          </h1>
          <p className={a(3)}>{t('home.intro')}</p>
          <div className={`hero-actions ${a(4)}`}>
            <Link to="/businesses" className="btn btn-clay btn-shine">
              {t('home.explore')}
            </Link>
            {connected ? (
              <Link to="/profile" className="btn btn-ghost">
                {t('nav.profile')}
                {user?.name ? ` · ${user.name}` : ''}
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-on-dark">
                  {t('nav.signup')}
                </Link>
                <Link to="/login" className="btn btn-ghost">
                  {t('nav.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="feature-grid home-features">
        <Reveal>
          <div className="panel lift">
            <h3>{t('home.discoverTitle')}</h3>
            <p>{t('home.discoverText')}</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="panel lift">
            <h3>{t('home.connectTitle')}</h3>
            <p>{t('home.connectText')}</p>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className="panel lift">
            <h3>{t('home.growTitle')}</h3>
            <p>{t('home.growText')}</p>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <section className="story-band">
          <div>
            <div className="eyebrow" style={{ color: '#e5b17f' }}>
              {t('home.storyEyebrow')}
            </div>
            <h2>{t('home.storyTitle')}</h2>
            <p>{t('home.storyText')}</p>
          </div>
          <Link to="/register" className="btn btn-cream">
            {t('home.storyButton')}
          </Link>
        </section>
      </Reveal>
    </div>
  );
}
