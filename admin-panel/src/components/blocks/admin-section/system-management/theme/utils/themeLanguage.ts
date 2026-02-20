import multiLang from "@/components/molecules/multiLang.json";
import { Config } from "@/config";

type ThemeLang = {
  id: string;
  label: string;
  language_code?: string;
};

const toSafeLangs = (): ThemeLang[] => {
  if (!Array.isArray(multiLang)) return [];
  return (multiLang as ThemeLang[]).filter(
    (lang) => lang && typeof lang.id === "string" && lang.id.length > 0
  );
};

export const getThemeLanguageData = (): ThemeLang[] => {
  const langs = toSafeLangs();
  if (langs.length === 0) return [{ id: "df", label: "Default" }];

  if (langs.some((lang) => lang.id === "df")) return langs;

  const defaultLangId = Config.defaultLanguage;
  const defaultIndex = langs.findIndex((lang) => lang.id === defaultLangId);
  if (defaultIndex >= 0) {
    return langs.map((lang, idx) =>
      idx === defaultIndex ? { ...lang, id: "df" } : lang
    );
  }

  return langs.map((lang, idx) => (idx === 0 ? { ...lang, id: "df" } : lang));
};
