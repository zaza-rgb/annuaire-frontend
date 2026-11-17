import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api';

export default function LanguageSelector({ name = 'language_id', value, onChange }) {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .get('/languages')
      .then((res) => setLanguages(res.data))
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return <p className="error">{t('languages.loadError')}</p>;
  }

  return (
    <select name={name} value={value ?? ''} onChange={onChange}>
      <option value="" disabled>{t('languages.choose')}</option>
      {languages.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}