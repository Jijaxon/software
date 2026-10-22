import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import uz from "./uz.js";
import ru from "./ru.js";
import {setPriceLocale} from "@/lib/utils";

const dictionaries = {uz, ru};
export const LANGUAGES = [
  {id: "uz", label: "O'zbekcha", short: "UZ"},
  {id: "ru", label: "Русский", short: "RU"},
];

const STORAGE_KEY = "nafis-lang";

function detectInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && dictionaries[saved]) return saved;
  return navigator.language?.toLowerCase().startsWith("ru") ? "ru" : "uz";
}

const LanguageContext = createContext({lang: "uz", setLang: () => {}, t: (key) => key});

export function LanguageProvider({children}) {
  const [lang, setLang] = useState(detectInitialLanguage);
  // formatPrice() bolalar render qilinishidan oldin to'g'ri valyuta yozuvini bilsin
  setPriceLocale(lang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // t("product.onlyLeft", {count: 2}) -> "Faqat 2 ta qoldi"
  const t = useCallback((key, vars) => {
    let text = dictionaries[lang]?.[key] ?? dictionaries.uz[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, value);
      }
    }
    return text;
  }, [lang]);

  const value = useMemo(() => ({lang, setLang, t}), [lang, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useT() {
  return useContext(LanguageContext);
}
