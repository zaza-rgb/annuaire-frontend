import { useEffect, useRef, useState } from 'react';
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

// Les mots-clés (q) ouvrent la page Explorer avec la recherche déjà remplie.
// « photo » : image de la carte (dossier public/images/cards).
const UNIVERS = [
  { icon: UtensilsCrossed, key: 'restaurants', q: 'restaurant', tone: 'food', photo: 'restaurant-salle' },
  { icon: Store, key: 'shops', q: 'boutique', tone: 'market', photo: 'boutique-epices' },
  { icon: Scissors, key: 'beauty', q: 'coiffure', tone: 'style', photo: 'coiffure-tresses' },
  { icon: Shirt, key: 'craft', q: 'couture', tone: 'craft', photo: 'couture-atelier' },
];

// Diaporama du hero (dossier public/images/hero). « key » = univers affiché sous le diaporama.
// L'ordre alterne les univers pour ne pas enchaîner trois restaurants.
const SLIDES = [
  { src: '/images/hero/restaurant-plats.webp', key: 'restaurants', pos: 'center' },
  { src: '/images/hero/coiffure-tresses.webp', key: 'beauty', pos: '62% 40%' },
  { src: '/images/hero/boutique-epices.webp', key: 'shops', pos: 'center' },
  { src: '/images/hero/couture-atelier.webp', key: 'craft', pos: '50% 30%' },
  { src: '/images/hero/restaurant-salle.webp', key: 'restaurants', pos: 'center 55%' },
  { src: '/images/hero/restaurant-lounge.webp', key: 'restaurants', pos: 'center 60%' },
];
const SLIDE_MS = 6500;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Home({ ready = true }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState({ current: 0, prev: null });
  const [paused, setPaused] = useState(false);
  const slidesRef = useRef(null);
  const user = readUser();
  const connected = !!localStorage.getItem('token');
  // Le texte n'apparaît qu'après l'intro du logo
  const a = (n) => (ready ? `anim anim-${n}` : 'anim-hidden');

  const goTo = (i) => setSlide((s) => (s.current === i ? s : { current: i, prev: s.current }));

  // Passage automatique à l'image suivante (après l'intro, sauf si la personne préfère moins d'animations)
  useEffect(() => {
    if (!ready || paused || prefersReducedMotion()) return undefined;
    const id = setTimeout(() => goTo((slide.current + 1) % SLIDES.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [ready, paused, slide.current]);

  // Léger effet de profondeur : les images descendent un peu moins vite que la page
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = slidesRef.current;
        if (el) el.style.transform = `translate3d(0, ${Math.min(window.scrollY, 700) * 0.15}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

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
      {/* ---------- Hero plein écran : diaporama d'images ---------- */}
      <section className="hero-full">
        <div className="hero-slides" ref={slidesRef} aria-hidden="true">
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              className={`hero-slide kb-${i % 4} ${i === slide.current ? 'is-active' : ''} ${i === slide.prev ? 'is-prev' : ''}`}
            >
              <img
                src={s.src}
                alt=""
                style={{ objectPosition: s.pos }}
                decoding="async"
              />
            </div>
          ))}
        </div>
        <div className="hero-shade" />
        <div className="hero-grain" aria-hidden="true" />
        <span className="orb orb-a" />
        <span className="orb orb-b" />

        <div className="hero-content">
          <div className="hero-copy">
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

        {/* Points de navigation du diaporama (pause quand on les survole) */}
        <div
          className={`hero-dots ${paused ? 'is-paused' : ''}`}
          style={{ '--slide-ms': `${SLIDE_MS}ms` }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={`hero-dot ${i === slide.current ? 'on' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`${i + 1} / ${SLIDES.length} : ${t(`univers.${s.key}.title`)}`}
              aria-current={i === slide.current}
            >
              <span />
            </button>
          ))}
          <span className="hero-dot-label">{t(`univers.${SLIDES[slide.current].key}.title`)}</span>
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
              <h2>{t('home.universTitle')}</h2>
            </div>
          </Reveal>
          <div className="univers-grid">
            {UNIVERS.map(({ icon: Icon, key, q, tone, photo }, i) => (
              <Reveal key={key} delay={i * 100} variant="zoom">
                <Link to={`/businesses?q=${encodeURIComponent(q)}`} className={`univers-card tone-${tone}`}>
                  <img className="u-photo" src={`/images/cards/${photo}.webp`} alt="" loading="lazy" decoding="async" />
                  <span className="u-veil" aria-hidden="true" />
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
