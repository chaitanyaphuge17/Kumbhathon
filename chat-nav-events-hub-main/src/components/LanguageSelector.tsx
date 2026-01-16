import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { languageNames, Language } from "@/lib/translations";

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition-colors border border-orange-200">
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{languageNames[language]}</span>
      </button>
      <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[120px] max-h-[300px] overflow-y-auto">
        {(Object.keys(languageNames) as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-orange-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              language === lang ? "bg-orange-100 text-orange-700 font-medium" : "text-gray-700"
            }`}
          >
            {languageNames[lang]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
