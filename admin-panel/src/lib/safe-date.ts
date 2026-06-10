import { format as dfFormat, isValid } from "date-fns";

/**
 * API'den gelen tarihleri (cogu MySQL "Y-m-d H:i:s" formati) Safari/WebKit'in
 * de ayristirabilecegi bir Date'e cevirir.
 *
 * Neden: `new Date("2026-06-09 14:00:00")` Chrome'da calisir ama Safari/iOS'ta
 * `Invalid Date` doner. Bu invalid Date date-fns `format()`'a verilince
 * `RangeError: Invalid time value` firlatir ve TUM sayfa c-oker (mobil admin
 * panel crash'inin kok nedeni). Bosluklu tarihi "T" ile ISO'ya cevirerek cozer.
 */
export function toSafeDate(
  input?: string | number | Date | null
): Date | null {
  if (input === null || input === undefined || input === "") return null;
  if (input instanceof Date) return isValid(input) ? input : null;
  if (typeof input === "number") {
    const d = new Date(input);
    return isValid(d) ? d : null;
  }
  // string: "2026-06-09 14:00:00" -> "2026-06-09T14:00:00" (Safari-safe)
  const normalized = input.includes("T") ? input : input.replace(" ", "T");
  let d = new Date(normalized);
  if (!isValid(d)) d = new Date(input); // son care: orijinali dene
  return isValid(d) ? d : null;
}

/**
 * Guvenli date-fns format. Gecersiz/bos tarihte HATA FIRLATMAZ, "" doner.
 * `format(stringDate, fmt)` yerine her yerde bunu kullan (Safari uyumu).
 */
export function safeFormat(
  input: string | number | Date | null | undefined,
  fmt: string
): string {
  const d = toSafeDate(input);
  return d ? dfFormat(d, fmt) : "";
}
