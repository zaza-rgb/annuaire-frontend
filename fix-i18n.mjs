// Corrige fr.json, en.json et pt.json pour le tableau de bord commerçant.
// À lancer depuis le dossier annuaire-frontend :   node fix-i18n.mjs
// - met le bloc "dash" DANS "merchant" (et le retire du niveau principal s'il y est)
// - ajoute les clés manquantes dans "merchant.nav" sans toucher aux clés existantes
// - crée une sauvegarde fr.json.bak (une seule fois) avant de modifier chaque fichier
import fs from 'node:fs';
import path from 'node:path';
 
const DATA = {
  fr: {
    dash: {
      hello: 'Bonjour {{name}} !',
      fallbackName: 'chef',
      heroText: "Voici un aperçu de votre activité aujourd'hui.",
      overviewTitle: "Vue d'ensemble",
      listTitle: 'Mes établissements',
      quickTitle: 'Accès rapide',
      total: 'Établissements',
      approved: 'Approuvés',
      pending: 'En attente',
      reviews: 'Avis reçus',
      average: 'Note moyenne',
      messages: 'Messagerie',
    },
    nav: {
      menu: "Menu de l'espace commerçant",
      role: 'Commerçant',
      soon: 'Bientôt',
      backSite: 'Retour au site',
      logout: 'Déconnexion',
      business: 'Mon établissement',
      photos: 'Galerie photos',
      reviews: 'Mes avis',
      stats: 'Statistiques',
      notifications: 'Notifications',
      settings: 'Paramètres',
    },
  },
  en: {
    dash: {
      hello: 'Hello {{name}}!',
      fallbackName: 'there',
      heroText: 'Here is an overview of your activity today.',
      overviewTitle: 'Overview',
      listTitle: 'My businesses',
      quickTitle: 'Quick access',
      total: 'Businesses',
      approved: 'Approved',
      pending: 'Pending',
      reviews: 'Reviews received',
      average: 'Average rating',
      messages: 'Messages',
    },
    nav: {
      menu: 'Merchant area menu',
      role: 'Merchant',
      soon: 'Soon',
      backSite: 'Back to site',
      logout: 'Log out',
      business: 'My business',
      photos: 'Photo gallery',
      reviews: 'My reviews',
      stats: 'Statistics',
      notifications: 'Notifications',
      settings: 'Settings',
    },
  },
  pt: {
    dash: {
      hello: 'Olá, {{name}}!',
      fallbackName: 'comerciante',
      heroText: 'Aqui está um resumo da sua atividade hoje.',
      overviewTitle: 'Visão geral',
      listTitle: 'Meus estabelecimentos',
      quickTitle: 'Acesso rápido',
      total: 'Estabelecimentos',
      approved: 'Aprovados',
      pending: 'Pendentes',
      reviews: 'Avaliações recebidas',
      average: 'Nota média',
      messages: 'Mensagens',
    },
    nav: {
      menu: 'Menu da área do comerciante',
      role: 'Comerciante',
      soon: 'Em breve',
      backSite: 'Voltar ao site',
      logout: 'Sair',
      business: 'Meu estabelecimento',
      photos: 'Galeria de fotos',
      reviews: 'Minhas avaliações',
      stats: 'Estatísticas',
      notifications: 'Notificações',
      settings: 'Configurações',
    },
  },
};
 
function findFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'dist') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) findFiles(p, out);
    else if (/^(fr|en|pt)\.json$/.test(e.name)) out.push(p);
  }
  return out;
}
 
if (!fs.existsSync('src')) {
  console.error('Dossier "src" introuvable : lancez ce script depuis annuaire-frontend.');
  process.exit(1);
}
 
const files = findFiles('src');
const result = {};
if (files.length === 0) console.log('Aucun fr.json / en.json / pt.json trouvé dans src.');
 
for (const file of files) {
  const lang = path.basename(file, '.json');
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (e) {
    console.error(`✗ ${file} : JSON invalide, rien modifié. (${e.message})`);
    continue;
  }
 
  if (!fs.existsSync(file + '.bak')) fs.copyFileSync(file, file + '.bak');
 
  if (json.dash && typeof json.dash === 'object' && 'hello' in json.dash) delete json.dash;
  if (!json.merchant || typeof json.merchant !== 'object') json.merchant = {};
  json.merchant.dash = DATA[lang].dash;
  json.merchant.nav = { ...(json.merchant.nav || {}), ...DATA[lang].nav };
 
  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n', 'utf8');
  result[lang] = json;
  console.log(`✓ ${file} corrigé`);
}
 
// ---- Contrôle : clés de merchant présentes en français mais absentes en en / pt ----
function leaves(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) leaves(v, key, out);
    else out.push(key);
  }
  return out;
}
const has = (obj, dotted) => dotted.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj) !== undefined;
 
if (result.fr) {
  const frKeys = leaves(result.fr.merchant);
  for (const lang of ['en', 'pt']) {
    if (!result[lang]) {
      console.log(`! ${lang}.json non contrôlé (introuvable ou invalide).`);
      continue;
    }
    const missing = frKeys.filter((k) => !has(result[lang].merchant, k));
    if (missing.length === 0) console.log(`✓ ${lang}.json : toutes les clés merchant sont présentes.`);
    else {
      console.log(`! ${lang}.json : ${missing.length} clé(s) merchant manquante(s) (elles s'affichent en clair) :`);
      missing.forEach((k) => console.log(`    merchant.${k}`));
    }
  }
}
 
