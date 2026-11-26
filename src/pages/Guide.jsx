import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../guide.css";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Lightbulb,
  Play,
} from "lucide-react";
import { visitorSteps } from "../guideSteps";
import "../guide.css";

// À confirmer : chemin de la page « Créer un compte » (celui du bouton de la navbar).
const REGISTER_PATH = "/register";

/**
 * Flèche courbe de la bulle vers l'élément à montrer.
 * Le calque SVG a exactement le même rapport largeur/hauteur que la capture,
 * donc la flèche n'est jamais déformée, quelle que soit la taille de l'écran.
 */
function Pointer({ step }) {
  const { ratio, target, bubble } = step;
  const W = 100 * ratio;
  const H = 100;

  const geometry = useMemo(() => {
    const sx = bubble.x * ratio;
    const sy = bubble.y;
    const tx = target.x * ratio;
    const ty = target.y;

    // On s'arrête au bord du cercle de mise en valeur, pas en son centre.
    const dx = sx - tx;
    const dy = sy - ty;
    const len = Math.hypot(dx, dy) || 1;
    const stop = Math.max(target.w * ratio, target.h) / 2 + 1.2;
    const ex = tx + (dx / len) * stop;
    const ey = ty + (dy / len) * stop;

    // Point de contrôle décalé pour obtenir une courbe.
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    const cx = mx - (dy / len) * len * 0.22;
    const cy = my + (dx / len) * len * 0.22;

    return `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
  }, [bubble, target, ratio]);

  return (
    <svg
      className="guide-pointer"
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <marker
          id="guide-arrowhead"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path
            d="M 1 1 L 9 5 L 1 9"
            fill="none"
            stroke="var(--g-bordeaux)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>
      <path
        d={geometry}
        fill="none"
        stroke="var(--g-bordeaux)"
        strokeWidth="0.55"
        strokeLinecap="round"
        markerEnd="url(#guide-arrowhead)"
      />
    </svg>
  );
}

export default function Guide() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();

  const steps = visitorSteps;
  const total = steps.length;

  // Étape courante lue dans l'URL (?etape=2), valeur par défaut : 1.
  const raw = parseInt(params.get("etape"), 10);
  const current = Number.isInteger(raw) && raw >= 1 && raw <= total ? raw - 1 : 0;
  const step = steps[current];
  const isLast = current === total - 1;

  const goTo = (index) => {
    const next = Math.min(Math.max(index, 0), total - 1);
    setParams({ etape: String(next + 1) }, { replace: true });
  };

  const base = `guide.steps.${step.key}`;

  return (
    <main className="guide-page">
      {/* ───────── En-tête ───────── */}
      <header className="guide-hero">
        <div className="guide-hero__text">
          <span className="guide-badge">
            <Play size={16} aria-hidden="true" />
            {t("guide.badge")}
          </span>
          <h1 className="guide-title">
            {t("guide.titlePre")}
            <span className="guide-title__brand">
  <span className="guide-title__afro">Afro</span>
  <span className="guide-title__ponte">Ponte</span>
</span>
            {t("guide.titlePost")}
          </h1>
          <p className="guide-intro">{t("guide.intro")}</p>
          <span className="guide-swoosh" aria-hidden="true" />
        </div>

        <div className="guide-hero__media">
          <img
            src="/images/guide/guide-hero-phone.jpeg"
            alt={t("guide.heroAlt")}
            width="1264"
            height="843"
            decoding="async"
          />
        </div>
      </header>

      {/* ───────── Zone du guide ───────── */}
      <section className="guide-panel" aria-label={t("guide.badge")}>
        {/* Liste des étapes (ordinateur) */}
        <ol className="guide-steps">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const state = i === current ? "is-current" : i < current ? "is-done" : "";
            return (
              <li key={s.key} className={`guide-steps__item ${state}`}>
                <button
                  type="button"
                  className="guide-steps__btn"
                  onClick={() => goTo(i)}
                  aria-current={i === current ? "step" : undefined}
                >
                  <span className="guide-steps__num">{i + 1}</span>
                  <span className="guide-steps__card">
                    <Icon size={20} aria-hidden="true" className="guide-steps__icon" />
                    <span className="guide-steps__body">
                      <span className="guide-steps__title">
                        {t(`guide.steps.${s.key}.title`)}
                      </span>
                      <span className="guide-steps__short">
                        {t(`guide.steps.${s.key}.short`)}
                      </span>
                    </span>
                    {i < current && (
                      <span className="guide-steps__check" aria-label={t("guide.done")}>
                        <Check size={14} aria-hidden="true" />
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Étapes en barre compacte (mobile) */}
        <ol className="guide-tabs" aria-label={t("guide.stepsLabel")}>
          {steps.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                className={`guide-tabs__btn ${
                  i === current ? "is-current" : i < current ? "is-done" : ""
                }`}
                onClick={() => goTo(i)}
                aria-current={i === current ? "step" : undefined}
                aria-label={t(`guide.steps.${s.key}.title`)}
              >
                {i < current ? <Check size={14} aria-hidden="true" /> : i + 1}
              </button>
            </li>
          ))}
        </ol>

        {/* Étape en cours */}
        <div className="guide-stage">
          <div className="guide-stage__head">
            <span className="guide-stage__pill">
              <BookOpen size={18} aria-hidden="true" />
              {t("guide.stepLabel", { n: current + 1 })} : {t(`${base}.title`)}
            </span>
          </div>

          <figure className="guide-shot">
            <div className="guide-shot__frame" style={{ aspectRatio: step.ratio }}>
              <img
                key={step.image}
                src={step.image}
                alt={t(`${base}.alt`)}
                decoding="async"
              />
              <span
                className="guide-ring"
                style={{
                  left: `${step.target.x}%`,
                  top: `${step.target.y}%`,
                  width: `${step.target.w}%`,
                  height: `${step.target.h}%`,
                }}
                aria-hidden="true"
              />
              <Pointer step={step} />
              <span
                className="guide-bubble"
                style={{ left: `${step.bubble.x}%`, top: `${step.bubble.y}%` }}
              >
                {t(`${base}.bubble`)}
              </span>
            </div>
          </figure>

          <p className="guide-tip">
            <span className="guide-tip__icon" aria-hidden="true">
              <Lightbulb size={22} />
            </span>
            <span>
              <strong>{t("guide.tipLabel")}</strong> {t(`${base}.tip`)}
            </span>
          </p>

          {/* Navigation */}
          <nav className="guide-nav" aria-label={t("guide.stepsLabel")}>
            <button
              type="button"
              className="guide-btn guide-btn--ghost"
              onClick={() => goTo(current - 1)}
              disabled={current === 0}
            >
              <ArrowLeft size={18} aria-hidden="true" />
              {t("guide.prev")}
            </button>

            <div className="guide-dots" role="presentation">
              {steps.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`guide-dots__dot ${i === current ? "is-current" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={t("guide.goTo", { n: i + 1 })}
                />
              ))}
            </div>

            {isLast ? (
              <Link to={REGISTER_PATH} className="guide-btn guide-btn--solid">
                {t("guide.finish")}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <button
                type="button"
                className="guide-btn guide-btn--solid"
                onClick={() => goTo(current + 1)}
              >
                {t("guide.next")}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            )}
          </nav>
        </div>
      </section>
    </main>
  );
}
