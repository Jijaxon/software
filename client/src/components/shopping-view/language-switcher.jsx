import {LANGUAGES, useT} from "@/i18n/index.jsx";

// UZ / RU almashtirgich
function LanguageSwitcher({className = ""}) {
  const {lang, setLang} = useT();

  return (
    <div className={`flex items-center rounded-full border border-sand bg-white/70 p-0.5 ${className}`}>
      {LANGUAGES.map((item) => (
        <button
          key={item.id}
          onClick={() => setLang(item.id)}
          title={item.label}
          aria-pressed={lang === item.id}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-all duration-300 ${
            lang === item.id ? "bg-espresso text-ivory" : "text-mocha hover:text-espresso"
          }`}
        >
          {item.short}
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
