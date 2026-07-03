/**
 * i18n bootstrap — react-i18next. Detects language from localStorage
 * ("pamoja_lang") then falls back to navigator.language, then "en".
 *
 * Usage:
 *   import { useTranslation } from "react-i18next";
 *   const { t, i18n } = useTranslation();
 *   <p>{t("dashboard.welcome", { name: user.fullName })}</p>
 *
 * Add a new language: create ./locales/<code>.json, import here, extend the
 * SUPPORTED_LANGUAGES array + the Settings language switcher.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import sw from "./locales/sw.json";
import fr from "./locales/fr.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

function detectInitialLang(): LanguageCode {
  const stored = typeof window !== "undefined" ? localStorage.getItem("pamoja_lang") : null;
  if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) return stored as LanguageCode;
  const nav = typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "en";
  const match = SUPPORTED_LANGUAGES.find((l) => l.code === nav);
  return (match?.code ?? "en") as LanguageCode;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    sw: { translation: sw },
    fr: { translation: fr },
  },
  lng: detectInitialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") localStorage.setItem("pamoja_lang", lng);
  if (typeof document !== "undefined") document.documentElement.lang = lng;
});

export default i18n;
