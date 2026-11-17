import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Compass,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Navigation,
  Scissors,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  UtensilsCrossed,
} from 'lucide-react';
import Reveal from '../components/Reveal.jsx';

function readUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

// Les mots-clés (q) ouvrent la page Explorer avec la recherche déjà remplie
const UNIVERS = [
  { icon: UtensilsCrossed, key: 'restaurants', q: 'restaurant', tone: 'food' },
  { icon: Store, key: 'shops', q: 'boutique', tone: 'market' },
  { icon: Scissors, key: 'beauty', q: 'coiffure', tone: 'style' },
  { icon: Shirt, key: 'craft', q: 'couture', tone: 'craft' },
];

export default function Home({ ready = true }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const user = readUser();
  const connected = !!localStorage.getItem('token');
  // Le texte n'apparaît qu'après l'intro du logo
  const a = (n) => (ready ? `anim anim-${n}` : 'anim-hidden');

  const BAND = [
    [UtensilsCrossed, t('univers.restaurants.title')],
    [Store, t('univers.shops.title')],
    [Scissors, t('univers.beauty.title')],
    [Shirt, t('univers.craft.title')],
    [Compass, t('band.culture')],
    [HeartHandshake, t('band.community')],
  ];

  const titleWords = [
    ...t('home.titleLine').split(' ').map((w) => ({ w, accent: false })),
    ...t('home.titleAccent').split(' ').map((w) => ({ w, accent: true })),
  ];

  const search = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/businesses?q=${encodeURIComponent(q)}` : '/businesses');
  };

  return (
    <>
      {/* ---------- Hero plein écran avec la vidéo ---------- */}
      <section className="hero-full">
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
        <div className="hero-shade" />
        <span className="orb orb-a" />
        <span className="orb orb-b" />

        <div className="hero-content">
          <div className="hero-copy">
            <div className={`pill ${a(1)}`}>
              <Sparkles size={14} /> {t('home.eyebrow')}
            </div>

            <h1 className="hero-title" aria-label={`${t('home.titleLine')} ${t('home.titleAccent')}`}>
              {titleWords.map(({ w, accent }, i) => (
                <span
                  key={i}
                  className={`word ${ready ? 'word-in' : ''} ${accent ? 'accent' : ''}`}
                  style={{ animationDelay: `${0.25 + i * 0.09}s` }}
                  aria-hidden="true"
                >
                  {w}&nbsp;
                </span>
              ))}
            </h1>

            <p className={`hero-lead ${a(3)}`}>{t('home.intro')}</p>

            <form className={`hero-search ${a(4)}`} onSubmit={search} role="search">
              <Search size={18} className="hs-icon" />
              <input
                type="search"
                placeholder={t('home.searchPlaceholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t('home.searchAria')}
              />
              <button type="submit" className="btn btn-clay btn-shine">
                {t('explore.search')} <ArrowRight size={16} />
              </button>
            </form>

            <div className={`hero-actions ${a(4)}`}>
              <Link to="/businesses" className="btn btn-ghost">
                <Navigation size={16} /> {t('explore.nearMe')}
              </Link>
              {connected ? (
                <Link to="/profile" className="btn btn-ghost">
                  {t('nav.profile')}
                  {user?.name ? ` · ${user.name}` : ''}
                </Link>
              ) : (
                <Link to="/register" className="btn btn-green">
                  {t('nav.signup')} <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>

          <div className={`hero-cards ${a(4)}`} aria-hidden="true">
            <div className="glass float-a">
              <span className="g-icon"><MapPin size={18} /></span>
              <div>
                <strong>{t('home.card1Title')}</strong>
                <small>{t('home.card1Text')}</small>
              </div>
            </div>
            <div className="glass float-b">
              <span className="g-icon green"><ShieldCheck size={18} /></span>
              <div>
                <strong>{t('home.card2Title')}</strong>
                <small>{t('home.card2Text')}</small>
              </div>
            </div>
            <div className="glass float-c">
              <span className="g-icon gold"><MessageCircle size={18} /></span>
              <div>
                <strong>{t('home.card3Title')}</strong>
                <small>{t('home.card3Text')}</small>
              </div>
            </div>
          </div>
        </div>

        <a href="#univers" className="scroll-cue" aria-label={t('home.scrollCue')}>
          <ChevronDown size={22} />
        </a>
      </section>

      {/* ---------- Bandeau défilant (vert) ---------- */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...BAND, ...BAND, ...BAND, ...BAND].map(([Icon, label], i) => (
            <span key={i} className="marquee-item">
              <Icon size={18} /> {label}
              <i className="dot" />
            </span>
          ))}
        </div>
      </div>

      <div className="page home-page">
        {/* ---------- Univers ---------- */}
        <section id="univers" className="home-section">
          <Reveal>
            <div className="section-head">
              <div className="eyebrow">{t('home.universEyebrow')}</div>
              <h2>{t('home.universTitle')}</h2>
            </div>
          </Reveal>
          <div className="univers-grid">
            {UNIVERS.map(({ icon: Icon, key, q, tone }, i) => (
              <Reveal key={key} delay={i * 100} variant="zoom">
                <Link to={`/businesses?q=${encodeURIComponent(q)}`} className={`univers-card tone-${tone}`}>
                  <span className="u-icon">
                    <Icon size={26} />
                  </span>
                  <h3>{t(`univers.${key}.title`)}</h3>
                  <p>{t(`univers.${key}.text`)}</p>
                  <span className="u-go">
                    {t('card.discover')} <ArrowUpRight size={16} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Pourquoi AfroPonte ---------- */}
        <section className="feature-grid home-features">
          <Reveal variant="left">
            <div className="panel lift feature">
              <span className="f-icon"><Compass size={24} /></span>
              <h3>{t('home.discoverTitle')}</h3>
              <p>{t('home.discoverText')}</p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="panel lift feature">
              <span className="f-icon"><MessageCircle size={24} /></span>
              <h3>{t('home.connectTitle')}</h3>
              <p>{t('home.connectText')}</p>
            </div>
          </Reveal>
          <Reveal delay={240} variant="right">
            <div className="panel lift feature">
              <span className="f-icon"><HeartHandshake size={24} /></span>
              <h3>{t('home.growTitle')}</h3>
              <p>{t('home.growText')}</p>
            </div>
          </Reveal>
        </section>

        {/* ---------- Appel aux commerçants ---------- */}
        <Reveal variant="zoom">
          <section className="story-band">
            <span className="band-orb" />
            <div className="band-text">
              <div className="eyebrow">{t('home.storyEyebrow')}</div>
              <h2>{t('home.storyTitle')}</h2>
              <p>{t('home.storyText')}</p>
            </div>
            <Link to="/register" className="btn btn-cream btn-shine">
              {t('home.storyCta')} <ArrowUpRight size={16} />
            </Link>
          </section>
        </Reveal>
      </div>
    </>
  );
}