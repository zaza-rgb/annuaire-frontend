import { useState } from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
];

export default function LanguageGate({ children }) {
  const { i18n } = useTranslation();
  const [chosen, setChosen] = useState(
    !!localStorage.getItem("afroponte_lang_chosen")
  );

  const choose = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("afroponte_lang_chosen", "1");
    setChosen(true);
  };

  if (chosen) return children;

  return (
    <div className="language-gate">
      <h1>AfroPonte</h1>
      <p>Choisissez votre langue · Escolha o idioma · Choose your language</p>
      <div>
        {LANGS.map((l) => (
          <button key={l.code} onClick={() => choose(l.code)}>
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}