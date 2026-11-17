import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Vrai si l'intro a déjà été vue pendant cette visite (ou si l'on préfère moins d'animations)
export function splashAlreadySeen() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return sessionStorage.getItem('splashSeen') === '1';
  } catch {
    return false;
  }
}

const ARCH = 'M24 112 C 84 -16, 236 -16, 296 112';
const HANGERS = [
  [72, 112, 44],
  [116, 112, 24],
  [160, 112, 18],
  [204, 112, 24],
  [248, 112, 44],
];

export default function Splash({ onDone }) {
  const { t } = useTranslation();
  const [leaving, setLeaving] = useState(false);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem('splashSeen', '1');
    } catch {
      // sans stockage, l'intro se rejouera simplement à la prochaine visite
    }
    onDone();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const t1 = setTimeout(() => setLeaving(true), 3000);
    const t2 = setTimeout(finish, 4100);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    setLeaving(true);
    setTimeout(finish, 1000);
  };

  return (
    <div
      className={`splash ${leaving ? 'splash-out' : ''}`}
      onClick={skip}
      onKeyDown={skip}
      role="presentation"
    >
      <div className="splash-half top" />
      <div className="splash-half bottom" />
      <span className="splash-seam" />

      <div className="splash-content">
        <svg className="splash-bridge" viewBox="0 0 320 150" aria-hidden="true">
          <defs>
            <linearGradient id="archGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#c96e4b" />
              <stop offset="50%" stopColor="#d9a441" />
              <stop offset="100%" stopColor="#6fae85" />
            </linearGradient>
          </defs>
          <path className="bridge-deck" d="M10 112 H310" />
          {HANGERS.map(([x, y, h], i) => (
            <line
              key={x}
              className="bridge-hanger"
              x1={x}
              x2={x}
              y1={y}
              y2={y - h}
              style={{ animationDelay: `${1 + i * 0.1}s` }}
            />
          ))}
          <path className="bridge-arch" d={ARCH} pathLength="1" stroke="url(#archGrad)" />
          <circle className="bridge-dot dot-a" cx="24" cy="112" r="7" />
          <circle className="bridge-dot dot-b" cx="296" cy="112" r="7" />
          <text className="bridge-label" x="24" y="140" textAnchor="middle">
            {t('splash.africa')}
          </text>
          <text className="bridge-label" x="296" y="140" textAnchor="middle">
            {t('splash.brazil')}
          </text>
          <circle r="4.5" className="bridge-spark">
            <animateMotion dur="1.8s" begin="1.3s" repeatCount="indefinite" path={ARCH} />
          </circle>
        </svg>

        <div className="splash-word" aria-label="afroponte">
          {'afroponte'.split('').map((ch, i) => (
            <span
              key={i}
              className={i >= 4 ? 'ponte' : ''}
              style={{ animationDelay: `${0.9 + i * 0.06}s` }}
            >
              {ch}
            </span>
          ))}
        </div>
        <p className="splash-tag">{t('home.eyebrow')}</p>
        <div className="splash-progress">
          <span />
        </div>
      </div>
    </div>
  );
}