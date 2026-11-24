import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flag, Mail, MessageCircle, Store, Users } from 'lucide-react';
import api from '../../api';


// Tableau de bord admin (style FinPay aux couleurs AfroPonte) : GET /admin/stats
// Seules les variables déjà renvoyées par l'API sont affichées :
// users {total, suspended, by_role}, businesses {total, pending, approved, rejected},
// pending {reviews, photos, claims}, reports_open, conversations, messages.
const COLORS = {
  plum: '#54283f',
  plum2: '#713d57',
  clay: '#c96e4b',
  gold: '#d9a441',
  green: '#2f6b4a',
  green2: '#3d8a5f',
};

const n = (v) => Number(v) || 0;

// Anneaux concentriques (comme le graphique « Statistic » de la maquette)
function Rings({ items, total, label }) {
  const stroke = 12;
  const gap = 6;
  return (
    <svg viewBox="0 0 200 200" className="dash-rings" role="img" aria-label={label}>
      {items.map((it, i) => {
        const r = 88 - i * (stroke + gap);
        const len = 2 * Math.PI * r;
        const frac = total ? it.value / total : 0;
        return (
          <g key={it.key}>
            <circle cx="100" cy="100" r={r} fill="none" stroke="#e4ebdd" strokeWidth={stroke} />
            <circle
              cx="100" cy="100" r={r} fill="none" stroke={it.color} strokeWidth={stroke}
              strokeLinecap="round" strokeDasharray={`${len * frac} ${len}`}
              transform="rotate(-90 100 100)"
            />
          </g>
        );
      })}
      <text x="100" y="108" textAnchor="middle" className="dash-rings-total">{total}</text>
    </svg>
  );
}

// Légende : pastille de pourcentage, libellé, pointillés, valeur
function Legend({ items, total }) {
  return (
    <ul className="dash-legend">
      {items.map((it) => {
        const pct = total ? Math.round((it.value / total) * 100) : 0;
        return (
          <li key={it.key}>
            <span className="dash-chip" style={{ background: `${it.color}22`, color: it.color }}>{pct}%</span>
            <span className="dash-legend-label">{it.label}</span>
            <span className="dash-dots" aria-hidden="true" />
            <strong>{it.value}</strong>
          </li>
        );
      })}
    </ul>
  );
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/admin/stats')
      .then((res) => setStats(res.data.data ?? res.data))
      .catch(() => setError(true));
  }, []);

  const label = (k) => t(`admin.stats.${k}`, { defaultValue: k.replace(/_/g, ' ') });
  const fmt = (v) => n(v).toLocaleString(i18n.language);

  if (error) return <p className="alert alert-error" role="alert">{t('admin.dashboard.loadError')}</p>;
  if (!stats) return <p className="muted" role="status">…</p>;

  const users = stats.users || {};
  const biz = stats.businesses || {};
  const pend = stats.pending || {};

  // --- Cartes du haut ---
  const kpis = [
    { key: 'users', icon: Users, value: users.total, text: `${label('users')} · ${label('total')}`, color: COLORS.plum },
    { key: 'businesses', icon: Store, value: biz.total, text: `${label('businesses')} · ${label('total')}`, color: COLORS.green },
    { key: 'reports_open', icon: Flag, value: stats.reports_open, text: label('reports_open'), color: COLORS.clay },
    { key: 'conversations', icon: MessageCircle, value: stats.conversations, text: label('conversations'), color: COLORS.gold },
    { key: 'messages', icon: Mail, value: stats.messages, text: label('messages'), color: COLORS.plum2 },
  ];

  // --- Fiches par statut ---
  const bizItems = [
    { key: 'approved', value: n(biz.approved), color: COLORS.green, label: t('admin.status.approved') },
    { key: 'pending', value: n(biz.pending), color: COLORS.gold, label: t('admin.status.pending') },
    { key: 'rejected', value: n(biz.rejected), color: COLORS.clay, label: t('admin.status.rejected') },
  ];
  const bizTotal = n(biz.total) || bizItems.reduce((s, i) => s + i.value, 0);

  // --- Comptes par rôle (ou actifs / suspendus si by_role est absent) ---
  const byRole = users.by_role;
  const roleEntries = Array.isArray(byRole)
    ? byRole.map((r) => [r.role, n(r.count ?? r.total)])
    : Object.entries(byRole || {}).map(([k, v]) => [k, n(v)]);
  const roleColors = [COLORS.plum, COLORS.green, COLORS.gold, COLORS.clay];
  const userTotal = n(users.total);
  const userItems = roleEntries.length
    ? roleEntries.map(([role, value], i) => ({
        key: role, value, color: roleColors[i % roleColors.length], label: t(`admin.roles.${role}`, { defaultValue: role }),
      }))
    : [
        { key: 'active', value: Math.max(userTotal - n(users.suspended), 0), color: COLORS.green, label: t('admin.status.active') },
        { key: 'suspended', value: n(users.suspended), color: COLORS.clay, label: t('admin.status.suspended') },
      ];
  const suspendedPct = userTotal ? Math.round((n(users.suspended) / userTotal) * 100) : 0;

  // --- À traiter : histogramme ---
  const todo = [
    { key: 'reviews', value: n(pend.reviews), color: COLORS.plum },
    { key: 'photos', value: n(pend.photos), color: COLORS.green },
    { key: 'claims', value: n(pend.claims), color: COLORS.gold },
    { key: 'reports_open', value: n(stats.reports_open), color: COLORS.clay },
  ];
  const todoMax = Math.max(...todo.map((x) => x.value), 1);
  const todoTotal = todo.reduce((s, x) => s + x.value, 0);

  // --- Messagerie : messages par conversation ---
  const convs = n(stats.conversations);
  const msgs = n(stats.messages);
  const perConv = convs ? (msgs / convs).toLocaleString(i18n.language, { maximumFractionDigits: 1 }) : '0';

  return (
    <>
      <h1 className="admin-h1">{t('admin.nav.dashboard')}</h1>

      <div className="dash-kpis">
        {kpis.map(({ key, icon: Icon, value, text, color }) => (
          <div key={key} className="panel dash-kpi">
            <span className="dash-kpi-icon" style={{ background: `${color}1f`, color }}>
              <Icon size={18} aria-hidden="true" />
            </span>
            <span className="dash-kpi-text">{text}</span>
            <strong>{fmt(value)}</strong>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <section className="panel dash-card">
          <h2>{label('businesses')}</h2>
          <div className="dash-split">
            <Rings items={bizItems} total={bizTotal} label={label('businesses')} />
            <Legend items={bizItems} total={bizTotal} />
          </div>
        </section>

        <section className="panel dash-card">
          <h2>{label('users')}</h2>
          <div className="dash-split">
            <Rings items={userItems} total={userTotal} label={label('users')} />
            <Legend items={userItems} total={userTotal} />
          </div>
          <div className="dash-limit">
            <div className="dash-limit-head">
              <span>{label('suspended')}</span>
              <strong>{fmt(users.suspended)} / {fmt(userTotal)}</strong>
              <span>{suspendedPct}%</span>
            </div>
            <div className="dash-track"><div className="dash-fill" style={{ width: `${suspendedPct}%` }} /></div>
          </div>
        </section>

        <section className="panel dash-card">
          <h2>{label('pending')}</h2>
          <p className="dash-big">{fmt(todoTotal)}</p>
          <div className="dash-bars" role="img" aria-label={label('pending')}>
            {todo.map((x) => (
              <div key={x.key} className="dash-bar-col">
                <span className="dash-bar-val">{x.value}</span>
                <div className="dash-bar-zone">
                  <div
                    className="dash-bar"
                    style={{ height: `${Math.max((x.value / todoMax) * 100, 4)}%`, background: `linear-gradient(180deg, ${x.color}, ${x.color}88)` }}
                  />
                </div>
                <span className="dash-bar-label">{label(x.key)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel dash-card">
          <h2>{label('conversations')}</h2>
          <div className="dash-msg">
            <div><strong>{fmt(convs)}</strong><span>{label('conversations')}</span></div>
            <div><strong>{fmt(msgs)}</strong><span>{label('messages')}</span></div>
            <div><strong>{perConv}</strong><span>{label('messages')} / {label('conversations')}</span></div>
          </div>
        </section>
      </div>
    </>
  );
}
