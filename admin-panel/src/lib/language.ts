/**
 *
 * IMPORTANT:
 * - For each locale listed here, a corresponding JSON translation file
 *   must exist in the `/public/locales` directory (e.g., `en.json`, `tr.json`).
 * - If a locale is added here without a corresponding JSON file,
 *   fallback behavior should be handled to avoid runtime issues.
 *
 * Example:
 *   Adding "de" to this list requires creating `/public/locales/de.json`.
 *
 **/

export const availableLocales = ["tr", "en"] as const;

export function getLanguageName(locale: string): string {
  switch (locale) {
    case "tr":
      return "Turkish";
    case "en":
      return "English";
    default:
      return locale.toUpperCase();
  }
}
