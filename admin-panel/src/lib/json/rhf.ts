// =============================================================
// FILE: src/lib/json/rhf.ts
// FINAL — shared helpers for RHF + i18n adapter usage (hardened)
// - safeObject is stricter (plain object only)
// =============================================================

/**
 * RHF setValue typed union key bekler.
 * Bizim adapter ise string key (name_tr vs) basıyor.
 * Bu wrapper ile tüm formlarda TS build hatasını tek yerden çözeriz.
 */
export function makeRHFSetValueAny<TFormValues>(setValue: any) {
  return (name: string, value: any, options?: any) => {
    setValue(name as any, value as any, options as any);
  };
}

function isPlainObject(v: any): v is Record<string, any> {
  if (!v || typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

/** Safe object guard (plain object only) */
export function safeObject(v: any): Record<string, any> {
  return isPlainObject(v) ? v : {};
}
