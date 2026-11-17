import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  return (
    <select
      className="lang-select"
      value={i18n.resolvedLanguage}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label={t('languages.choose')}
    >
      <option value="fr">FR</option>
      <option value="pt">PT</option>
      <option value="en">EN</option>
    </select>
  );
}