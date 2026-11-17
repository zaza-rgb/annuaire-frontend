import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.resolvedLanguage}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      aria-label="Language"
    >
      <option value="fr">FR</option>
      <option value="pt">PT</option>
      <option value="en">EN</option>
    </select>
  );
}