import { useEffect, useRef, useState } from 'react';

// Vrai si l'intro a déjà été vue pendant cette visite (ou si l'on préfère moins d'animations)
export function splashAlreadySeen() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    return sessionStorage.getItem('splashSeen') === '1';
  } catch {
    return false;
  }
}

const WORD = 'afroponte';

export default function Splash({ onDone }) {
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
    const t1 = setTimeout(() => setLeaving(true), 2800);
    const t2 = setTimeout(finish, 3500);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    setLeaving(true);
    setTimeout(finish, 450);
  };

  return (
    <div
      className={`splash ${leaving ? 'splash-out' : ''}`}
      onClick={skip}
      onKeyDown={skip}
      role="presentation"
    >
      <div className="splash-center">
        <div className="splash-logo">
          <span className="splash-ring" />
          <span className="splash-ring ring2" />
          <span className="splash-mark">A</span>
        </div>
        <div className="splash-word" aria-label="afroponte">
          {WORD.split('').map((ch, i) => (
            <span
              key={i}
              className={i >= 4 ? 'ponte' : ''}
              style={{ animationDelay: `${0.9 + i * 0.07}s` }}
            >
              {ch}
            </span>
          ))}
        </div>
        <p className="splash-tag">Le répertoire afro du Brésil</p>
      </div>
    </div>
  );
}
